/**
 * config.js – Globale Konfiguration (Frontend)
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M2 – Frontend ist eigene Komponente     → /frontend Ordner (HTML5, CSS, JS)
 *   M3 – Kommunikation über HTTP            → API_BASE zeigt auf Backend (Port 3000)
 *
 * Wird als erstes Script geladen und stellt Konstanten
 * und gemeinsamen Zustand für alle anderen Module bereit.
 */

// Backend-URL – Frontend kommuniziert über HTTP mit dem Backend (M3)
const API_BASE = 'http://localhost:3000';

// Gemeinsamer Zustand, auf den alle Module zugreifen
const chatHistory = [];
let currentModelId = 'gemini-2.5-flash';
