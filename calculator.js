const PRORATE_BASE_DAYS = 30;

function roundToCents(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateCharges({
  monthlyRate,
  startDateParts,
  isOversized = false,
  isOversizedPlus = false,
  excludeLastMonth = false,
  useReducedTax = false,
}) {
  if (!Number.isFinite(monthlyRate)) {
    throw new Error('Invalid monthly rate');
  }

  if (
    !startDateParts ||
    !Number.isInteger(startDateParts.year) ||
    !Number.isInteger(startDateParts.month) ||
    !Number.isInteger(startDateParts.day)
  ) {
    throw new Error('Invalid start date');
  }

  const { year, month, day } = startDateParts;
  const startDay = day;
  const oversizedCharge = (isOversized ? 84.48 : 0) + (isOversizedPlus ? 105.60 : 0);
  const actualDaysInMonth = new Date(year, month, 0).getDate();

  if (month < 1 || month > 12 || startDay < 1 || startDay > actualDaysInMonth) {
    throw new Error('Invalid start date');
  }

  const prorateDays = startDay === 1 ? 0 : Math.max(0, actualDaysInMonth - startDay + 1);
  const proratedAmount = ((monthlyRate + oversizedCharge) * prorateDays) / PRORATE_BASE_DAYS;
  const lastMonthRate = excludeLastMonth ? 0 : monthlyRate;
  const taxRate = useReducedTax ? 0.10375 : 0.18375;

  const monthlyRateTaxedValue = roundToCents((monthlyRate + oversizedCharge) * (1 + taxRate));
  const proratedAmountTaxedValue = roundToCents(proratedAmount * (1 + taxRate));
  const lastMonthRateTaxedValue = roundToCents((lastMonthRate + oversizedCharge) * (1 + taxRate));
  const oversizedChargeTaxedValue = roundToCents(oversizedCharge * (1 + taxRate));

  const includeMonthly = startDay === 1 || startDay >= 20;
  const monthlyShownPre = includeMonthly ? monthlyRate.toFixed(2) : '0.00';
  const monthlyShownTaxed = includeMonthly ? monthlyRateTaxedValue.toFixed(2) : '0.00';
  const proratedAmountShown = prorateDays > 0 ? proratedAmount.toFixed(2) : '0.00';
  const proratedAmountTaxed = prorateDays > 0 ? proratedAmountTaxedValue.toFixed(2) : '0.00';
  const lastMonthRateTaxed = lastMonthRateTaxedValue.toFixed(2);
  const oversizedChargeTaxed = oversizedCharge ? oversizedChargeTaxedValue.toFixed(2) : '0.00';

  const totalWithTaxValue =
    (includeMonthly ? monthlyRateTaxedValue : 0) +
    (prorateDays > 0 ? proratedAmountTaxedValue : 0) +
    lastMonthRateTaxedValue;
  const totalWithTax = roundToCents(totalWithTaxValue).toFixed(2);

  return {
    startDay,
    actualDaysInMonth,
    prorateDays,
    proratedAmount,
    proratedAmountShown,
    proratedAmountTaxed,
    oversizedCharge,
    oversizedChargeTaxed,
    lastMonthRate,
    lastMonthRateTaxed,
    monthlyShownPre,
    monthlyShownTaxed,
    includeMonthly,
    totalWithTax,
    taxRate,
  };
}

export function parseDateInput(value) {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  return { year, month, day };
}

export { PRORATE_BASE_DAYS };
