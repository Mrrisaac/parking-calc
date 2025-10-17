import { calculateCharges, parseDateInput } from './calculator.js';

function toggleOther(otherId, current) {
  const other = document.getElementById(otherId);
  if (other && current.checked) {
    other.checked = false;
  }
}

function calculateTotal() {
  const monthlyRateInput = document.getElementById('monthlyRate');
  const monthlyRate = parseFloat(monthlyRateInput.value);
  const startDateParts = parseDateInput(document.getElementById('startDate').value);

  if (!startDateParts) {
    document.getElementById('result').innerText = 'Please pick a start date.';
    return;
  }

  if (!Number.isFinite(monthlyRate)) {
    document.getElementById('result').innerText = 'Please enter valid inputs.';
    return;
  }

  try {
    const summary = calculateCharges({
      monthlyRate,
      startDateParts,
      isOversized: document.getElementById('oversized').checked,
      isOversizedPlus: document.getElementById('oversizedPlus').checked,
      excludeLastMonth: document.getElementById('excludeLastMonth').checked,
      useReducedTax: document.getElementById('useReducedTax').checked,
    });

    document.getElementById('result').innerHTML = `
      <strong>Summary:</strong>
      <table>
        <tr><th>Description</th><th>Pre-Tax</th><th>With Tax</th></tr>
        <tr><td>Monthly Rate</td><td>$${summary.monthlyShownPre}</td><td>$${summary.monthlyShownTaxed}</td></tr>
        <tr><td>Last Month Rate</td><td>$${summary.lastMonthRate.toFixed(2)}</td><td>$${summary.lastMonthRateTaxed}</td></tr>
        ${summary.prorateDays > 0
          ? `<tr><td>Prorated Amount (${summary.prorateLabel})</td><td>$${summary.proratedAmountShown}</td><td>$${summary.proratedAmountTaxed}</td></tr>`
          : ''}
        <tr><td>Oversized Charges</td><td>$${summary.oversizedCharge.toFixed(2)}</td><td>$${summary.oversizedChargeTaxed}</td></tr>
      </table>
      <strong>Total with Tax (${(summary.taxRate * 100).toFixed(3)}%): $${summary.totalWithTax}</strong>
    `;
  } catch (error) {
    document.getElementById('result').innerText = error.message;
  }
}

window.toggleOther = toggleOther;
window.calculateTotal = calculateTotal;
