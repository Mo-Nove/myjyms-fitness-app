/**
 * routes/plans.js – Trainingsplan-Verwaltung (M6, M8)
 *
 * POST   /api/plans      – KI-Trainingsplan generieren (Google Gemini)
 * GET    /api/plans       – Alle Pläne abrufen (geschützt)
 * DELETE /api/plans/:id   – Einzelnen Plan löschen (geschützt)
 */

const express = require('express');
const { GEMINI_API_KEY, getModel } = require('../config');
const { sendResponse, authenticateToken } = require('../helpers');
const { plans, generatePlanId } = require('../data');

const router = express.Router();

// ── POST: Neuen Plan per KI generieren ──────────────────────

router.post('/', async (req, res) => {
    const { username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht, history } = req.body;

    try {
        const geminiHistory = buildChatHistory(history);
        const model = getModel();
        const chat = model.startChat({ history: geminiHistory });
        const prompt = buildPrompt({ username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht });

        if (!prompt) {
            return sendResponse(req, res, { error: 'Bitte Daten eingeben.' }, 400);
        }

        const result = await chat.sendMessage(prompt);
        const planText = result.response.text();

        // Plan in unserer "Datenbank" speichern
        const newPlan = {
            id: generatePlanId(),
            userId: 1,
            name: ziel || (nachricht ? nachricht.substring(0, 50) : 'Chat'),
            ziel: ziel || 'Chat',
            createdAt: new Date().toISOString(),
        };
        plans.push(newPlan);

        sendResponse(req, res, { plan: planText, planId: newPlan.id });
    } catch (error) {
        handleAiError(req, res, error);
    }
});

// ── GET: Alle Pläne laden (nur mit Token) ───────────────────

router.get('/', authenticateToken, (req, res) => {
    sendResponse(req, res, { plans });
});

// ── DELETE: Einzelnen Plan löschen ──────────────────────────

router.delete('/:id', authenticateToken, (req, res) => {
    const planId = parseInt(req.params.id);
    const index = plans.findIndex(p => p.id === planId);
    if (index !== -1) plans.splice(index, 1);

    sendResponse(req, res, { message: 'Trainingsplan erfolgreich gelöscht.' });
});

// ── Hilfsfunktionen (nur in dieser Datei verwendet) ─────────

/**
 * Baut den Chat-Verlauf in das Gemini-Format um.
 * Gemini erwartet, dass der Verlauf mit einer User-Nachricht beginnt.
 */
function buildChatHistory(history) {
    let recent = history ? history.slice(-4) : [];

    // Falls die erste Nachricht von der KI ist, entfernen
    if (recent.length > 0 && recent[0].sender === 'ai') {
        recent.shift();
    }

    return recent.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
    }));
}

/**
 * Erstellt den Prompt für die KI – je nachdem ob der User
 * einen Wochenplan will oder eine freie Chat-Frage stellt.
 */
function buildPrompt({ username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht }) {
    if (nachricht) {
        return `Systemanweisung: Du bist der Personal Trainer 'MyJyms'. `
            + `User: "${username || 'User'}" (Level: ${fitness || 'unbekannt'}). `
            + `Beantworte: "${nachricht}"`;
    }

    if (ziel) {
        return `Systemanweisung: Du bist der KI-Coach von 'MyJyms'. `
            + `Erstelle einen Wochen-Trainingsplan für ${username}. `
            + `Geschlecht: ${geschlecht}, Alter: ${alter}, `
            + `Gewicht: ${gewicht}kg, Größe: ${groesse}cm, `
            + `Level: ${fitness}, Ziel: ${ziel}. `
            + `Sprich den User mit "${username}" an.`;
    }

    return null; // Kein Prompt möglich
}

/** Kategorisiert KI-Fehler und gibt eine verständliche Meldung zurück */
function handleAiError(req, res, error) {
    console.error('\x1b[31m[KI FEHLER]\x1b[0m', error.message || error);

    // Rate Limit (zu viele Anfragen in kurzer Zeit)
    if (error.status === 429 || error.message?.includes('429')) {
        return sendResponse(req, res, {
            plan: 'Rate Limit erreicht. Bitte ca. 1 Minute warten.',
        }, 429);
    }

    // API-Key fehlt komplett
    if (!GEMINI_API_KEY) {
        return sendResponse(req, res, {
            plan: 'API-Key fehlt! Bitte GEMINI_API_KEY in backend/.env eintragen.',
        }, 500);
    }

    // API-Key ungültig
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
        return sendResponse(req, res, {
            plan: 'Der API-Key ist ungültig. Bitte prüfe deinen GEMINI_API_KEY.',
        }, 500);
    }

    // Unbekannter Fehler
    sendResponse(req, res, {
        plan: 'KI-Fehler: ' + (error.message || 'Unbekannter Fehler. Siehe Server-Konsole.'),
    }, 500);
}

module.exports = router;
