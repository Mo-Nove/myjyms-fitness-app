/**
 * features.js – Zusatz-Features der App
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M7 – Frontend nutzt GET, PUT, DELETE    → GET /api/weather, PUT /api/users, DELETE /api/plans
 *   M4 – Asynchroner Datentransfer (AJAX)   → Alle Requests via async fetch()
 *
 * Enthält alle Feature-Module, die über die Basis-Chat-Funktion hinausgehen:
 * - Chat löschen (DELETE-Request)           → M7: DELETE
 * - Muskel-Schnellwahl (SVG Klick-Events)
 * - Muskel-Karte umdrehen (Flip-Animation)
 * - Wetter-Widget (Open-Meteo API)          → M7: GET
 * - Profil speichern (PUT-Request)          → M7: PUT
 * - Motivationsfisch
 *
 * Abhängigkeiten: config.js, ui.js (showToast), chat.js (handleMuscleClick, addMessageToChat)
 */

// ══════════════════════════════════════════════════════════════
//  CHAT LÖSCHEN (M7: HTTP DELETE – Frontend nutzt DELETE-Methode)
// ══════════════════════════════════════════════════════════════

const btnClearChat = document.getElementById('btnClearChat');

if (btnClearChat) {
    btnClearChat.addEventListener('click', async () => {
        if (!confirm('Möchtest du den gesamten Chat-Verlauf auf dem Server löschen?')) return;

        const token = sessionStorage.getItem('myjyms_token');
        if (!token) {
            alert('Zugriff verweigert! Du musst eingeloggt sein.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/plans/1`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();

            if (response.ok) {
                const chatBox = document.getElementById('chatBox');
                if (chatBox) {
                    chatBox.innerHTML = `<div class="chat-msg msg-ai">${data.message} Neuer Chat gestartet!</div>`;
                }
                chatHistory.length = 0; // Array leeren, ohne die Referenz zu verlieren
            } else {
                alert(data.error || 'Fehler beim Löschen.');
            }
        } catch {
            alert('Server nicht erreichbar.');
        }
    });
}

// ══════════════════════════════════════════════════════════════
//  MUSKEL-SCHNELLWAHL (Klick auf SVG-Muskelgruppen)
// ══════════════════════════════════════════════════════════════
//
// Clean Code: DRY – Statt 13 einzelne addEventListener-Aufrufe
// verwenden wir eine Map mit [ElementID → Texte] und eine Schleife.

const MUSCLE_CLICK_MAP = {
    // ── Vorderseite ─────────────────────────────────────────
    'm-head-front': ['Gibt es Denkübungen fürs Training?',                 'Nenne mir die besten mentalen Übungen und Denkübungen, die man vor oder während dem Training machen kann (Visualisierung, Mind-Muscle-Connection, Fokus-Techniken).', 'kopf'],
    'm-chest':      ['Welche Übungen empfiehlst du für die Brust?',        'Nenne mir die 3 besten Brust-Übungen.', 'brust'],
    'm-abs':        ['Wie trainiere ich den Bauch?',                       'Gib mir ein knackiges Core/Bauchmuskel-Workout.', 'bauch'],
    'm-legs':       ['Beintraining steht an!',                             'Nenne mir ein intensives Beintraining.', 'beine'],
    'm-legs2':      ['Beintraining steht an!',                             'Nenne mir ein intensives Beintraining.', 'beine'],
    'm-arms-left':  ['Was mache ich für massive Arme?',                    'Erstelle ein kurzes Workout für Bizeps und Trizeps.', 'arme'],
    'm-arms-right': ['Was mache ich für massive Arme?',                    'Erstelle ein kurzes Workout für Bizeps und Trizeps.', 'arme'],

    // ── Rückseite ───────────────────────────────────────────
    'm-head-back':      ['Nackenübungen bitte!',            'Nenne mir die besten Übungen für den Nacken (Nackenmuskulatur, Trapezius oberer Anteil). Inklusive Dehnung und Kräftigung.', 'nacken'],
    'm-upper-back':     ['Rückentraining bitte!',           'Nenne mir die 3 besten Übungen für den oberen Rücken (Latissimus, Trapezius, Rhomboiden).', 'oberer_ruecken'],
    'm-lower-back':     ['Was stärkt den unteren Rücken?',  'Gib mir ein Workout für den unteren Rücken (Hyperextensions, Good Mornings etc.).', 'unterer_ruecken'],
    'm-glutes':         ['Po-Training!',                    'Erstelle mir ein intensives Glute/Po-Workout mit den besten Übungen.', 'po'],
    'm-hamstrings':     ['Beinbeuger trainieren!',          'Nenne mir die besten Übungen für die hintere Oberschenkelmuskulatur (Hamstrings).', 'hamstrings'],
    'm-hamstrings2':    ['Beinbeuger trainieren!',          'Nenne mir die besten Übungen für die hintere Oberschenkelmuskulatur (Hamstrings).', 'hamstrings'],
    'm-back-arms-left': ['Trizeps-Training!',               'Erstelle ein Trizeps-Workout für die Rückseite der Arme.', 'trizeps'],
    'm-back-arms-right':['Trizeps-Training!',               'Erstelle ein Trizeps-Workout für die Rückseite der Arme.', 'trizeps'],
};

// Event-Listener für alle Muskel-Elemente auf einmal registrieren
for (const [elementId, [userText, aiPrompt, muskelgruppe]] of Object.entries(MUSCLE_CLICK_MAP)) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', () => handleMuscleClick(userText, aiPrompt, muskelgruppe));
    }
}

