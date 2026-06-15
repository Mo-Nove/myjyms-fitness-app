/**
 * routes/models.js – KI-Modell-Verwaltung
 *
 * GET /api/models – Verfügbare Modelle + aktuell aktives Modell
 * PUT /api/models – Aktives KI-Modell wechseln
 */

const express = require('express');
const { AVAILABLE_MODELS, getCurrentModelId, switchModel } = require('../config');
const { sendResponse } = require('../helpers');

const router = express.Router();

// ── GET: Verfügbare Modelle auflisten ───────────────────────

router.get('/', (req, res) => {
    sendResponse(req, res, {
        models: AVAILABLE_MODELS,
        current: getCurrentModelId(),
    });
});

// ── PUT: Aktives Modell wechseln ────────────────────────────

router.put('/', (req, res) => {
    const { modelId } = req.body;
    const found = AVAILABLE_MODELS.find(m => m.id === modelId);

    if (!found) {
        return sendResponse(req, res, { error: 'Modell nicht verfügbar.' }, 400);
    }

    switchModel(modelId);
    console.log(`\x1b[33m[MODEL] Gewechselt zu: ${found.name}\x1b[0m`);

    sendResponse(req, res, {
        message: `Modell gewechselt zu ${found.name}.`,
        current: getCurrentModelId(),
    });
});

module.exports = router;
