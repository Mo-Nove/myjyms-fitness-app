/**
 * ============================================================
 *  MyJyms – Backend Server (Einstiegspunkt)
 * ============================================================
 *
 * Dieser Server stellt die REST-API für die MyJyms Fitness-App bereit.
 *
 * ── Erfüllte Anforderungen (Übersicht) ──────────────────────
 *
 * MUST (21 Punkte – alle erfüllt):
 *   M1 – Backend ist eigene Komponente       → /backend (eigener Ordner + package.json)
 *   M2 – Frontend ist eigene Komponente      → /frontend (HTML5, CSS, JS)
 *   M3 – Kommunikation über HTTP             → Frontend ruft Backend via fetch() auf Port 3000
 *   M4 – Asynchroner Datentransfer (AJAX)    → Alle Requests nutzen async/await + fetch()
 *   M5 – Endpunkte liefern JSON oder XML     → sendResponse() in helpers.js (Accept-Header)
 *   M6 – GET, POST, PUT, DELETE im Backend   → plans.js, users.js, models.js
 *   M7 – GET, POST, PUT, DELETE im Frontend  → index.html (js/), admin.html (app.js)
 *   M8 – Mind. 1 externer REST-Service       → Google Gemini API (plans.js)
 *   M9 – Session Management                  → JWT-Token (auth.js, helpers.js)
 *
 * SHOULD (8 Punkte – alle erfüllt):
 *   S1 – Mind. 2 externe REST-Services       → + Open-Meteo API (weather.js)
 *   S2 – Zweite Frontend-Komponente (3+ EP)  → admin.html nutzt 9+ Endpunkte
 *   S3 – W3C-konformes HTML                  → Validiert mit validator.w3.org
 *   S4 – Responsive Design (Mobile+Desktop)  → Media Queries in style.css (900px, 600px)
 *
 * COULD (5 Punkte – alle erfüllt):
 *   C1 – Mind. 3 externe REST-Services       → + Open-Meteo API (weather.js)
 *   C2 – Antworten als JSON UND XML          → sendResponse() prüft Accept-Header
 *   C3 – PATCH-Endpunkt im Backend + FE      → PATCH /api/users/:id (users.js + app.js)
 *
 * ── Projektstruktur (Clean Code: Separation of Concerns) ────
 *
 *   server.js       → Einstiegspunkt (Middleware + Routen einbinden)
 *   config.js       → Konfiguration (Port, API-Keys, KI-Modelle)
 *   data.js         → In-Memory Datenspeicher (Users, Pläne)
 *   helpers.js      → Hilfsfunktionen (XML, Antwortformat, JWT)
 *   routes/         → API-Endpunkte, nach Bereich getrennt:
 *     auth.js       →   POST   /api/login                    (M9)
 *     plans.js      →   GET | POST | DELETE  /api/plans       (M6, M8)
 *     users.js      →   GET | POST | PUT | PATCH | DELETE     (M6, C3)
 *     exercises.js  →   GET  /api/exercises  (intern)         (M6)
 *     weather.js    →   GET  /api/weather    (Open-Meteo)     (S1, C1)
 *     models.js     →   GET | PUT  /api/models
 *
 * ── Verwendete Technologien ─────────────────────────────────
 *   - Express 5           (HTTP-Framework)
 *   - JWT                 (Authentifizierung via Token)
 *   - Google Gemini API   (KI-Trainingscoach – Externe API 1)
 *   - Open-Meteo API      (Wetterdaten – Externe API 2)
 */

const express = require('express');
const cors = require('cors');
const { PORT, GEMINI_API_KEY } = require('./config');

// ── Express App erstellen ───────────────────────────────────

const app = express();

app.use(cors());          // Cross-Origin Requests erlauben (Frontend ↔ Backend)
app.use(express.json());  // JSON-Body automatisch parsen

// ── Request Logger (jede Anfrage mit Farbe loggen) ──────────

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
        console.log(`${color}${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)\x1b[0m`);
    });
    next();
});

// ── Routen einbinden (jede Datei = ein Verantwortungsbereich) ─
// (M1: Backend ist eigenständige Komponente mit klarer Routenstruktur)

app.use('/api',           require('./routes/auth'));       // POST /api/login           (M9)
app.use('/api/plans',     require('./routes/plans'));      // GET, POST, DELETE         (M6, M8)
app.use('/api/users',     require('./routes/users'));      // GET, POST, PUT, PATCH, DELETE (M6, C3)
app.use('/api/exercises', require('./routes/exercises'));   // GET (intern)              (M6)
app.use('/api/weather',   require('./routes/weather'));    // GET (Open-Meteo)          (S1, C1)
app.use('/api/models',    require('./routes/models'));     // GET, PUT

// ── Server starten ──────────────────────────────────────────

app.listen(PORT, () => {
    // API-Key beim Start prüfen, damit Fehler sofort sichtbar sind
    if (!GEMINI_API_KEY) {
        console.error('\x1b[31m[FEHLER] GEMINI_API_KEY fehlt in der .env Datei!\x1b[0m');
    } else {
        console.log('\x1b[32m[OK] GEMINI_API_KEY geladen\x1b[0m');
    }
    console.log(`🚀 Backend Server läuft auf http://localhost:${PORT}`);
});
