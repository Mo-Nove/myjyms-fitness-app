/**
 * data.js – In-Memory Datenspeicher
 *
 * In einer echten Anwendung würde man hier eine Datenbank verwenden
 * (z.B. MongoDB oder PostgreSQL). Für dieses Projekt reichen Arrays.
 *
 * Hinweis: Alle Daten gehen verloren, wenn der Server neu startet.
 */

// ── Benutzer ────────────────────────────────────────────────

const users = [
    {
        id: 1,
        username: 'admin',
        password: '1234',
        role: 'admin',
        gewicht: 80,
        groesse: 180,
        alter: 25,
        fitness: 'Fortgeschritten',
    },
    {
        id: 2,
        username: 'user',
        password: 'user',
        role: 'user',
        gewicht: 70,
        groesse: 175,
        alter: 22,
        fitness: 'Anfänger',
    },
];

// ── Trainingspläne ──────────────────────────────────────────

const plans = [
    {
        id: 1,
        userId: 1,
        name: 'Hypertrophie-Plan',
        ziel: 'Muskelaufbau',
        createdAt: '2024-01-15T10:00:00Z',
    },
    {
        id: 2,
        userId: 2,
        name: 'Cardio-Programm',
        ziel: 'Ausdauer',
        createdAt: '2024-01-20T14:30:00Z',
    },
];

// Fortlaufende ID für neue Pläne
let nextPlanId = 3;

// Fortlaufende ID für neue User
let nextUserId = 3;

/** Erzeugt eine neue eindeutige Plan-ID */
function generatePlanId() {
    return nextPlanId++;
}

/** Erzeugt eine neue eindeutige User-ID */
function generateUserId() {
    return nextUserId++;
}

module.exports = { users, plans, generatePlanId, generateUserId };
