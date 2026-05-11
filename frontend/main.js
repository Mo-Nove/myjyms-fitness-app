// --- 1. DARK MODE TOGGLE ---
const darkModeBtn = document.getElementById('darkModeBtn');
darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeBtn.innerText = "☀️ Light Mode";
    } else {
        darkModeBtn.innerText = "🌙 Dark Mode";
    }
});

// --- 2. CHAT & PLAN GENERIERUNG ---
const chatBox = document.getElementById('chatBox');
const btnGeneratePlan = document.getElementById('btnGeneratePlan');
const btnSendChat = document.getElementById('btnSendChat');
const chatInput = document.getElementById('chatInput');

// NEU: Hier speichern wir den gesamten Chat-Verlauf
let chatHistory = [];

// --- NEU: Lade-Animation anzeigen ---
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// --- NEU: Lade-Animation entfernen ---
function removeTyping() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) typingDiv.remove();
}

function addMessageToChat(text, isUser = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isUser ? 'chat-msg msg-user' : 'chat-msg msg-ai';

    // NEU: Wenn es die KI ist, nutzen wir "marked.parse()", um Tabellen & Listen perfekt zu bauen!
    // User-Nachrichten bleiben normaler Text (Sicherheit), KI-Nachrichten werden formatiert.
    if (isUser) {
        msgDiv.innerText = text;
    } else {
        msgDiv.innerHTML = marked.parse(text);
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}
// UPDATE: sendToBackend zeigt jetzt die Animation an
async function sendToBackend(payload) {
    showTyping();

    // Wir hängen unser Notizbuch an das Paket für den Server an!
    payload.history = chatHistory.slice(0, -1);

    try {
        const response = await fetch('http://localhost:3000/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        removeTyping();

        if (data.plan) {
            addMessageToChat(data.plan, false);
            // NEU: Die Antwort der KI in unser Notizbuch eintragen
            chatHistory.push({ sender: 'ai', text: data.plan });
        } else {
            addMessageToChat("Fehler: Keine Antwort erhalten.", false);
        }
    } catch (error) {
        removeTyping();
        addMessageToChat("Fehler bei der Verbindung zum Server.", false);
    }
}

// EVENT A: Klick auf "Wochenplan erstellen"
btnGeneratePlan.addEventListener('click', () => {
    // Alle Felder auslesen
    const username = document.getElementById('inputUsername').value || "User";
    const geschlecht = document.getElementById('inputGeschlecht').value;
    const fitness = document.getElementById('inputFitness').value;
    const alter = document.getElementById('inputAlter').value;
    const gewicht = document.getElementById('inputGewicht').value;
    const groesse = document.getElementById('inputGroesse').value;
    const ziel = document.getElementById('inputZiel').value;

    if (!ziel) return alert("Bitte gib mindestens dein Hauptziel ein!");

    // Nachricht für den Chat zusammenbauen
    const userFrage = `Hallo Coach! Ich bin ${username} (${geschlecht}). Ich bin auf dem Level "${fitness}". Erstelle mir einen Wochenplan für mein Ziel: ${ziel}. (Alter: ${alter}, Gewicht: ${gewicht}kg, Größe: ${groesse}cm)`;

    addMessageToChat(userFrage, true);
    chatHistory.push({ sender: 'user', text: userFrage });

    // Alles ans Backend senden
    sendToBackend({ username, geschlecht, fitness, alter, gewicht, groesse, ziel });
});

// EVENT B: Normale Chat-Nachricht
btnSendChat.addEventListener('click', () => {
    const msg = chatInput.value;
    if (msg.trim() === "") return;

    addMessageToChat(msg, true);
    chatInput.value = "";

    // NEU: Bevor wir senden, schreiben wir es ins Notizbuch
    chatHistory.push({ sender: 'user', text: msg });
    sendToBackend({ nachricht: msg });
});

// EVENT C: Enter-Taste
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnSendChat.click();
});

// EVENT D: Schnellwahl (inkl. Arme und Bauch)
async function handleMuscleClick(userText, aiPrompt) {
    // 1. Die aktuellen Profildaten auslesen
    const username = document.getElementById('inputUsername').value || "User";
    const fitness = document.getElementById('inputFitness').value || "Anfänger";

    // 2. Deine Nachricht in den Chat posten
    addMessageToChat(userText, true);

    // 3. Ins Gedächtnis eintragen
    chatHistory.push({ sender: 'user', text: aiPrompt });

    // 4. Alles ans Backend senden (inkl. Profil-Infos)
    sendToBackend({
        nachricht: aiPrompt,
        username,   // NEU: Name mitschicken
        fitness     // NEU: Level mitschicken
    });
}

// UPDATE: Die EventListener nutzen jetzt die neue Funktion
document.getElementById('m-chest').addEventListener('click', () => {
    handleMuscleClick("Welche Übungen empfiehlst du für die Brust?", "Nenne mir die 3 besten Brust-Übungen.");
});
document.getElementById('m-abs').addEventListener('click', () => {
    handleMuscleClick("Wie trainiere ich den Bauch?", "Gib mir ein knackiges Core/Bauchmuskel-Workout.");
});
document.getElementById('m-legs').addEventListener('click', () => {
    handleMuscleClick("Beintraining steht an!", "Nenne mir ein intensives Beintraining.");
});
document.getElementById('m-legs2').addEventListener('click', () => {
    handleMuscleClick("Beintraining steht an!", "Nenne mir ein intensives Beintraining.");
});
document.getElementById('m-arms-left').addEventListener('click', () => {
    handleMuscleClick("Was mache ich für massive Arme?", "Erstelle ein kurzes Workout für Bizeps und Trizeps.");
});
document.getElementById('m-arms-right').addEventListener('click', () => {
    handleMuscleClick("Was mache ich für massive Arme?", "Erstelle ein kurzes Workout für Bizeps und Trizeps.");
});