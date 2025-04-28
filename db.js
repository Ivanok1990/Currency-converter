import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('currencyConverter.db');

        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_currency TEXT NOT NULL,
        rates TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS conversion_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        amount REAL NOT NULL,
        result REAL NOT NULL,
        timestamp INTEGER NOT NULL
      );
      
      DELETE FROM exchange_rates WHERE timestamp < ${Date.now() - 2 * 24 * 60 * 60 * 1000};
      
      DELETE FROM conversion_history WHERE timestamp < ${Date.now() - 2 * 24 * 60 * 60 * 1000};
    `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

export const getExchangeRates = async (baseCurrency) => {
    try {
        if (!db) await initDatabase();

        const result = await db.getAllAsync(
            `SELECT rates, timestamp FROM exchange_rates WHERE base_currency = ?`,
            [baseCurrency]
        );

        if (result.length > 0) {
            const { rates, timestamp } = result[0];
            if (Date.now() - timestamp < 2 * 24 * 60 * 60 * 1000) {
                return JSON.parse(rates);
            }
        }
        return null;
    } catch (error) {
        console.error('Error getting exchange rates:', error);
        throw error;
    }
};

export const saveExchangeRates = async (baseCurrency, rates) => {
    try {
        if (!db) await initDatabase();

        await db.runAsync(
            `INSERT OR REPLACE INTO exchange_rates (base_currency, rates, timestamp) 
       VALUES (?, ?, ?)`,
            [baseCurrency, JSON.stringify(rates), Date.now()]
        );
    } catch (error) {
        console.error('Error saving exchange rates:', error);
        throw error;
    }
};

export const saveConversion = async (fromCurrency, toCurrency, amount, result) => {
    try {
        if (!db) await initDatabase();

        await db.runAsync(
            `INSERT INTO conversion_history 
       (from_currency, to_currency, amount, result, timestamp) 
       VALUES (?, ?, ?, ?, ?)`,
            [fromCurrency, toCurrency, amount, result, Date.now()]
        );
    } catch (error) {
        console.error('Error saving conversion:', error);
        throw error;
    }
};

export const getConversionHistory = async () => {
    try {
        if (!db) await initDatabase();

        return await db.getAllAsync(
            `SELECT * FROM conversion_history ORDER BY timestamp DESC`
        );
    } catch (error) {
        console.error('Error getting conversion history:', error);
        throw error;
    }
};