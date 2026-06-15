/**
 * chat.js – Chat-Funktionalität & KI-Kommunikation
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

const modelPillBtn   = document.getElementById('modelPillBtn');
const modelPillLabel = document.getElementById('modelPillLabel');
const modelPopup     = document.getElementById('modelPopup');
const modelPopupList = document.getElementById('modelPopupList');

/** Lädt die verfügbaren KI-Modelle vom Backend */
async function loadModels() {
    if (!modelPopupList) return;
    try {
        const res = await fetch(`${API_BASE}/api/models`);
        const data = await res.json();
        currentModelId = data.current;
        renderModelList(data.models, data.current);
    } catch {
        if (modelPillLabel) modelPillLabel.textContent = 'Offline';
    }
}

/** Rendert die Modell-Liste im Popup */
function renderModelList(models, selectedId) {
    modelPopupList.innerHTML = '';

    models.forEach(model => {
        const isActive = model.id === selectedId;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'model-option' + (isActive ? ' model-option-active' : '');
        item.innerHTML = `
            <span class="model-option-check">${isActive ? '✓' : ''}</span>
            <div class="model-option-info">
                <span class="model-option-name">${model.name.replace('Gemini ', '')}</span>
                <span class="model-option-desc">${model.description}</span>
            </div>
        `;
        item.addEventListener('click', () => selectModel(model, models));
        modelPopupList.appendChild(item);
    });

    // Pill-Button Label aktualisieren
    const selected = models.find(m => m.id === selectedId);
    if (selected && modelPillLabel) {
        modelPillLabel.textContent = selected.name.replace('Gemini ', '');
    }
}

/** Wechselt das aktive KI-Modell über die Backend-API */
async function selectModel(model, allModels) {
    modelPopup.classList.remove('model-popup-open');
    try {
        const res = await fetch(`${API_BASE}/api/models`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ modelId: model.id }),
        });
        const data = await res.json();
        currentModelId = model.id;
        renderModelList(allModels, model.id);
        showToast(data.message || 'Modell gewechselt!');
    } catch {
        showToast('Modellwechsel fehlgeschlagen.', 'error');
    }
}

// Popup öffnen / schließen
if (modelPillBtn) {
    modelPillBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        modelPopup.classList.toggle('model-popup-open');
    });
}

// Popup schließen wenn man außerhalb klickt
document.addEventListener('click', (e) => {
    if (modelPopup && !modelPopup.contains(e.target) && e.target !== modelPillBtn) {
        modelPopup.classList.remove('model-popup-open');
    }
});

// Modelle beim Seitenstart laden
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

/** Sendet eine Anfrage an die KI und zeigt die Antwort im Chat */
async function sendToBackend(payload) {
    showTyping();

    // Chat-Verlauf mitschicken (ohne die gerade gesendete Nachricht)
    payload.history = chatHistory.slice(0, -1);

    try {
        const response = await fetch(`${API_BASE}/api/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        removeTyping();

        if (data.plan) {
            if (data.errorType) {
                addMessageToChat(data.plan, false, data.errorType);
            } else {
                addMessageToChat(data.plan, false);
                chatHistory.push({ sender: 'ai', text: data.plan });
            }
        } else {
            addMessageToChat('❌ Keine Antwort vom Server erhalten.', false, 'UNKNOWN');
        }
    } catch {
        removeTyping();
        addMessageToChat(
            '🌐 **Verbindung zum Server fehlgeschlagen.** Ist der Backend-Server gestartet?',
            false, 'NETWORK_ERROR'
        );
    }
}

/**
 * Wird aufgerufen wenn der User auf einen Muskel in der SVG klickt.
 * Schickt die Anfrage an die KI mit den aktuellen Profildaten.
 */
function handleMuscleClick(userText, aiPrompt) {
    const username = document.getElementById('inputUsername')?.value || 'User';
    const fitness  = document.getElementById('inputFitness')?.value || 'Anfänger';

    addMessageToChat(userText, true);
    chatHistory.push({ sender: 'user', text: aiPrompt });

    sendToBackend({ nachricht: aiPrompt, username, fitness });
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

    if (!ziel) return alert('Bitte gib mindestens dein Hauptziel ein!');

    const userMsg = `Hallo Coach! Ich bin ${username} (${geschlecht}). `
        + `Ich bin auf dem Level "${fitness}". `
        + `Erstelle mir einen Wochenplan für mein Ziel: ${ziel}. `
        + `(Alter: ${alter}, Gewicht: ${gewicht}kg, Größe: ${groesse}cm)`;

    addMessageToChat(userMsg, true);
    chatHistory.push({ sender: 'user', text: userMsg });
    sendToBackend({ username, geschlecht, fitness, alter, gewicht, groesse, ziel });
});

// Freie Chat-Nachricht senden
btnSendChat?.addEventListener('click', () => {
    const msg = chatInput.value.trim();
    if (!msg) return;

    addMessageToChat(msg, true);
    chatInput.value = '';
    chatHistory.push({ sender: 'user', text: msg });
    sendToBackend({ nachricht: msg });
});

// Enter-Taste zum Senden
chatInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSendChat.click();
});
