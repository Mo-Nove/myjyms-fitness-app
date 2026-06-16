/**
 * helpers.js – Hilfsfunktionen
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   M5 – Endpunkte liefern JSON oder XML    → sendResponse()
 *   M9 – Session Management (JWT)           → authenticateToken()
 *   C2 – Antworten als JSON UND XML         → convertToXml() + Accept-Header Logik
 *
 * Enthält die XML-Konvertierung und die einheitliche Antwort-Funktion,
 * die je nach Accept-Header des Clients JSON oder XML zurückgibt.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');

// ── XML-Konvertierung (C2: JSON + XML Responses) ────────────

/** Sonderzeichen für XML escapen, um Injection zu verhindern */
function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/** Wandelt ein JavaScript-Objekt rekursiv in einen XML-String um */
function convertToXml(data, rootElement = 'response') {
    function serialize(obj) {
        let xml = '';
        for (const key in obj) {
            // XML-Tags dürfen keine Sonderzeichen enthalten
            const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');

            if (Array.isArray(obj[key])) {
                xml += `<${safeKey}>`;
                obj[key].forEach(item => {
                    xml += '<item>';
                    xml += typeof item === 'object' && item !== null
                        ? serialize(item)
                        : escapeXml(item);
                    xml += '</item>';
                });
                xml += `</${safeKey}>`;
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                xml += `<${safeKey}>${serialize(obj[key])}</${safeKey}>`;
            } else {
                xml += `<${safeKey}>${escapeXml(obj[key])}</${safeKey}>`;
            }
        }
        return xml;
    }

    return `<?xml version="1.0" encoding="UTF-8"?><${rootElement}>${serialize(data)}</${rootElement}>`;
}

// ── Einheitliche Antwort-Funktion ───────────────────────────

/**
 * Sendet die Antwort im richtigen Format (M5, C2):
 * - Client schickt "Accept: application/xml" → XML-Antwort
 * - Sonst → JSON (Standard)
 *
 * Wird von ALLEN Endpunkten verwendet, dadurch unterstützt
 * jeder Endpunkt automatisch beide Formate.
 */
function sendResponse(req, res, data, statusCode = 200) {
    const accept = req.headers['accept'] || '';

    if (accept.includes('application/xml')) {
        res.status(statusCode).type('application/xml').send(convertToXml(data));
    } else {
        res.status(statusCode).json(data);
    }
}

// ── JWT Middleware (M9: Session Management) ──────────────────

/**
 * Prüft den JWT-Token im Authorization-Header.
 * Schützt Routen, die nur für eingeloggte User zugänglich sind.
 *
 * Verwendung: app.get('/geschuetzt', authenticateToken, handler)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

    if (!token) {
        return sendResponse(req, res, { error: 'Authentifizierung erforderlich.' }, 401);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return sendResponse(req, res, { error: 'Token ungültig oder abgelaufen.' }, 403);
        }
        req.user = decoded;
        next();
    });
}

module.exports = { sendResponse, authenticateToken };
