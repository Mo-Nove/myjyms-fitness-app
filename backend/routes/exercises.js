/**
 * routes/exercises.js – Übungsverwaltung (M6, S1)
 *
 * GET /api/exercises           – Interne Übungsliste
 * GET /api/exercises/external  – Übungen von wger.de (Externe API 2)
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

// ── GET: Externe Übungen von wger.de (API 2) ────────────────

router.get('/external', async (req, res) => {
    try {
        const response = await fetch(
            'https://wger.de/api/v2/exercise/?language=2&limit=10&format=json'
        );
        const data = await response.json();

        // Nur relevante Felder extrahieren, HTML-Tags aus der Beschreibung entfernen
        const exercises = data.results.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description.replace(/<[^>]*>/g, '').trim(),
            category: exercise.category,
        }));

        sendResponse(req, res, { source: 'wger.de', exercises });
    } catch {
        sendResponse(req, res, { error: 'wger.de API nicht erreichbar.' }, 502);
    }
});

module.exports = router;
