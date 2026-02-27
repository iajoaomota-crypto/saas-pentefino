/**
 * Financial utilities for PenteFino
 * To prevent floating point errors (like 0.1 + 0.2 = 0.30000000000000004),
 * all calculations are performed in cents (integers) and converted back for display.
 */

/**
 * Converts a decimal value (e.g., 10.50) to cents (e.g., 1050).
 */
export const toCents = (value: number | string): number => {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
};

/**
 * Converts cents (e.g., 1050) back to a decimal value (e.g., 10.50).
 */
export const fromCents = (cents: number): number => {
    return cents / 100;
};

/**
 * Formats a number or string as BRL currency.
 */
export const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(num || 0);
};

/**
 * Sums an array of amounts safely.
 */
export const sumAmounts = (amounts: (number | string)[]): number => {
    const totalCents = amounts.reduce((acc, curr) => acc + toCents(curr), 0);
    return fromCents(totalCents);
};

/**
 * Calculates a percentage safely.
 */
export const calculatePercentage = (value: number | string, percentage: number): number => {
    const valueCents = toCents(value);
    const resultCents = Math.round((valueCents * percentage) / 100);
    return fromCents(resultCents);
};
