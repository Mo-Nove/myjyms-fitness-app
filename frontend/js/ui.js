/**
 * ui.js – Allgemeine UI-Hilfsfunktionen
 *
 * Stellt wiederverwendbare UI-Komponenten bereit:
 * - Toast-Benachrichtigungen (Erfolg / Fehler)
 * - Scroll-to-Top Button
 * - Tageszeit-basierte Begrüßung
 * - Live BMI-Anzeige
 *
 * Abhängigkeiten: config.js (muss vorher geladen sein)
 */

// ── Toast-Benachrichtigungen ────────────────────────────────
// Zeigt kurze Meldungen oben rechts an (wie bei Android)

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : '❌';
    toast.innerHTML = `
        <span>${icon} ${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // CSS-Transition braucht einen Frame Verzögerung zum Animieren
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Schließen per Klick oder automatisch nach 4 Sekunden
    toast.querySelector('.toast-close').addEventListener('click', () => removeToast(toast));
    setTimeout(() => removeToast(toast), 4000);
}

/** Toast mit Fade-Out Animation entfernen */
function removeToast(toast) {
    toast.classList.remove('toast-visible');
    toast.addEventListener('transitionend', () => toast.remove());
}

// ── Scroll-to-Top Button ────────────────────────────────────
// Erscheint erst ab 400px Scrolltiefe

const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('scroll-top-visible', window.scrollY > 400);
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ── Tageszeit-Begrüßung im Chat ────────────────────────────
// Wird einmalig beim Laden der Seite gesetzt

(function initGreeting() {
    const chatBox = document.getElementById('chatBox');
    const firstMsg = chatBox?.querySelector('.msg-ai');
    if (!firstMsg) return;

    const hour = new Date().getHours();
    let greeting;
    if      (hour < 6)  greeting = 'Gute Nacht';
    else if (hour < 12) greeting = 'Guten Morgen';
    else if (hour < 18) greeting = 'Guten Nachmittag';
    else                greeting = 'Guten Abend';

    firstMsg.innerHTML = `${greeting}! 💪 Ich bin dein MyJyms KI-Coach. `
        + `Lass uns deinen Traumkörper aufbauen. Wie kann ich dir helfen?`;
})();

// ── Live BMI-Anzeige ────────────────────────────────────────
// Aktualisiert sich automatisch bei Eingabe von Gewicht/Größe

function updateBMI() {
    const gewicht = parseFloat(document.getElementById('inputGewicht')?.value);
    const groesse = parseFloat(document.getElementById('inputGroesse')?.value);
    const bmiDiv = document.getElementById('bmiDisplay');
    if (!bmiDiv) return;

    // Nur anzeigen wenn beide Werte sinnvoll sind
    if (!gewicht || !groesse || groesse < 50) {
        bmiDiv.innerHTML = '';
        return;
    }

    const heightInMeters = groesse / 100;
    const bmi = (gewicht / (heightInMeters * heightInMeters)).toFixed(1);

    // BMI-Kategorie nach WHO-Klassifikation
    let category, color;
    if      (bmi < 18.5) { category = 'Untergewicht';  color = '#3498db'; }
    else if (bmi < 25)   { category = 'Normalgewicht'; color = '#10b981'; }
    else if (bmi < 30)   { category = 'Übergewicht';   color = '#f59e0b'; }
    else                 { category = 'Adipositas';    color = '#ef4444'; }

    bmiDiv.innerHTML = `<span style="color:${color}">BMI: <strong>${bmi}</strong> — ${category}</span>`;
}

// BMI live bei jeder Eingabe aktualisieren
document.getElementById('inputGewicht')?.addEventListener('input', updateBMI);
document.getElementById('inputGroesse')?.addEventListener('input', updateBMI);
