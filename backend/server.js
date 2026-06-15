/**
 * ============================================================
 *  MyJyms – Backend Server (Einstiegspunkt)
 * ============================================================
 *
 * Dieser Server stellt die REST-API für die MyJyms Fitness-App bereit.
 *
 * Projektstruktur (Clean Code: Separation of Concerns):
 * ─────────────────────────────────────────────────────
 *   server.js       → Einstiegspunkt (Middleware + Routen einbinden)
 *   config.js       → Konfiguration (Port, API-Keys, KI-Modelle)
 *   data.js         → In-Memory Datenspeicher (Users, Pläne)
 *   helpers.js      → Hilfsfunktionen (XML, Antwortformat, JWT)
 *   routes/         → API-Endpunkte, nach Bereich getrennt:
 *     auth.js       →   POST   /api/login
 *     plans.js      →   GET | POST | DELETE  /api/plans
 *     users.js      →   GET | PUT  | PATCH   /api/users
 *     exercises.js  →   GET  /api/exercises  (intern + wger.de)
 *     weather.js    →   GET  /api/weather    (Open-Meteo)
 *     models.js     →   GET | PUT  /api/models
 *
 * Verwendete Technologien:
 *   - Express 5           (HTTP-Framework)
 *   - JWT                 (Authentifizierung via Token)
 *   - Google Gemini API   (KI-Trainingscoach)
 *   - wger.de API         (Übungsdatenbank)
 *   - Open-Meteo API      (Wetterdaten)
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

app.use('/api',           require('./routes/auth'));
app.use('/api/plans',     require('./routes/plans'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/weather',   require('./routes/weather'));
app.use('/api/models',    require('./routes/models'));

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
