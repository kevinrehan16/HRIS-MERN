import { describe, it, expect } from 'vitest';
import { calculateWithholdingTax } from '../src/services/statutory.service';

describe('calculateWithholdingTax', () => {
  it('should return 0 for negative income', () => {
    expect(calculateWithholdingTax(-1000)).toBe(0);
    expect(calculateWithholdingTax(-50000)).toBe(0);
  });

  it('should return 0 for zero income', () => {
    expect(calculateWithholdingTax(0)).toBe(0);
  });

  it('should return 0 for income up to 20833', () => {
    expect(calculateWithholdingTax(20833)).toBe(0);
    expect(calculateWithholdingTax(10000)).toBe(0);
  });

  it('should calculate correct TRAIN law tax for 150000', () => {
    const tax = calculateWithholdingTax(150000);
    expect(tax).toBeCloseTo(29374.92, 2);
  });

  it('should calculate tax for other brackets', () => {
    // Bracket 1: 20,834 to 33,333 -> 15%
    expect(calculateWithholdingTax(25000)).toBeCloseTo(625.05, 2);

    // Bracket 2: 33,334 to 66,667 -> 1875 + 20%
    expect(calculateWithholdingTax(50000)).toBeCloseTo(5208.4, 2);

    // Bracket 3: 66,668 to 166,667 -> 8541.67 + 25%
    expect(calculateWithholdingTax(100000)).toBeCloseTo(16874.92, 2);

    // Bracket 4: 166,668 to 666,667 -> 33541.67 + 30%
    expect(calculateWithholdingTax(200000)).toBeCloseTo(43541.57, 2);

    // Bracket 5: Over 666,667 -> 183541.67 + 35%
    expect(calculateWithholdingTax(700000)).toBeCloseTo(195208.22, 2);
  });
});