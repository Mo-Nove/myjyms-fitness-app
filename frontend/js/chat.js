/**
 * chat.js – Chat-Funktionalität & KI-Kommunikation
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M4 – Asynchroner Datentransfer (AJAX)   → async fetch() für KI-Anfragen
 *   M7 – Frontend nutzt POST                → POST /api/plans (KI-Chat)
 *   M8 – Externer REST-Service (indirekt)   → Backend leitet an Google Gemini weiter
 *
 * Verwaltet den Chat mit dem KI-Coach:
 * - Nachrichten senden und im Chat anzeigen
 * - Typing-Animation (drei springende Punkte)
 * - Modell-Auswahl (Custom Dropdown im Gemini-Stil)
 * - Kommunikation mit dem Backend (POST /api/plans)
 *
 * Abhängigkeiten: config.js (API_BASE, chatHistory), ui.js (showToast)
 */

// ── DOM-Referenzen ──────────────────────────────────────────

const chatBox        = document.getElementById('chatBox');
const chatInput      = document.getElementById('chatInput');
const btnSendChat    = document.getElementById('btnSendChat');
const btnGeneratePlan = document.getElementById('btnGeneratePlan');

// ══════════════════════════════════════════════════════════════
//  MODELL-SELEKTOR (Custom Dropdown im Gemini-Stil)
// ══════════════════════════════════════════════════════════════

const modelPillLabel = document.getElementById('modelPillLabel');

/** Lädt den aktiven Modellnamen vom Backend */
async function loadModels() {
    try {
        const res = await fetch(`${API_BASE}/api/models`);
        const data = await res.json();
        currentModelId = data.current;
        const selected = data.models.find(m => m.id === data.current);
        if (selected && modelPillLabel) {
            modelPillLabel.textContent = selected.name.replace('Gemini ', '');
        }
    } catch {
        if (modelPillLabel) modelPillLabel.textContent = 'Offline';
    }
}

// Modellname beim Seitenstart laden
loadModels();

// ══════════════════════════════════════════════════════════════
//  TYPING-ANIMATION (Drei springende Punkte)
// ══════════════════════════════════════════════════════════════

