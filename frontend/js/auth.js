/**
 * auth.js – Authentifizierung & Dark Mode
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M4 – Asynchroner Datentransfer (AJAX)   → Login via async fetch()
 *   M7 – Frontend nutzt POST                → POST /api/login
 *   M9 – Session Management im Frontend     → JWT im sessionStorage
 *
 * Verwaltet Login, Logout, Gast-Modus und den Dark Mode Toggle.
 * Der JWT-Token wird im sessionStorage gespeichert (verschwindet
 * beim Schließen des Browser-Tabs – sicherer als localStorage).
 *
 * Abhängigkeiten: config.js (API_BASE)
 */

// ── DOM-Referenzen ──────────────────────────────────────────

const loginOverlay = document.getElementById('loginOverlay');
const btnLogin     = document.getElementById('btnLogin');
const btnGuest     = document.getElementById('btnGuest');
const logoutBtn    = document.getElementById('logoutBtn');
const loginError   = document.getElementById('loginError');

// ── Auto-Login ──────────────────────────────────────────────
// Falls vom letzten Besuch noch ein gültiger Token existiert,
// überspringen wir den Login-Screen direkt.

if (sessionStorage.getItem('myjyms_token') && loginOverlay) {
    loginOverlay.style.display = 'none';
}

// ── Login (M4: AJAX, M7: POST /api/login, M9: JWT-Token) ──

if (btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                // Token sicher im sessionStorage speichern
                sessionStorage.setItem('myjyms_token', data.token);
                loginOverlay.style.display = 'none';
                loginError.style.display = 'none';
            } else {
                loginError.innerText = data.error || 'Falsche Zugangsdaten!';
                loginError.style.display = 'block';
            }
        } catch {
            loginError.innerText = 'Backend-Server nicht erreichbar.';
            loginError.style.display = 'block';
        }
    });
}

// ── Gast-Modus (ohne Login weitermachen) ────────────────────

if (btnGuest) {
    btnGuest.addEventListener('click', () => {
        sessionStorage.removeItem('myjyms_token');
        loginOverlay.style.display = 'none';
    });
}

// ── Enter-Taste zum Einloggen ───────────────────────────────

document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnLogin.click();
});

// ── Logout ──────────────────────────────────────────────────

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('Möchtest du dich wirklich ausloggen?')) {
            sessionStorage.removeItem('myjyms_token');
            window.location.reload(); // Seite neu laden → Login-Overlay erscheint
        }
    });
}

// ── Dark Mode Toggle ────────────────────────────────────────
// Einstellung wird im localStorage gespeichert (überlebt Browser-Neustart)

const darkModeBtn      = document.getElementById('darkModeBtn');
const loginDarkModeBtn = document.getElementById('loginDarkModeBtn');

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');

    // Einstellung für nächsten Besuch merken
    localStorage.setItem('myjyms_darkmode', isDark);

    // Button-Icons aktualisieren
    const icon = isDark ? '☀️' : '🌙';
    if (darkModeBtn)      darkModeBtn.innerText = icon + ' Mode';
    if (loginDarkModeBtn) loginDarkModeBtn.innerText = icon;
}

// Beim Laden: Dark Mode wiederherstellen wenn vorher aktiviert
if (localStorage.getItem('myjyms_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    if (darkModeBtn)      darkModeBtn.innerText = '☀️ Mode';
    if (loginDarkModeBtn) loginDarkModeBtn.innerText = '☀️';
}

if (darkModeBtn)      darkModeBtn.addEventListener('click', toggleDarkMode);
if (loginDarkModeBtn) loginDarkModeBtn.addEventListener('click', toggleDarkMode);
