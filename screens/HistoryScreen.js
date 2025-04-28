import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { getConversionHistory } from '../db';

const HistoryScreen = () => {
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadHistory = async () => {
        try {
            const data = await getConversionHistory();
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const renderItem = ({ item }) => (
        <View style={styles.historyItem}>
            <Text style={styles.historyText}>
                {item.amount} {item.from_currency} → {item.result.toFixed(2)} {item.to_currency}
            </Text>
            <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Conversion History</Text>
            {history.length === 0 ? (
                <Text style={styles.emptyText}>No conversion history</Text>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    historyItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#4a90e2',
    },
    historyText: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    historyDate: {
        fontSize: 12,
        color: '#777',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#777',
        fontSize: 16,
    },
});

export default HistoryScreen;