/** Zeigt die "KI tippt..." Animation im Chat an */
function showTyping() {
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/** Entfernt die Typing-Animation */
function removeTyping() {
    document.getElementById('typingIndicator')?.remove();
}

// ══════════════════════════════════════════════════════════════
//  NACHRICHTEN ANZEIGEN
// ══════════════════════════════════════════════════════════════

/**
 * Fügt eine Nachricht zur Chat-Oberfläche hinzu.
 *
 * @param {string}      text      – Nachrichtentext (KI-Nachrichten enthalten Markdown)
 * @param {boolean}     isUser    – true = User-Nachricht, false = KI-Antwort
 * @param {string|null} errorType – Falls gesetzt, wird die Nachricht als Fehler dargestellt
 */
function addMessageToChat(text, isUser = false, errorType = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'chat-msg msg-user' : 'chat-msg msg-ai';

    if (errorType) {
        msgDiv.classList.add('msg-error');
    }

    if (isUser) {
        // User-Nachrichten als Klartext (kein Markdown)
        msgDiv.innerText = text;
    } else {
        // KI-Antworten: Markdown → HTML (via marked.js Bibliothek)
        msgDiv.innerHTML = marked.parse(text);
        addCopyButton(msgDiv, text);
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/** Fügt einen Kopier-Button (📋) zu KI-Nachrichten hinzu */
function addCopyButton(messageElement, rawText) {
    const btn = document.createElement('button');
    btn.className = 'copy-msg-btn';
    btn.textContent = '📋';
    btn.title = 'Nachricht kopieren';

    btn.addEventListener('click', () => {
        navigator.clipboard.writeText(rawText).then(() => {
            btn.textContent = '✅';
            setTimeout(() => { btn.textContent = '📋'; }, 1500);
        });
    });

    messageElement.style.position = 'relative';
    messageElement.appendChild(btn);
}

// ══════════════════════════════════════════════════════════════
//  BACKEND-KOMMUNIKATION
// ══════════════════════════════════════════════════════════════

/**
 * Erstellt einen Platzhalter (Typing-Animation) direkt unter der User-Nachricht.
 * Gibt das Platzhalter-Element zurück, das später mit der Antwort befüllt wird.
 */
function createAnswerPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'chat-msg msg-ai typing-placeholder';
    placeholder.innerHTML = '<div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';
    chatBox.appendChild(placeholder);
    chatBox.scrollTop = chatBox.scrollHeight;
    return placeholder;
}

/** Sendet eine Anfrage an die KI und zeigt die Antwort im zugehörigen Platzhalter */
async function sendToBackend(payload, placeholder) {

    // Chat-Verlauf mitschicken (ohne die gerade gesendete Nachricht)
    payload.history = chatHistory.slice(0, -1);

    try {
        const response = await fetch(`${API_BASE}/api/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();

        if (data.plan) {
            placeholder.classList.remove('typing-placeholder');
            if (data.errorType) {
                placeholder.classList.add('msg-error');
                placeholder.innerHTML = marked.parse(data.plan);
            } else {
                placeholder.innerHTML = marked.parse(data.plan);
                addCopyButton(placeholder, data.plan);
                chatHistory.push({ sender: 'ai', text: data.plan });
            }
        } else {
            placeholder.classList.add('msg-error');
            placeholder.innerHTML = 'Da ist leider etwas schiefgelaufen. Bitte versuche es erneut.';
        }
    } catch {
        placeholder.classList.add('msg-error');
        placeholder.innerHTML = '<strong>Keine Verbindung zum Server.</strong> Bitte prüfe, ob der Server läuft, und versuche es erneut.';
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

/**
 * Wird aufgerufen wenn der User auf einen Muskel in der SVG klickt.
 * Schickt die Anfrage an die KI mit den aktuellen Profildaten.
 * Das Feld 'muskelgruppe' ermöglicht dem Backend den 2-Stufen-Fallback:
 *   Stufe 1: Google Gemini KI → Stufe 2: Fixe Antworten
 */
function handleMuscleClick(userText, aiPrompt, muskelgruppe) {
    const username = document.getElementById('inputUsername')?.value || 'User';
    const fitness  = document.getElementById('inputFitness')?.value || 'Anfänger';
    const alter    = document.getElementById('inputAlter')?.value || '';

    addMessageToChat(userText, true);
    chatHistory.push({ sender: 'user', text: aiPrompt });

    const placeholder = createAnswerPlaceholder();
    sendToBackend({ nachricht: aiPrompt, username, fitness, alter, muskelgruppe }, placeholder);
}

// ══════════════════════════════════════════════════════════════
//  EVENT-LISTENER
// ══════════════════════════════════════════════════════════════

// Wochenplan generieren (Alle Profilfelder an die KI schicken)
btnGeneratePlan?.addEventListener('click', () => {
    const username   = document.getElementById('inputUsername').value || 'User';
    const geschlecht = document.getElementById('inputGeschlecht').value;
    const fitness    = document.getElementById('inputFitness').value;
    const alter      = document.getElementById('inputAlter').value;
    const gewicht    = document.getElementById('inputGewicht').value;
    const groesse    = document.getElementById('inputGroesse').value;
    const ziel       = document.getElementById('inputZiel').value;

    const details = [];
    if (alter)   details.push(`Alter: ${alter}`);
    if (gewicht) details.push(`Gewicht: ${gewicht}kg`);
    if (groesse) details.push(`Größe: ${groesse}cm`);

    let userMsg = `Hallo Coach! Ich bin ${username} (${geschlecht}). `
        + `Ich bin auf dem Level "${fitness}". `
        + `Erstelle mir einen Wochenplan`;

    if (ziel) userMsg += ` für mein Ziel: ${ziel}.`;
    else      userMsg += '.';

    if (details.length) userMsg += ` (${details.join(', ')})`;

    addMessageToChat(userMsg, true);
    chatHistory.push({ sender: 'user', text: userMsg });
    const placeholder = createAnswerPlaceholder();
    sendToBackend({ username, geschlecht, fitness, alter, gewicht, groesse, ziel }, placeholder);
});

// Freie Chat-Nachricht senden
btnSendChat?.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessageToChat(msg, true);
    chatInput.value = '';
    chatHistory.push({ sender: 'user', text: msg });
    const placeholder = createAnswerPlaceholder();
    sendToBackend({ nachricht: msg }, placeholder);
});

// Enter-Taste zum Senden
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSendChat.click();
});
