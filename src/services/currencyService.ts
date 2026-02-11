// Centralized Currency Service - Single Source of Truth
// This service handles all currency operations and live exchange rates

interface ExchangeRates {
    [currency: string]: number;
}

interface CurrencyData {
    rates: ExchangeRates;
    base: string;
    lastUpdated: number;
}

const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const STORAGE_KEY = 'currency_rates_cache';
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Fallback rates in case API fails
const FALLBACK_RATES: ExchangeRates = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    PKR: 278.50,
    INR: 83.20,
    JPY: 149.50,
    CAD: 1.36,
    AUD: 1.52,
    CNY: 7.24,
    SAR: 3.75,
    AED: 3.67,
};

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    PKR: '₨',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CNY: '¥',
    SAR: 'SR',
    AED: 'د.إ',
};

// Currency names
export const CURRENCY_NAMES: Record<string, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    PKR: 'Pakistani Rupee',
    INR: 'Indian Rupee',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CNY: 'Chinese Yuan',
    SAR: 'Saudi Riyal',
    AED: 'UAE Dirham',
};

class CurrencyService {
    private rates: ExchangeRates = FALLBACK_RATES;
    private lastUpdated: number = 0;
    private isLoading: boolean = false;

    constructor() {
        this.loadFromCache();
    }

    /**
     * Load cached rates from localStorage
     */
    private loadFromCache(): void {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) {
                const data: CurrencyData = JSON.parse(cached);
                const age = Date.now() - data.lastUpdated;

                if (age < CACHE_DURATION) {
                    this.rates = data.rates;
                    this.lastUpdated = data.lastUpdated;
                    console.log('Currency rates loaded from cache');
                    return;
                }
            }
        } catch (error) {
            console.error('Failed to load cached rates:', error);
        }

        // If cache is invalid or missing, fetch fresh rates
        this.fetchRates();
    }

    /**
     * Save rates to localStorage cache
     */
    private saveToCache(): void {
        try {
            const data: CurrencyData = {
                rates: this.rates,
                base: 'USD',
                lastUpdated: this.lastUpdated,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to cache rates:', error);
        }
    }

    /**
     * Fetch live exchange rates from API
     */
    async fetchRates(): Promise<void> {
        if (this.isLoading) return;

        this.isLoading = true;
        console.log('Fetching live currency rates...');

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`API returned ${response.status}`);
            }

            const data = await response.json();

            if (data.rates) {
                this.rates = data.rates;
                this.lastUpdated = Date.now();
                this.saveToCache();
                console.log('Currency rates updated successfully');
            }
        } catch (error) {
            console.error('Failed to fetch currency rates, using fallback:', error);
            // Use fallback rates if API fails
            if (Object.keys(this.rates).length === 0) {
                this.rates = FALLBACK_RATES;
                this.lastUpdated = Date.now();
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Get current exchange rates
     */
    getRates(): ExchangeRates {
        // Auto-refresh if cache is old
        const age = Date.now() - this.lastUpdated;
        if (age > CACHE_DURATION && !this.isLoading) {
            this.fetchRates();
        }

        return this.rates;
    }

    /**
     * Convert amount from one currency to another
     * @param amount - Amount to convert
     * @param fromCurrency - Source currency code
     * @param toCurrency - Target currency code
     * @returns Converted amount
     */
    convert(amount: number, fromCurrency: string, toCurrency: string): number {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const rates = this.getRates();
        const fromRate = rates[fromCurrency] || 1;
        const toRate = rates[toCurrency] || 1;

        // Convert to USD first (base currency), then to target
        const usdAmount = amount / fromRate;
        const convertedAmount = usdAmount * toRate;

        return convertedAmount;
    }

    /**
     * Format amount with currency symbol
     * @param amount - Amount to format
     * @param currency - Currency code
     * @param showDecimals - Whether to show decimal places
     * @returns Formatted currency string
     */
    format(amount: number, currency: string, showDecimals: boolean = true): string {
        const symbol = CURRENCY_SYMBOLS[currency] || currency;
        const decimals = showDecimals ? 2 : 0;

        // Format with thousand separators
        const formattedAmount = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // For some currencies, symbol goes after the amount
        const symbolAfter = ['PKR', 'INR', 'SAR', 'AED'];
        if (symbolAfter.includes(currency)) {
            return `${formattedAmount} ${symbol}`;
        }

        return `${symbol}${formattedAmount}`;
    }

    /**
     * Convert and format in one step
     */
    convertAndFormat(
        amount: number,
        fromCurrency: string,
        toCurrency: string,
        showDecimals: boolean = true
    ): string {
        const converted = this.convert(amount, fromCurrency, toCurrency);
        return this.format(converted, toCurrency, showDecimals);
    }

    /**
     * Get all supported currencies
     */
    getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
        return Object.keys(CURRENCY_SYMBOLS).map(code => ({
            code,
            name: CURRENCY_NAMES[code] || code,
            symbol: CURRENCY_SYMBOLS[code],
        }));
    }

    /**
     * Check if currency is supported
     */
    isSupported(currency: string): boolean {
        return currency in CURRENCY_SYMBOLS;
    }

    /**
     * Get last update timestamp
     */
    getLastUpdated(): number {
        return this.lastUpdated;
    }

    /**
     * Force refresh rates
     */
    async refresh(): Promise<void> {
        await this.fetchRates();
    }
}

// Export singleton instance
export const currencyService = new CurrencyService();

// Export helper functions for convenience
export const convertCurrency = (amount: number, from: string, to: string) =>
    currencyService.convert(amount, from, to);

export const formatCurrency = (amount: number, currency: string, showDecimals = true) =>
    currencyService.format(amount, currency, showDecimals);

export const convertAndFormatCurrency = (amount: number, from: string, to: string, showDecimals = true) =>
    currencyService.convertAndFormat(amount, from, to, showDecimals);
