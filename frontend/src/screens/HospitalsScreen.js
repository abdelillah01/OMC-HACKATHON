import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import MainLayout from '../components/MainLayout';

const fetchHospitals = async (lat, lon) => {
  try {
    const results = await fetchFromNominatim(lat, lon);
    if (results.length > 0) return results;
  } catch (e) {
    console.warn('Nominatim failed, trying Overpass:', e.message);
  }
  return fetchFromOverpass(lat, lon);
};

const fetchFromNominatim = async (lat, lon) => {
  const bbox = getBBox(lat, lon, 5000);
  const url =
    `https://nominatim.openstreetmap.org/search?` +
    `format=json&q=hospital&bounded=1&limit=30` +
    `&viewbox=${bbox.lonMin},${bbox.latMax},${bbox.lonMax},${bbox.latMin}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PEXILIS-Health-App/1.0',
      'Accept': 'application/json',
    },
  });

  const text = await res.text();
  if (!text.startsWith('[')) {
    throw new Error('Non-JSON response');
  }

  return JSON.parse(text).map((place, i) => ({
    id: String(place.place_id || i),
    name: place.display_name?.split(',')[0] || 'Hospital',
    address: place.display_name?.split(',').slice(1, 3).join(',').trim() || '',
    latitude: parseFloat(place.lat),
    longitude: parseFloat(place.lon),
  })).filter((h) => !isNaN(h.latitude) && !isNaN(h.longitude));
};

const fetchFromOverpass = async (lat, lon) => {
  const radius = 5000;
  const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${radius},${lat},${lon});way["amenity"="hospital"](around:${radius},${lat},${lon}););out center 30;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  const text = await res.text();
  if (!text.startsWith('{')) {
    throw new Error('Overpass returned non-JSON');
  }

  const data = JSON.parse(text);

  return (data.elements || []).map((el, i) => {
    const elLat = el.lat || el.center?.lat;
    const elLon = el.lon || el.center?.lon;
    return {
      id: String(el.id || i),
      name: el.tags?.name || 'Hospital',
      address: el.tags?.['addr:street'] || el.tags?.['addr:city'] || '',
      latitude: parseFloat(elLat),
      longitude: parseFloat(elLon),
    };
  }).filter((h) => !isNaN(h.latitude) && !isNaN(h.longitude));
};

const getBBox = (lat, lon, radiusMeters) => {
  const dLat = radiusMeters / 111320;
  const dLon = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
  return {
    latMin: lat - dLat,
    latMax: lat + dLat,
    lonMin: lon - dLon,
    lonMax: lon + dLon,
  };
};

export default function HospitalsScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (mounted) {
            setError('Location permission denied. Please enable it in settings.');
            setLoading(false);
          }
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        if (mounted) setLocation(coords);

        const results = await fetchHospitals(coords.latitude, coords.longitude);
        if (mounted) setHospitals(results);
      } catch (err) {
        console.error('Hospital load error:', err);
        if (mounted) setError('Failed to load hospitals. Check your connection.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9b1c1c" />
        <Text style={styles.loadingText}>Finding hospitals near you...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <MainLayout navigation={navigation} noScroll>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {hospitals.map((h) => (
          <Marker
            key={h.id}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            title={h.name}
            description={h.address}
            pinColor="#9b1c1c"
            onPress={() => setSelectedHospital(h)}
          />
        ))}
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoTitle}>
          {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} nearby
        </Text>
      </View>

      {selectedHospital && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.hospitalIcon}>🏥</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.hospitalName}>{selectedHospital.name}</Text>
              <Text style={styles.hospitalAddress}>{selectedHospital.address}</Text>
            </View>
          </View>
          {selectedHospital.address ? (
            <Text style={styles.hospitalDistance}>
              {selectedHospital.address}
            </Text>
          ) : null}
        </View>
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: '#fff8dc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#8c7a5e',
    fontSize: 15,
    marginTop: 16,
    fontFamily: 'Jersey20',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#283618',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: 'Jersey20',
  },
  retryBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  map: {
    flex: 1,
  },
  infoBar: {
    backgroundColor: '#fff8ec',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1.5,
    borderTopColor: '#8c9b6b',
  },
  infoTitle: {
    color: '#283618',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  card: {
    backgroundColor: '#fff8ec',
    padding: 16,
    borderTopWidth: 1.5,
    borderTopColor: '#8c9b6b',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  hospitalIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  hospitalName: {
    color: '#283618',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
    fontFamily: 'Jersey20',
  },
  hospitalAddress: {
    color: '#8c7a5e',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Jersey20',
  },
  hospitalDistance: {
    color: '#8c7a5e',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 40,
    fontFamily: 'Jersey20',
  },
});
