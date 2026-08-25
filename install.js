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
