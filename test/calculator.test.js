import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCharges, parseDateInput } from '../calculator.js';

describe('parseDateInput', () => {
  test('parses valid yyyy-mm-dd string', () => {
    assert.deepEqual(parseDateInput('2024-08-31'), { year: 2024, month: 8, day: 31 });
  });

  test('returns null for invalid input', () => {
    assert.equal(parseDateInput(''), null);
    assert.equal(parseDateInput('invalid'), null);
  });
});

describe('calculateCharges', () => {
  const baseInput = {
    monthlyRate: 300,
    startDateParts: { year: 2024, month: 8, day: 31 },
    isOversized: false,
    isOversizedPlus: false,
    excludeLastMonth: true,
    useReducedTax: false,
  };

  test('charges for the 31st day in a 31-day month', () => {
    const result = calculateCharges(baseInput);
    assert.equal(result.prorateDays, 1);
    assert.equal(result.proratedAmount.toFixed(2), '10.00');
    assert.equal(result.prorateLabel, '1 day (Aug 31)');
  });

  test('charges for both the 30th and 31st days in a 31-day month', () => {
    const result = calculateCharges({
      ...baseInput,
      monthlyRate: 485.74,
      startDateParts: { year: 2024, month: 10, day: 30 },
    });

    assert.equal(result.prorateDays, 2);
    assert.equal(result.proratedAmountShown, '32.38');
    assert.equal(result.prorateLabel, '2 days (Oct 30-31)');
  });

  test('uses the remaining days of the actual month when prorating', () => {
    const result = calculateCharges({
      ...baseInput,
      startDateParts: { year: 2024, month: 4, day: 15 },
    });
    assert.equal(result.prorateDays, 16);
    assert.equal(result.proratedAmount.toFixed(2), '160.00');
    assert.equal(result.prorateLabel, '16 days (Apr 15-30)');
  });

  test('handles first-of-month start with no prorate', () => {
    const result = calculateCharges({
      ...baseInput,
      startDateParts: { year: 2024, month: 9, day: 1 },
    });
    assert.equal(result.prorateDays, 0);
    assert.equal(result.proratedAmount.toFixed(2), '0.00');
  });

  test('rounds tax amounts to the nearest cent', () => {
    const result = calculateCharges({
      monthlyRate: 300,
      startDateParts: { year: 2024, month: 5, day: 1 },
      excludeLastMonth: false,
    });

    assert.equal(result.monthlyShownTaxed, '355.13');
    assert.equal(result.lastMonthRateTaxed, '355.13');
    assert.equal(result.proratedAmountTaxed, '0.00');
    assert.equal(result.totalWithTax, '710.26');
  });
});
