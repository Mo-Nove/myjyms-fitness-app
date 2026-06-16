/**
 * routes/exercises.js – Übungsverwaltung
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M6 – HTTP GET Endpunkt                  → GET /api/exercises
 *
 * GET /api/exercises – Interne Übungsliste
 */

const express = require('express');
const { sendResponse } = require('../helpers');

const router = express.Router();

// Interne Übungsdaten (in einer echten App kämen die aus der DB)
const INTERNAL_EXERCISES = [
    { id: 1, name: 'Bankdrücken',  muscle: 'Brust',  difficulty: 'Fortgeschritten' },
    { id: 2, name: 'Liegestütze',  muscle: 'Brust',  difficulty: 'Anfänger' },
    { id: 3, name: 'Kniebeugen',   muscle: 'Beine',  difficulty: 'Fortgeschritten' },
    { id: 4, name: 'Plank',        muscle: 'Core',   difficulty: 'Anfänger' },
    { id: 5, name: 'Klimmzüge',    muscle: 'Rücken', difficulty: 'Fortgeschritten' },
    { id: 6, name: 'Bizeps-Curls', muscle: 'Arme',   difficulty: 'Anfänger' },
];

// ── GET: Interne Übungen ────────────────────────────────────

router.get('/', (req, res) => {
    sendResponse(req, res, { exercises: INTERNAL_EXERCISES });
});

module.exports = router;
