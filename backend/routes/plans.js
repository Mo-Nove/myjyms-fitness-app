/**
 * routes/plans.js – Trainingsplan-Verwaltung
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M6 – HTTP GET, POST, DELETE Endpunkte   → 3 Endpunkte (siehe unten)
 *   M8 – Mind. 1 externer REST-Service      → Google Gemini API (Externe API 1)
 *   M9 – Geschützte Routen mit JWT          → GET und DELETE via authenticateToken
 *
 * POST   /api/plans      – KI-Trainingsplan generieren (2-Stufen-Fallback)
 *                           Stufe 1: Google Gemini API (KI-Antwort)
 *                           Stufe 2: Fixe Antworten (personalisiert)
 * GET    /api/plans       – Alle Pläne abrufen (geschützt mit JWT)
 * DELETE /api/plans/:id   – Einzelnen Plan löschen (geschützt mit JWT)
 */

const express = require('express');
const { GEMINI_API_KEY, getModel } = require('../config');
const { sendResponse, authenticateToken } = require('../helpers');
const { plans, generatePlanId } = require('../data');
const fallbackResponses = require('../fallback-responses');

const router = express.Router();

// ══════════════════════════════════════════════════════════════
//  POST: Trainingsplan generieren – 2-Stufen-Fallback
//
//  Stufe 1 → Google Gemini KI    (M8: Externer REST-Service 1)
//  Stufe 2 → Fixe Antworten       (personalisiert mit User-Daten)
// ══════════════════════════════════════════════════════════════

router.post('/', async (req, res) => {
    const { username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht, history, muskelgruppe } = req.body;

    // ── Stufe 1: Google Gemini KI (Externe API 1) ───────────
    try {
        const geminiHistory = buildChatHistory(history);
        const model = getModel();
        const chat = model.startChat({ history: geminiHistory });
        const prompt = buildPrompt({ username, geschlecht, fitness, alter, gewicht, groesse, ziel, nachricht });

        const result = await chat.sendMessage(prompt);
        const planText = result.response.text();

        const newPlan = {
            id: generatePlanId(),
            userId: 1,
            name: ziel || (nachricht ? nachricht.substring(0, 50) : 'Chat'),
            ziel: ziel || 'Chat',
            createdAt: new Date().toISOString(),
        };
        plans.push(newPlan);

        return sendResponse(req, res, { plan: planText, planId: newPlan.id });
    } catch (error) {
        console.error('\x1b[33m[FALLBACK] Gemini fehlgeschlagen →\x1b[0m', error.message || error);
    }

    // ── Stufe 2: Fixe Antworten (personalisiert mit User-Daten) ──
    const userData = { username, alter, fitness, geschlecht };

    if (muskelgruppe) {
        // Muskel-Klick → fixe Übungen für diese Muskelgruppe
        console.log('\x1b[35m[FALLBACK] Fixe Antwort für:\x1b[0m', muskelgruppe);
        return sendResponse(req, res, { plan: fallbackResponses.getResponse(muskelgruppe, userData) });
    }
    if (ziel) {
        // Wochenplan-Button → fixer Wochenplan basierend auf dem Ziel
        console.log('\x1b[35m[FALLBACK] Fixer Wochenplan für Ziel:\x1b[0m', ziel);
        return sendResponse(req, res, { plan: fallbackResponses.getWochenplan(ziel, userData) });
    }
    // Freie Chat-Nachricht → allgemeine Trainingstipps
    console.log('\x1b[35m[FALLBACK] Fixe Chat-Antwort\x1b[0m');
    sendResponse(req, res, { plan: fallbackResponses.getChatResponse(userData) });
});

// ── GET: Alle Pläne laden (M6: GET, M9: JWT-geschützt) ───────

router.get('/', authenticateToken, (req, res) => {
    sendResponse(req, res, { plans });
});

// ── DELETE: Einzelnen Plan löschen (M6: DELETE) ────────────

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

    const name = username || 'User';
    const details = [];
    if (geschlecht) details.push(`Geschlecht: ${geschlecht}`);
    if (alter)      details.push(`Alter: ${alter}`);
    if (gewicht)    details.push(`Gewicht: ${gewicht}kg`);
    if (groesse)    details.push(`Größe: ${groesse}cm`);
    if (fitness)    details.push(`Level: ${fitness}`);
    if (ziel)       details.push(`Ziel: ${ziel}`);

    return `Systemanweisung: Du bist der KI-Coach von 'MyJyms'. `
        + `Erstelle einen Wochen-Trainingsplan für ${name}. `
        + (details.length ? details.join(', ') + '. ' : '')
        + `Sprich den User mit "${name}" an.`;
}

/** Kategorisiert KI-Fehler und gibt eine verständliche Meldung zurück */
function handleAiError(req, res, error) {
    console.error('\x1b[31m[KI FEHLER]\x1b[0m', error.message || error);
    const msg = error.message || '';

    // Rate Limit (zu viele Anfragen in kurzer Zeit)
    if (error.status === 429 || msg.includes('429')) {
        return sendResponse(req, res, {
            plan: 'Unser KI-Coach ist gerade sehr gefragt. Bitte warte kurz und versuche es in einer Minute erneut.',
        }, 429);
    }

    // Server überlastet (503)
    if (error.status === 503 || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand')) {
        return sendResponse(req, res, {
            plan: 'Unser KI-Coach macht gerade eine kurze Pause – der Dienst ist vorübergehend überlastet. Bitte versuche es in ein paar Sekunden erneut.',
        }, 503);
    }

    // API-Key fehlt komplett
    if (!GEMINI_API_KEY) {
        return sendResponse(req, res, {
            plan: 'Der KI-Coach ist noch nicht eingerichtet. Bitte kontaktiere den Administrator.',
        }, 500);
    }

    // API-Key ungültig
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        return sendResponse(req, res, {
            plan: 'Der KI-Coach konnte nicht gestartet werden. Bitte kontaktiere den Administrator.',
        }, 500);
    }

    // Netzwerk-/Timeout-Fehler
    if (msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT') || msg.includes('fetch')) {
        return sendResponse(req, res, {
            plan: 'Der KI-Coach ist gerade nicht erreichbar. Bitte prüfe deine Internetverbindung und versuche es erneut.',
        }, 502);
    }

    // Unbekannter Fehler – kein technischer Text an den Nutzer
    sendResponse(req, res, {
        plan: 'Da ist leider etwas schiefgelaufen. Bitte versuche es erneut oder kontaktiere den Support.',
    }, 500);
}

module.exports = router;
