/**
 * config.js – Globale Konfiguration
 *
 * Wird als erstes Script geladen und stellt Konstanten
 * und gemeinsamen Zustand für alle anderen Module bereit.
 *
 * Clean Code: Single Source of Truth – Konstanten nur hier definieren.
 */

// Backend-URL (beim Deployment anpassen)
const API_BASE = 'http://localhost:3000';

// Gemeinsamer Zustand, auf den alle Module zugreifen
const chatHistory = [];
let currentModelId = 'gemini-2.5-flash';
