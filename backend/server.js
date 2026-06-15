require('dotenv').config(); // Lädt deinen geheimen API-Key
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- KI SETUP ---
// Wir initialisieren Gemini mit deinem Schlüssel aus der .env Datei
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Wir wählen das schnelle "Flash" Modell
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Ein geheimes Passwort, um die Token zu unterschreiben (in echten Apps kommt das in die .env Datei!)
const SECRET_KEY = "mein_super_geheimes_passwort";

// --- M9: LOGIN & SESSION MANAGEMENT ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Wir simulieren hier einen User in der Datenbank (in echt würden wir das in der DB prüfen)
    if (username === "admin" && password === "1234") {
        // User ist echt! Wir stellen einen JWT-Stempel aus, der 1 Stunde gültig ist
        const token = jwt.sign({ user: username, role: "user" }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ message: "Login erfolgreich!", token: token });
    } else {
        res.status(401).json({ error: "Falscher Benutzername oder Passwort!" });
    }
});

function authenticateToken(req, res, next) {
    // 1. Schau nach, ob im HTTP-Header ein "Authorization" Feld mitgeschickt wurde
    const authHeader = req.headers['authorization'];
    // 2. Das Format ist meistens "Bearer DEIN_TOKEN". Wir splitten das und nehmen nur den Token.
    const token = authHeader && authHeader.split(' ')[1]; 

    // 3. Kein Token da? Zugriff verweigert! (401 Unauthorized)
    if (token == null) {
        return res.status(401).json({ error: "Halt! Du musst eingeloggt sein, um das zu tun." });
    }

    // 4. Token da? Dann prüfen wir, ob er echt ist (mit unserem Passwort)
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Dein Token ist abgelaufen oder gefälscht!" });
        
        req.user = user; // Den entschlüsselten User in den Request packen
        next(); // Alles cool, der User darf rein! (Geht weiter zum eigentlichen Endpunkt)
    });
}

// --- M6 & M8: HTTP ENDPOINTS ---

// 1. GET
app.get('/api/exercises', (req, res) => {
    res.json({ uebungen: ["Bankdrücken", "Flys", "Liegestütze"] });
});

// 2. POST
app.post('/api/plans', async (req, res) => {
    // Alle Daten empfangen
    const { username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht, history } = req.body; 

    try {
        // 1. Wir nehmen maximal die letzten 4 Nachrichten aus der Historie
        let recentHistory = history ? history.slice(-4) : [];
        // 2. Wenn die letzte Nachricht von der KI ist, entfernen wir sie (sonst könnte die KI sich selbst zitieren und das verwirrt sie)
        if (recentHistory.length > 0 && recentHistory[0].sender === 'ai') {
            recentHistory.shift(); 
        }

        // 3. Übersetzen in das Google-Format
        const geminiHistory = recentHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({ history: geminiHistory });

        let prompt = "";

        if (nachricht) {
            // DER FIX: Jetzt schicken wir die eigentliche Frage auch WIRKLICH an die KI!
            // Und wir erinnern sie nochmal an deinen Namen und dein Level.
            prompt = `Systemanweisung: Du bist der Personal Trainer 'MyJyms'. 
            Dein aktueller User heißt "${username || 'User'}" (Level: ${fitness || 'unbekannt'}).
            Beantworte jetzt detailliert die folgende Frage/Nachricht des Users: "${nachricht}"`;
            
        } else if (ziel) {
            prompt = `Systemanweisung: Du bist der KI-Coach von 'MyJyms'. 
            Erstelle einen Wochen-Trainingsplan für: ${username}.
            Daten: Geschlecht ${geschlecht}, Alter ${alter}, Gewicht ${gewicht}kg, Größe ${groesse}cm.
            Fitnesslevel: ${fitness}. 
            Ziel: ${ziel}.
            WICHTIG: Sprich den User direkt mit seinem Namen "${username}" an. 
            Gestalte das Training passend für das Level "${fitness}".`;
        } else {
            return res.status(400).json({ error: "Bitte Daten eingeben." });
        }

        const result = await chat.sendMessage(prompt);
        const kiAntwort = result.response.text();

        res.json({ plan: kiAntwort });

    } catch (error) {
        console.error("KI Fehler:", error);
        
        // Prüfen, ob es der "Too Many Requests" (429) Fehler ist
        if (error.status === 429) {
            return res.status(429).json({ 
                plan: "Puh, ich bin gerade etwas außer Atem! 😅 (Rate Limit erreicht). Bitte warte ca. 5 Minuten, dann bin ich wieder voll für dich da!" 
            });
        }

        // Für alle anderen Fehler
        res.status(500).json({ plan: "Die MyJyms-KI ist gerade offline. Bitte versuche es später noch einmal." });
    }
});

// 3. PUT 
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const updateData = req.body;
    res.json({ message: `Profil von User ${userId} wurde komplett aktualisiert.`, data: updateData });
});

function authenticateToken(req, res, next) {
    // Holt den Token aus dem Header der Anfrage
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) return res.status(401).json({ error: "Halt! Du musst eingeloggt sein." });

    // Prüft, ob der Token echt ist
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "Token abgelaufen oder gefälscht!" });
        req.user = user; 
        next(); // Lässt den Nutzer durch zur DELETE-Route
    });
}

// 4. DELETE
app.delete('/api/plans/:id', authenticateToken, (req, res) => {
    // Hier würde bei einer echten Datenbank der Löschbefehl stehen
    res.json({ message: "Erfolgreich gelöscht! Der Chatverlauf wurde bereinigt." });
});

// --- SERVER STARTEN ---
app.listen(PORT, () => {
    console.log(`🚀 Backend Server läuft auf http://localhost:${PORT}`);
});
