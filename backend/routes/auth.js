/**
 * routes/auth.js – Authentifizierung (Anforderung M9)
 *
 * POST /api/login – Benutzer einloggen und JWT-Token erstellen
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

    sendResponse(req, res, { message: 'Login erfolgreich!', token });
});

module.exports = router;
