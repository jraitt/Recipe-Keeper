/**
 * Parse a quantity string that may contain fractions, decimals, or mixed numbers
 * Examples:
 * - "1/2" -> 0.5
 * - "1.5" -> 1.5
 * - "1 1/2" -> 1.5
 * - "3/4" -> 0.75
 * - "2" -> 2
 */
export function parseQuantity(quantity: string | number | undefined): number {
  if (quantity === undefined || quantity === null || quantity === '') {
    return 0;
  }

  // If it's already a number, return it
  if (typeof quantity === 'number') {
    return quantity;
  }

  // Convert to string and trim
  const str = String(quantity).trim();

  // Check for mixed number format (e.g., "1 1/2")
  const mixedMatch = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const numerator = parseInt(mixedMatch[2], 10);
    const denominator = parseInt(mixedMatch[3], 10);
    return whole + (numerator / denominator);
  }

  // Check for simple fraction (e.g., "1/2")
  const fractionMatch = str.match(/^(\d+)\/(\d+)$/);
  if (fractionMatch) {
    const numerator = parseInt(fractionMatch[1], 10);
    const denominator = parseInt(fractionMatch[2], 10);
    return numerator / denominator;
  }

  // Otherwise, parse as decimal
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a decimal number as a fraction string for display
 * Examples:
 * - 0.5 -> "1/2"
 * - 0.25 -> "1/4"
 * - 1.5 -> "1 1/2"
 * - 2 -> "2"
 */
export function formatQuantity(value: number, precision: number = 2): string {
  if (value === 0) return '0';

  // Handle whole numbers
  if (Number.isInteger(value)) {
    return value.toString();
  }

  // Common fractions for cooking
  const commonFractions: [number, string][] = [
    [0.125, '1/8'],
    [0.25, '1/4'],
    [0.333, '1/3'],
    [0.375, '3/8'],
    [0.5, '1/2'],
    [0.625, '5/8'],
    [0.666, '2/3'],
    [0.75, '3/4'],
    [0.875, '7/8'],
  ];

  const whole = Math.floor(value);
  const decimal = value - whole;

  // Try to match to a common fraction
  for (const [decimalVal, fractionStr] of commonFractions) {
    if (Math.abs(decimal - decimalVal) < 0.01) {
      return whole > 0 ? `${whole} ${fractionStr}` : fractionStr;
    }
  }

  // If no common fraction matches, use decimal notation
  return value.toFixed(precision).replace(/\.?0+$/, '');
}
