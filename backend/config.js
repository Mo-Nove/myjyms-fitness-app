/**
 * config.js – Zentrale Konfiguration
 *
 * Alle Einstellungen sind hier gesammelt, damit man sie
 * an einer einzigen Stelle ändern kann (Single Source of Truth).
 */

const path = require('path');

// .env Datei laden – der Pfad muss absolut sein, weil Node.js
// sonst relativ zum Arbeitsverzeichnis (cwd) sucht statt zum Skript
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ── Server ──────────────────────────────────────────────────

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mein_super_geheimes_passwort';

// ── Google Gemini KI (Externe API 1) ────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const AVAILABLE_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Schnell & effizient' },
];

// Das aktuell aktive KI-Modell – kann zur Laufzeit gewechselt werden
let currentModelId = 'gemini-2.5-flash';
let model = genAI.getGenerativeModel({ model: currentModelId });

/** Wechselt das aktive KI-Modell */
function switchModel(modelId) {
    currentModelId = modelId;
    model = genAI.getGenerativeModel({ model: modelId });
}

/** Gibt das aktive Modell-Objekt zurück (für Gemini-Chat) */
function getModel() {
    return model;
}

/** Gibt die aktuelle Modell-ID als String zurück */
function getCurrentModelId() {
    return currentModelId;
}

module.exports = {
    PORT,
    JWT_SECRET,
    GEMINI_API_KEY,
    AVAILABLE_MODELS,
    getModel,
    getCurrentModelId,
    switchModel,
};
