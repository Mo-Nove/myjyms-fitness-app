/**
 * routes/auth.js – Authentifizierung
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M6 – HTTP POST Endpunkt                 → POST /api/login
 *   M9 – Session Management (JWT)           → Token wird bei Login erstellt
 *
 * POST /api/login – Benutzer einloggen und JWT-Token erstellen.
 * Der Token wird vom Frontend im sessionStorage gespeichert und
 * bei geschützten Requests im Authorization-Header mitgeschickt.
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const { sendResponse } = require('../helpers');
const { users } = require('../data');

const router = express.Router();

// ── Login ───────────────────────────────────────────────────

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return sendResponse(req, res, { error: 'Falscher Benutzername oder Passwort.' }, 401);
    }

    // Token enthält nur die nötigsten Infos – niemals das Passwort!
    const payload = { id: user.id, user: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    sendResponse(req, res, { message: 'Login erfolgreich!', token, userId: user.id });
});

module.exports = router;
