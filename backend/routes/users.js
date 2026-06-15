/**
 * routes/users.js – Benutzerverwaltung (M6, C3)
 *
 * GET    /api/users       – Alle User laden (geschützt)
 * POST   /api/users       – Neuen User anlegen (geschützt)
 * PUT    /api/users/:id   – Profil komplett aktualisieren (M6)
 * PATCH  /api/users/:id   – Einzelne Felder ändern (C3)
 * DELETE /api/users/:id   – User löschen (geschützt)
 */

const express = require('express');
const { sendResponse, authenticateToken } = require('../helpers');
const { users, generateUserId } = require('../data');

const router = express.Router();

// ── GET: Alle Benutzer laden ────────────────────────────────

router.get('/', authenticateToken, (req, res) => {
    // Passwort niemals an den Client senden!
    const safeUsers = users.map(({ password, ...rest }) => rest);
    sendResponse(req, res, { users: safeUsers });
});

// ── PUT: Profil komplett aktualisieren ──────────────────────

router.put('/:id', (req, res) => {
    const user = findUserById(req.params.id);

    if (!user) {
        return sendResponse(req, res, { error: 'User nicht gefunden.' }, 404);
    }

    // Eingaben validieren
    const validationError = validateUserFields(req.body);
    if (validationError) {
        return sendResponse(req, res, { error: validationError }, 400);
    }

    // Nur übergebene Felder überschreiben
    const { username, gewicht, groesse, alter, fitness } = req.body;
    if (username) user.username = username;
    if (gewicht)  user.gewicht = gewicht;
    if (groesse)  user.groesse = groesse;
    if (alter)    user.alter = alter;
    if (fitness)  user.fitness = fitness;

    const { password, ...safeUser } = user;
    sendResponse(req, res, {
        message: `Profil von ${user.username} aktualisiert.`,
        user: safeUser,
    });
});

// ── PATCH: Einzelne Felder ändern (C3) ──────────────────────

const PATCHABLE_FIELDS = ['username', 'gewicht', 'groesse', 'alter', 'fitness', 'role'];
const VALID_FITNESS_LEVELS = ['Anfänger', 'Fortgeschritten', 'Profi'];

router.patch('/:id', authenticateToken, (req, res) => {
    const user = findUserById(req.params.id);

    if (!user) {
        return sendResponse(req, res, { error: 'User nicht gefunden.' }, 404);
    }

    // Eingaben validieren bevor sie gespeichert werden
    const updates = req.body;
    const validationError = validateUserFields(updates);
    if (validationError) {
        return sendResponse(req, res, { error: validationError }, 400);
    }

    // Nur erlaubte Felder aktualisieren
    const applied = {};

    for (const field of PATCHABLE_FIELDS) {
        if (updates[field] !== undefined) {
            user[field] = updates[field];
            applied[field] = updates[field];
        }
    }

    if (Object.keys(applied).length === 0) {
        return sendResponse(req, res, { error: 'Keine gültigen Felder angegeben.' }, 400);
    }

    sendResponse(req, res, { message: 'Profil teilweise aktualisiert.', updated: applied });
});

// ── POST: Neuen User anlegen ────────────────────────────────

router.post('/', authenticateToken, (req, res) => {
    const { username, password, role, gewicht, groesse, alter, fitness } = req.body;

    if (!username || !password) {
        return sendResponse(req, res, { error: 'Username und Passwort sind Pflichtfelder.' }, 400);
    }

    if (users.some(u => u.username === username)) {
        return sendResponse(req, res, { error: 'Username bereits vergeben.' }, 409);
    }

    const validationError = validateUserFields(req.body);
    if (validationError) {
        return sendResponse(req, res, { error: validationError }, 400);
    }

    const validRole = (role === 'admin') ? 'admin' : 'user';

    const newUser = {
        id: generateUserId(),
        username,
        password,
        role: validRole,
        gewicht:  gewicht  ? Number(gewicht)  : null,
        groesse:  groesse  ? Number(groesse)  : null,
        alter:    alter    ? Number(alter)    : null,
        fitness:  fitness  || null,
    };

    users.push(newUser);

    const { password: _, ...safeUser } = newUser;
    sendResponse(req, res, { message: `User "${username}" erstellt.`, user: safeUser }, 201);
});

// ── DELETE: User löschen ────────────────────────────────────

router.delete('/:id', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === userId);

    if (index === -1) {
        return sendResponse(req, res, { error: 'User nicht gefunden.' }, 404);
    }

    const removed = users.splice(index, 1)[0];
    sendResponse(req, res, { message: `User "${removed.username}" gelöscht.` });
});

// ── Hilfsfunktion ───────────────────────────────────────────

/** Sucht einen User per ID – vermeidet doppelten Code in PUT und PATCH */
function findUserById(paramId) {
    const userId = parseInt(paramId);
    return users.find(u => u.id === userId);
}

/** Validiert Benutzereingaben und gibt eine Fehlermeldung zurück (oder null) */
function validateUserFields(fields) {
    if (fields.gewicht !== undefined) {
        const g = Number(fields.gewicht);
        if (!Number.isFinite(g) || g < 20 || g > 500) {
            return 'Gewicht muss zwischen 20 und 500 kg liegen.';
        }
    }
    if (fields.groesse !== undefined) {
        const gr = Number(fields.groesse);
        if (!Number.isFinite(gr) || gr < 50 || gr > 300) {
            return 'Größe muss zwischen 50 und 300 cm liegen.';
        }
    }
    if (fields.alter !== undefined) {
        const a = Number(fields.alter);
        if (!Number.isFinite(a) || a < 5 || a > 150) {
            return 'Alter muss zwischen 5 und 150 liegen.';
        }
    }
    if (fields.fitness !== undefined && !VALID_FITNESS_LEVELS.includes(fields.fitness)) {
        return 'Fitnesslevel muss Anfänger, Fortgeschritten oder Profi sein.';
    }
    if (fields.role !== undefined && !['admin', 'user'].includes(fields.role)) {
        return 'Rolle muss admin oder user sein.';
    }
    return null;
}

module.exports = router;
