// Legacy currency converter - now uses centralized service
// This file is kept for backward compatibility
// All new code should import directly from '../services/currencyService'

import {
  currencyService,
  convertCurrency as serviceConvert,
  formatCurrency as serviceFormat,
  convertAndFormatCurrency as serviceConvertAndFormat,
  CURRENCY_SYMBOLS,
} from '../services/currencyService';

// Re-export for backward compatibility
export const CURRENCY_RATES = currencyService.getRates();

export { CURRENCY_SYMBOLS };

/**
 * Convert an amount from one currency to another
 * @deprecated Use currencyService.convert() instead
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  return serviceConvert(amount, fromCurrency, toCurrency);
}

/**
 * Format an amount with the appropriate currency symbol
 * @deprecated Use currencyService.format() instead
 */
export function formatCurrency(
  amount: number,
  currency: string,
  showDecimals: boolean = true
): string {
  return serviceFormat(amount, currency, showDecimals);
}

/**
 * Convert and format currency in one step
 * @deprecated Use currencyService.convertAndFormat() instead
 */
export function convertAndFormatCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  showDecimals: boolean = true
): string {
  return serviceConvertAndFormat(amount, fromCurrency, toCurrency, showDecimals);
}

/**
 * Get all supported currencies with their symbols
 * @deprecated Use currencyService.getSupportedCurrencies() instead
 */
export function getSupportedCurrencies() {
  return currencyService.getSupportedCurrencies();
}
