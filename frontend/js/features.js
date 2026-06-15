/**
 * features.js – Zusatz-Features der App
 *
 * Enthält alle Feature-Module, die über die Basis-Chat-Funktion hinausgehen:
 * - Chat löschen (DELETE-Request)
 * - Muskel-Schnellwahl (SVG Klick-Events)
 * - Muskel-Karte umdrehen (Flip-Animation)
 * - Wetter-Widget (Open-Meteo API)
 * - Profil speichern (PUT-Request)
 * - PDF-Export (via html2pdf.js)
 * - Motivationsfisch
 *
 * Abhängigkeiten: config.js, ui.js (showToast), chat.js (handleMuscleClick, addMessageToChat)
 */

// ══════════════════════════════════════════════════════════════
//  CHAT LÖSCHEN (HTTP DELETE)
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
    'm-head-front': ['Gibt es Denkübungen fürs Training?',                 'Nenne mir die besten mentalen Übungen und Denkübungen, die man vor oder während dem Training machen kann (Visualisierung, Mind-Muscle-Connection, Fokus-Techniken).'],
    'm-chest':      ['Welche Übungen empfiehlst du für die Brust?',        'Nenne mir die 3 besten Brust-Übungen.'],
    'm-abs':        ['Wie trainiere ich den Bauch?',                       'Gib mir ein knackiges Core/Bauchmuskel-Workout.'],
    'm-legs':       ['Beintraining steht an!',                             'Nenne mir ein intensives Beintraining.'],
    'm-legs2':      ['Beintraining steht an!',                             'Nenne mir ein intensives Beintraining.'],
    'm-arms-left':  ['Was mache ich für massive Arme?',                    'Erstelle ein kurzes Workout für Bizeps und Trizeps.'],
    'm-arms-right': ['Was mache ich für massive Arme?',                    'Erstelle ein kurzes Workout für Bizeps und Trizeps.'],

    // ── Rückseite ───────────────────────────────────────────
    'm-head-back':      ['Nackenübungen bitte!',            'Nenne mir die besten Übungen für den Nacken (Nackenmuskulatur, Trapezius oberer Anteil). Inklusive Dehnung und Kräftigung.'],
    'm-upper-back':     ['Rückentraining bitte!',           'Nenne mir die 3 besten Übungen für den oberen Rücken (Latissimus, Trapezius, Rhomboiden).'],
    'm-lower-back':     ['Was stärkt den unteren Rücken?',  'Gib mir ein Workout für den unteren Rücken (Hyperextensions, Good Mornings etc.).'],
    'm-glutes':         ['Po-Training!',                    'Erstelle mir ein intensives Glute/Po-Workout mit den besten Übungen.'],
    'm-hamstrings':     ['Beinbeuger trainieren!',          'Nenne mir die besten Übungen für die hintere Oberschenkelmuskulatur (Hamstrings).'],
    'm-hamstrings2':    ['Beinbeuger trainieren!',          'Nenne mir die besten Übungen für die hintere Oberschenkelmuskulatur (Hamstrings).'],
    'm-back-arms-left': ['Trizeps-Training!',               'Erstelle ein Trizeps-Workout für die Rückseite der Arme.'],
    'm-back-arms-right':['Trizeps-Training!',               'Erstelle ein Trizeps-Workout für die Rückseite der Arme.'],
};

// Event-Listener für alle Muskel-Elemente auf einmal registrieren
for (const [elementId, [userText, aiPrompt]] of Object.entries(MUSCLE_CLICK_MAP)) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', () => handleMuscleClick(userText, aiPrompt));
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
//  WETTER-WIDGET (GET – Open-Meteo API)
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
//  PROFIL SPEICHERN (HTTP PUT)
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
//  PDF-EXPORT (via html2pdf.js Bibliothek)
// ══════════════════════════════════════════════════════════════

const btnExportPdf = document.getElementById('btnExportPdf');

if (btnExportPdf) {
    btnExportPdf.addEventListener('click', () => {
        const chatBox     = document.getElementById('chatBox');
        const allMessages = chatBox.querySelectorAll('.chat-msg');
        const hasContent  = chatBox.querySelectorAll('.msg-ai').length > 1;

        if (!hasContent) {
            showToast('Kein Wochenplan vorhanden. Generiere erst einen!', 'error');
            return;
        }

        showToast('PDF wird erstellt...');

        // PDF-Container mit allen Chat-Nachrichten aufbauen
        const container = buildPdfContainer(allMessages);

        // Container unsichtbar ins DOM einfügen; html2canvas rendert den Klon sichtbar
        container.style.cssText += '; visibility:hidden; position:fixed; left:0; top:0;';
        document.body.appendChild(container);

        const pdfOptions = {
            margin:    [8, 8, 8, 8],
            filename:  'MyJyms_Wochenplan.pdf',
            image:     { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                windowWidth: 740,
                onclone: (clonedDoc, el) => {
                    el.style.visibility = 'visible';
                    el.style.position = 'static';
                },
            },
            jsPDF:     { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] },
        };

        html2pdf().set(pdfOptions).from(container).save()
            .then(() => {
                document.body.removeChild(container);
                showToast('PDF wurde heruntergeladen!');
            })
            .catch(() => {
                document.body.removeChild(container);
                showToast('PDF-Fehler aufgetreten.', 'error');
            });
    });
}

/** Erstellt den HTML-Container für den PDF-Export */
function buildPdfContainer(messages) {
    const container = document.createElement('div');
    container.style.cssText = 'padding:20px; font-family:Segoe UI,sans-serif; color:#2d3436; width:700px; background:#fff;';

    // PDF-Header mit Titel und Datum
    container.innerHTML = `
        <div style="margin-bottom:20px;">
            <h1 style="color:#e99623; margin:0 0 4px 0; font-size:24px;">MyJyms Wochenplan</h1>
            <p style="color:#888; margin:0; font-size:13px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | MyJyms KI-Coach
            </p>
            <hr style="border:none; border-top:2px solid #e99623; margin:12px 0;">
        </div>
    `;

    // Jede Chat-Nachricht als Block einfügen
    messages.forEach(msg => {
        const isUser = msg.classList.contains('msg-user');

        const block = document.createElement('div');
        block.style.cssText = `
            padding:12px 16px; border-radius:8px; margin-bottom:8px;
            font-size:13px; line-height:1.6; color:#2d3436; word-wrap:break-word;
            ${isUser
                ? 'background:#fff3e0; border-left:3px solid #e99623; text-align:right;'
                : 'background:#f5f5f5; border-left:3px solid #888;'}
        `;

        // Label: "Du" oder "KI-Coach"
        const label = document.createElement('p');
        label.style.cssText = 'margin:0 0 6px; font-weight:bold; font-size:11px; color:#888;';
        label.textContent = isUser ? 'Du' : 'KI-Coach';
        block.appendChild(label);

        // Nachrichteninhalt kopieren, aber Kopier-Buttons entfernen
        const content = document.createElement('div');
        content.innerHTML = msg.innerHTML;
        content.querySelectorAll('.copy-msg-btn').forEach(btn => btn.remove());
        // Explizite Farben für alle Kindelemente (Dark-Mode-CSS-Variablen wirken sonst weiß-auf-weiß)
        content.querySelectorAll('*').forEach(el => { el.style.color = '#2d3436'; });
        block.appendChild(content);

        container.appendChild(block);
    });

    return container;
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
