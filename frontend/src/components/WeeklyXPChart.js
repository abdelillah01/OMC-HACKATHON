import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getWeeklyXP } from '../services/dailyCheckService';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function WeeklyXPChart({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    setLoading(true);
    getWeeklyXP(userId)
      .then((days) => {
        if (mounted) setData(days);
      })
      .catch((err) => console.error('Weekly XP error:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Weekly XP</Text>
        <ActivityIndicator color="#e94560" style={{ marginVertical: 30 }} />
      </View>
    );
  }

  if (!data || data.length === 0) return null;

  const totalXP = data.reduce((sum, d) => sum + d.xp, 0);
  const maxXP = Math.max(...data.map((d) => d.xp));

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.xp),
        color: () => '#e94560',
        strokeWidth: 2.5,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Weekly XP</Text>
        <Text style={styles.total}>{totalXP} XP this week</Text>
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 56}
          height={180}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withShadow={false}
          fromZero={true}
          segments={3}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: '#16213e',
            backgroundGradientFrom: '#16213e',
            backgroundGradientTo: '#16213e',
            decimalPlaces: 0,
            color: () => 'rgba(233, 69, 96, 0.3)',
            labelColor: () => '#888',
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#e94560',
              fill: '#1a1a2e',
            },
            propsForBackgroundLines: {
              stroke: '#0f3460',
              strokeWidth: 0.5,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {maxXP > 0 && (
        <Text style={styles.bestDay}>
          Best day: {data.find((d) => d.xp === maxXP)?.label} ({maxXP} XP)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: '700',
  },
  total: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '600',
  },
  chartWrapper: {
    alignItems: 'center',
    marginHorizontal: -8,
  },
  chart: {
    borderRadius: 12,
  },
  bestDay: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