// ══════════════════════════════════════════════════════════════
//  MUSKEL-KARTE UMDREHEN (3D Flip-Animation)
// ══════════════════════════════════════════════════════════════

const btnFlipMuscle = document.getElementById('btnFlipMuscle');
const muscleCard    = document.getElementById('muscleCard');

if (btnFlipMuscle && muscleCard) {
    btnFlipMuscle.addEventListener('click', () => {
        muscleCard.classList.toggle('flipped');
        const isFlipped = muscleCard.classList.contains('flipped');
        btnFlipMuscle.textContent = isFlipped ? 'Vorderseite' : 'Rückseite';
    });
}

// ══════════════════════════════════════════════════════════════
//  WETTER-WIDGET (M7: GET /api/weather – Open-Meteo API)
// ══════════════════════════════════════════════════════════════

async function fetchWeather() {
    const weatherDiv = document.getElementById('weatherInfo');
    const regionSelect = document.getElementById('weatherRegion');
    if (!weatherDiv) return;

    // Koordinaten aus dem Dropdown lesen
    const coords = (regionSelect?.value || '48.21,16.37').split(',');
    const lat = coords[0];
    const lon = coords[1];

    try {
        const response = await fetch(`${API_BASE}/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data.temperature !== undefined) {
            const regionName = regionSelect?.options[regionSelect.selectedIndex]?.text || 'Wien';
            weatherDiv.innerHTML = `
                <p><strong>${data.temperature}°C</strong> | Wind: ${data.windspeed} km/h</p>
                <p>${data.recommendation}</p>
                <p class="hint-text">${regionName} – ${data.source}</p>
            `;
        }
    } catch {
        weatherDiv.innerHTML = '<p>Wetterdaten nicht verfügbar.</p>';
    }
}

// Wetter beim Seitenstart laden + bei Bundesland-Wechsel
fetchWeather();
document.getElementById('weatherRegion')?.addEventListener('change', fetchWeather);

// ══════════════════════════════════════════════════════════════
//  PROFIL SPEICHERN (M7: HTTP PUT – Frontend nutzt PUT-Methode)
// ══════════════════════════════════════════════════════════════

const btnSaveProfile = document.getElementById('btnSaveProfile');

if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', async () => {
        const username = document.getElementById('inputUsername').value.trim();
        const gewicht  = document.getElementById('inputGewicht').value;
        const groesse  = document.getElementById('inputGroesse').value;
        const alter    = document.getElementById('inputAlter').value;
        const fitness  = document.getElementById('inputFitness').value;

        // Nur ausgefüllte Felder senden (leere Felder nicht überschreiben)
        const payload = {};
        if (username) payload.username = username;
        if (gewicht)  payload.gewicht = parseInt(gewicht);
        if (groesse)  payload.groesse = parseInt(groesse);
        if (alter)    payload.alter = parseInt(alter);
        if (fitness)  payload.fitness = fitness;

        // Mindestens ein Feld muss ausgefüllt sein
        if (!username && !gewicht && !groesse && !alter) {
            showToast('Bitte fülle mindestens ein Profilfeld aus.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/users/1`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (response.ok) {
                showToast(data.message || 'Profil gespeichert!');
            } else {
                showToast(data.error || 'Fehler beim Speichern.', 'error');
            }
        } catch {
            showToast('Server nicht erreichbar.', 'error');
        }
    });
}



// ══════════════════════════════════════════════════════════════
//  MOTIVATIONSFISCH 🐟
// ══════════════════════════════════════════════════════════════

let motivationQuotes = [];

// Zitate aus externer JSON-Datei laden
fetch('quotes.json')
    .then(res => res.json())
    .then(data => { motivationQuotes = data; })
    .catch(() => { motivationQuotes = ['💪 No pain, no gain!']; });

const fishSvg   = document.getElementById('motivationFish');
const fishQuote = document.getElementById('fishQuote');

if (fishSvg) {
    fishSvg.addEventListener('click', () => {
        // Sprung-Animation auslösen
        fishSvg.classList.add('fish-jump');

        // Zufälliges Zitat anzeigen
        const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
        fishQuote.textContent = motivationQuotes[randomIndex];

        // Fade-In Animation per CSS-Klasse
        fishQuote.classList.remove('fish-quote-visible');
        requestAnimationFrame(() => fishQuote.classList.add('fish-quote-visible'));

        setTimeout(() => fishSvg.classList.remove('fish-jump'), 600);
    });
}
