import axios from 'axios';

const BASE_URL = `https://v6.exchangerate-api.com/v6/dbcff76003c2b18e41ae3ede/latest`;
export const fetchExchangeRates = async (baseCurrency) => {
    try {
        const response = await axios.get(`${BASE_URL}/${baseCurrency}`);
        if (response.data.result === 'success') {
            return response.data.conversion_rates;
        }
        throw new Error('Failed to fetch exchange rates');
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};