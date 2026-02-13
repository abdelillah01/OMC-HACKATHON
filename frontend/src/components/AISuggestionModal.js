import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function AISuggestionModal({ visible, suggestion, onClose, onAccept }) {
    if (!suggestion || !visible) return null;

    const isHarder = suggestion.type === 'ADD';

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.title}>
                        {isHarder ? "Level Up Available! ⚔️" : "Reset & Recharge 🛡️"}
                    </Text>

                    <View style={styles.mascotContainer}>
                        <Image
                            source={require('../assets/trainer.png')}
                            style={styles.mascot}
                        />
                        <View style={styles.bubble}>
                            <Text style={styles.message}>{suggestion.reason}</Text>
                        </View>
                    </View>

                    <View style={styles.actionContainer}>
                        {isHarder ? (
                            <View style={styles.habitCard}>
                                <Text style={styles.habitTitle}>{suggestion.add.title}</Text>
                                <Text style={styles.xpReward}>+{suggestion.add.xpReward} XP</Text>
                            </View>
                        ) : (
                            <View>
                                <Text style={styles.subtext}>Proposed Change:</Text>
                                <View style={styles.switchRow}>
                                    <Text style={[styles.habitTitle, { textDecorationLine: 'line-through', color: '#888' }]}>
                                        {suggestion.remove.title}
                                    </Text>
                                    <Text style={{ fontSize: 20 }}> ➡️ </Text>
                                    <Text style={styles.habitTitle}>{suggestion.add.title}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Keep Current Plan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
                            <Text style={styles.acceptText}>
                                {isHarder ? "Accept Challenge!" : "Update Plan"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalView: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    title: {
        fontFamily: 'Jersey20',
        fontSize: 28,
        marginBottom: 15,
        textAlign: "center",
        color: '#283618',
    },
    mascotContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    mascot: {
        width: 60,
        height: 80,
        resizeMode: 'contain',
    },
    bubble: {
        backgroundColor: '#fefae0',
        borderRadius: 15,
        padding: 10,
        marginLeft: 10,
        flex: 1,
        borderWidth: 1,
        borderColor: '#dcdcdc',
    },
    message: {
        fontFamily: 'Jersey20',
        fontSize: 18,
        color: '#000',
    },
    actionContainer: {
        width: '100%',
        backgroundColor: '#f2f3e8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    habitCard: {
        alignItems: 'center',
    },
    habitTitle: {
        fontFamily: 'Jersey20',
        fontSize: 22,
        color: '#000',
        textAlign: 'center',
    },
    xpReward: {
        color: '#2ecc71',
        fontWeight: 'bold',
        marginTop: 5,
    },
    subtext: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
        textAlign: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#888',
        alignItems: 'center',
    },
    cancelText: {
        color: '#666',
        fontWeight: 'bold',
    },
    acceptButton: {
        flex: 1,
        backgroundColor: '#283618',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    acceptText: {
        color: '#fff',
        fontWeight: 'bold',
        fontFamily: 'Jersey20',
        fontSize: 18,
    },
});
