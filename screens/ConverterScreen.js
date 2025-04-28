import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal, FlatList,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getExchangeRates, saveExchangeRates, saveConversion } from '../db';
import { fetchExchangeRates } from '../services/api';

const ConverterScreen = () => {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [currencies, setCurrencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'AUD']);
    const [isConverting, setIsConverting] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectingCurrency, setSelectingCurrency] = useState(null); // 'from' or 'to'

    useEffect(() => {
        const loadCurrencies = async () => {
            try {
                let rates = await getExchangeRates(fromCurrency);
                if (!rates) {
                    rates = await fetchExchangeRates(fromCurrency);
                    await saveExchangeRates(fromCurrency, rates);
                }
                setCurrencies(Object.keys(rates));
            } catch (err) {
                setError('Failed to load currencies');
            }
        };
        loadCurrencies();
    }, [fromCurrency]);

    const handleConvert = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            setError('Enter a valid positive amount');
            return;
        }

        setIsConverting(true);
        setError('');

        try {
            let rates = await getExchangeRates(fromCurrency);
            if (!rates) {
                rates = await fetchExchangeRates(fromCurrency);
                await saveExchangeRates(fromCurrency, rates);
            }

            if (!rates[toCurrency]) {
                setError('Exchange rate not available');
                return;
            }

            const convertedAmount = Number(amount) * rates[toCurrency];
            setResult(`${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
            await saveConversion(fromCurrency, toCurrency, amount, convertedAmount);
        } catch (error) {
            setError('Conversion failed');
        } finally {
            setIsConverting(false);
        }
    };

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setResult('');
        setError('');
    };

    const openCurrencyModal = (type) => {
        setSelectingCurrency(type);
        setModalVisible(true);
    };

    const selectCurrency = (currency) => {
        if (selectingCurrency === 'from') {
            setFromCurrency(currency);
        } else {
            setToCurrency(currency);
        }
        setModalVisible(false);
        setSelectingCurrency(null);
    };

    const renderCurrencyItem = ({ item }) => (
        <TouchableOpacity
            style={styles.currencyItem}
            onPress={() => selectCurrency(item)}
        >
            <Text style={styles.currencyText}>{item}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Currency Converter</Text>

            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
            />

            <View style={styles.currencyContainer}>
                <View style={styles.currencyWrapper}>
                    <Text style={styles.label}>From</Text>
                    <TouchableOpacity
                        style={styles.currencySelector}
                        onPress={() => openCurrencyModal('from')}
                    >
                        <Text style={styles.currencySelectorText}>{fromCurrency}</Text>
                        <Ionicons name="chevron-down" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.swapButton}
                    onPress={swapCurrencies}
                >
                    <Ionicons name="swap-vertical" size={24} color="#007AFF" />
                </TouchableOpacity>

                <View style={styles.currencyWrapper}>
                    <Text style={styles.label}>To</Text>
                    <TouchableOpacity
                        style={styles.currencySelector}
                        onPress={() => openCurrencyModal('to')}
                    >
                        <Text style={styles.currencySelectorText}>{toCurrency}</Text>
                        <Ionicons name="chevron-down" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.button, isConverting && styles.buttonDisabled]}
                onPress={handleConvert}
                disabled={isConverting}
            >
                {isConverting ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Convert</Text>
                )}
            </TouchableOpacity>

            {result ? (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            ) : null}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Currency</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={currencies}
                            renderItem={renderCurrencyItem}
                            keyExtractor={(item) => item}
                        />
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    input: {
        height: 48,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    inputError: {
        borderColor: '#ff0000',
    },
    currencyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    currencyWrapper: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    currencySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    currencySelectorText: {
        fontSize: 16,
    },
    swapButton: {
        padding: 8,
        marginHorizontal: 8,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonDisabled: {
        backgroundColor: '#99ccff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: '#ff0000',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    resultContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
    resultText: {
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: '50%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    currencyItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    currencyText: {
        fontSize: 16,
    },
});

export default ConverterScreen;