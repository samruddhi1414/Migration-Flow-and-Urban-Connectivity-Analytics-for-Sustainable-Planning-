/**
 * Min-Max Normalization Utility
 * Standardizes indicators across districts to a 0–100 scale.
 * Supports positive and reverse (negative) indicators.
 */

export function minMaxNormalize(values, reverse = false) {
  const validVals = values.filter(v => v !== null && v !== undefined && !isNaN(v));
  if (validVals.length === 0) return values.map(() => 50.0);
  
  const min = Math.min(...validVals);
  const max = Math.max(...validVals);

  if (max === min) {
    // Return 50 only for that specific indicator and mark it as no district variation
    return values.map(() => 50.0);
  }

  return values.map(v => {
    if (v === null || v === undefined || isNaN(v)) return 50.0;
    if (reverse) {
      // (maximum - value) / (maximum - minimum) * 100
      return Number((((max - v) / (max - min)) * 100).toFixed(2));
    }
    // (value - minimum) / (maximum - minimum) * 100
    return Number((((v - min) / (max - min)) * 100).toFixed(2));
  });
}
