(function initializeRateInputMode() {
  const monthlyRateInput = document.getElementById('monthlyRate');
  const reducedTaxCheckbox = document.getElementById('useReducedTax');
  const originalCalculateTotal = window.calculateTotal;

  if (!monthlyRateInput || !reducedTaxCheckbox || typeof originalCalculateTotal !== 'function') return;
  if (document.getElementById('rateIncludesTax')) return;

  const style = document.createElement('style');
  style.textContent = `
    .rate-mode {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: center;
      margin-top: 11px;
      padding: 13px;
      border: 1px solid var(--line, #dce4de);
      border-radius: 13px;
      background: #fff;
      transition: background .2s, border-color .2s, box-shadow .2s;
    }

    .rate-mode.active {
      background: var(--green-050, #f5faf6);
      border-color: rgba(18, 100, 55, .35);
      box-shadow: 0 0 0 3px rgba(26, 122, 67, .06);
    }

    .rate-mode-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      background: var(--green-100, #eaf4ed);
      color: var(--green-700, #126437);
      font-size: 19px;
    }

    .rate-mode-copy strong {
      display: block;
      color: var(--green-900, #083e24);
      font-size: 14px;
      line-height: 1.25;
    }

    .rate-mode-copy span {
      display: block;
      margin-top: 3px;
      color: var(--muted, #6d766f);
      font-size: 12px;
      line-height: 1.35;
    }

    .rate-toggle-switch {
      position: relative;
      display: inline-block;
      width: 52px;
      height: 30px;
      flex: 0 0 auto;
      cursor: pointer;
    }

    .rate-toggle-switch input {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
    }

    .rate-toggle-slider {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: #c5cec8;
      transition: background .2s, box-shadow .2s;
    }

    .rate-toggle-slider::before {
      content: "";
      position: absolute;
      width: 24px;
      height: 24px;
      left: 3px;
      top: 3px;
      border-radius: 50%;
      background: white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, .22);
      transition: transform .2s;
    }

    .rate-toggle-switch input:checked + .rate-toggle-slider {
      background: var(--green-700, #126437);
    }

    .rate-toggle-switch input:checked + .rate-toggle-slider::before {
      transform: translateX(22px);
    }

    .rate-toggle-switch input:focus-visible + .rate-toggle-slider {
      box-shadow: 0 0 0 3px rgba(26, 122, 67, .18);
    }

    .rate-mode-help {
      min-height: 18px;
      margin: 8px 3px 0;
      color: var(--muted, #6d766f);
      font-size: 12px;
      line-height: 1.4;
    }

    .rate-mode-help strong {
      color: var(--green-800, #0d4d2b);
    }

    .rate-conversion-note {
      background: #f0f7f2 !important;
      border-color: #d7e8db !important;
    }

    @media (max-width: 520px) {
      .rate-mode {
        gap: 10px;
      }

      .rate-mode-copy span {
        font-size: 11.5px;
      }
    }
  `;
  document.head.appendChild(style);

  const field = monthlyRateInput.closest('.field') || monthlyRateInput.parentElement;
  const inputWrap = monthlyRateInput.closest('.input-wrap') || monthlyRateInput;
  const monthlyRateLabel = field ? field.querySelector('label.field-label') : null;

  const rateModeCard = document.createElement('div');
  rateModeCard.id = 'rateModeCard';
  rateModeCard.className = 'rate-mode';
  rateModeCard.innerHTML = `
    <span class="rate-mode-icon">🧾</span>
    <span class="rate-mode-copy">
      <strong>Rate entered includes tax</strong>
      <span>Turn this on when you only have the customer's final monthly rate.</span>
    </span>
    <label class="rate-toggle-switch" aria-label="Rate entered includes tax">
      <input type="checkbox" id="rateIncludesTax" />
      <span class="rate-toggle-slider"></span>
    </label>
  `;

  const rateModeHelp = document.createElement('div');
  rateModeHelp.id = 'rateModeHelp';
  rateModeHelp.className = 'rate-mode-help';
  rateModeHelp.textContent = 'Enter the monthly rate before tax.';

  inputWrap.insertAdjacentElement('afterend', rateModeCard);
  rateModeCard.insertAdjacentElement('afterend', rateModeHelp);

  const rateIncludesTaxCheckbox = document.getElementById('rateIncludesTax');

  function getTaxRate() {
    return reducedTaxCheckbox.checked ? 0.10375 : 0.18375;
  }

  function roundCurrency(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(value) {
    return '$' + Number(value).toFixed(2);
  }

  function updateRateModeDisplay() {
    const includesTax = rateIncludesTaxCheckbox.checked;
    const taxLabel = (getTaxRate() * 100).toFixed(3) + '%';

    if (monthlyRateLabel) {
      monthlyRateLabel.textContent = includesTax
        ? 'Monthly Rate With Tax ($)'
        : 'Monthly Rate Before Tax ($)';
    }

    rateModeHelp.innerHTML = includesTax
      ? `Enter the final monthly amount. It will be converted to a pre-tax rate using <strong>${taxLabel}</strong> tax.`
      : 'Enter the monthly rate before tax.';

    rateModeCard.classList.toggle('active', includesTax);
  }

  rateIncludesTaxCheckbox.addEventListener('change', updateRateModeDisplay);
  reducedTaxCheckbox.addEventListener('change', updateRateModeDisplay);
  updateRateModeDisplay();

  window.calculateTotal = function calculateTotalWithRateMode() {
    const enteredRate = parseFloat(monthlyRateInput.value);
    const includesTax = rateIncludesTaxCheckbox.checked;

    if (!includesTax || !Number.isFinite(enteredRate)) {
      return originalCalculateTotal();
    }

    const taxRate = getTaxRate();
    const convertedPreTaxRate = roundCurrency(enteredRate / (1 + taxRate));
    const originalInputValue = monthlyRateInput.value;

    monthlyRateInput.value = convertedPreTaxRate.toFixed(2);

    try {
      originalCalculateTotal();
    } finally {
      monthlyRateInput.value = originalInputValue;
    }

    const result = document.getElementById('result');
    if (!result || !result.querySelector('.table-wrap')) return;

    const oldConversionNote = result.querySelector('.rate-conversion-note');
    if (oldConversionNote) oldConversionNote.remove();

    const conversionNote = document.createElement('div');
    conversionNote.className = 'info-note rate-conversion-note';
    conversionNote.innerHTML = `
      <span>🔄</span>
      <div><strong>Rate conversion:</strong> ${formatMoney(enteredRate)} with tax was converted to ${formatMoney(convertedPreTaxRate)} before tax using ${(taxRate * 100).toFixed(3)}% tax.</div>
    `;

    const prorationNote = result.querySelector('.info-note');
    if (prorationNote) {
      result.insertBefore(conversionNote, prorationNote);
    } else {
      result.appendChild(conversionNote);
    }
  };
})();

let deferredInstallPrompt = null;

const installBanner = document.getElementById('installBanner');
const installTitle = document.getElementById('installTitle');
const installText = document.getElementById('installText');
const installButton = document.getElementById('installButton');
const installDismiss = document.getElementById('installDismiss');

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const dismissedAt = Number(localStorage.getItem('glenwoodInstallDismissedAt') || 0);
const dismissedRecently = Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000;

function showInstallBanner(mode) {
  if (!installBanner || isStandalone || dismissedRecently) return;

  if (mode === 'ios') {
    installTitle.textContent = 'Install Glenwood Calculator';
    installText.textContent = 'Tap Share, then Add to Home Screen.';
    installButton.textContent = 'Got it';
  } else {
    installTitle.textContent = 'Install Glenwood Calculator';
    installText.textContent = 'Add it to your phone for quick access.';
    installButton.textContent = 'Install';
  }

  installBanner.hidden = false;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallBanner('native');
});

if (isIOS && !isStandalone) {
  window.addEventListener('load', () => {
    setTimeout(() => showInstallBanner('ios'), 900);
  });
}

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (isIOS && !deferredInstallPrompt) {
      installBanner.hidden = true;
      return;
    }

    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installBanner.hidden = true;
  });
}

if (installDismiss) {
  installDismiss.addEventListener('click', () => {
    localStorage.setItem('glenwoodInstallDismissedAt', String(Date.now()));
    installBanner.hidden = true;
  });
}

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  if (installBanner) installBanner.hidden = true;
});
