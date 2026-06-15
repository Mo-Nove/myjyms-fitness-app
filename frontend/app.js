/**
 * app.js – Admin-Dashboard Logik (Zweite Frontend-Komponente)
 *
 * Steuert das Admin-Dashboard (admin.html):
 * - Login / Logout für Administratoren
 * - Dark Mode
 * - Tab-Navigation (Users, Pläne, Übungen, APIs)
 * - CRUD-Operationen über die REST-API
 * - Format-Toggle: JSON ↔ XML Antworten
 *
 * Verwendete HTTP-Methoden: GET, POST, PATCH, DELETE
 */

const API_BASE = 'http://localhost:3000';

// ── DOM-Referenzen ──────────────────────────────────────────

const loginView     = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const loginMsg      = document.getElementById('loginMsg');

let authToken = sessionStorage.getItem('admin_token') || null;

// Auto-Login wenn noch ein Token vorhanden ist
if (authToken) showDashboard();

// ══════════════════════════════════════════════════════════════
//  LOGIN (POST /api/login)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnAdminLogin').addEventListener('click', async () => {
    const username = document.getElementById('adminUser').value;
    const password = document.getElementById('adminPass').value;

    try {
        const response = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            sessionStorage.setItem('admin_token', authToken);
            showDashboard();
        } else {
            showStatus(loginMsg, data.error, false);
        }
    } catch {
        showStatus(loginMsg, 'Server nicht erreichbar.', false);
    }
});

// Enter-Taste zum Einloggen
document.getElementById('adminPass').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btnAdminLogin').click();
});

function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════
//  LOGOUT
// ══════════════════════════════════════════════════════════════

document.getElementById('btnAdminLogout').addEventListener('click', () => {
    sessionStorage.removeItem('admin_token');
    authToken = null;
    dashboardView.style.display = 'none';
    loginView.style.display = 'flex';
});

// ══════════════════════════════════════════════════════════════
//  DARK MODE
// ══════════════════════════════════════════════════════════════

document.getElementById('btnDarkMode').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('admin_darkmode', isDark);
    document.getElementById('btnDarkMode').innerText = isDark ? '☀️' : '🌙';
});

// Dark Mode wiederherstellen
if (localStorage.getItem('admin_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('btnDarkMode').innerText = '☀️';
}

// ══════════════════════════════════════════════════════════════
//  TAB-NAVIGATION
// ══════════════════════════════════════════════════════════════

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Alle Tabs deaktivieren
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        // Gewählten Tab aktivieren
        btn.classList.add('active');
        const sectionName = btn.dataset.section;
        const sectionId = 'section' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
        document.getElementById(sectionId).classList.add('active');
    });
});

// ══════════════════════════════════════════════════════════════
//  HILFSFUNKTIONEN (DRY: werden überall wiederverwendet)
// ══════════════════════════════════════════════════════════════

/** Gibt den richtigen Accept-Header zurück (JSON oder XML) */
function getAcceptHeader() {
    const format = document.getElementById('formatSelect').value;
    return format === 'xml' ? 'application/xml' : 'application/json';
}

/** Erstellt die Standard-Headers für authentifizierte Anfragen */
function authHeaders() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Accept': getAcceptHeader(),
        'Content-Type': 'application/json',
    };
}

/** Zeigt eine Erfolgs- oder Fehlermeldung in einem Element an */
function showStatus(element, message, isSuccess) {
    const cssClass = isSuccess ? 'status-success' : 'status-error';
    element.innerHTML = `<div class="status-msg ${cssClass}">${message}</div>`;
}

/** Zeigt Rohdaten (JSON/XML) in einem Pre-Element an */
function showRaw(element, data) {
    element.style.display = 'block';
    element.textContent = typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2);
}

// ══════════════════════════════════════════════════════════════
//  USERS: GET /api/users (alle Benutzer laden)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnLoadUsers').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/users`, { headers: authHeaders() });
        const isXml = response.headers.get('content-type')?.includes('xml');

        if (isXml) {
            const text = await response.text();
            showRaw(document.getElementById('usersRaw'), text);
            document.getElementById('usersTable').innerHTML = '<p>XML-Antwort im Raw-Output angezeigt.</p>';
            return;
        }

        const data = await response.json();
        showRaw(document.getElementById('usersRaw'), data);

        if (data.users) {
            let html = '<table><thead><tr><th>ID</th><th>Username</th><th>Rolle</th><th>Gewicht</th><th>Groesse</th><th>Alter</th><th>Level</th><th>Aktion</th></tr></thead><tbody>';
            data.users.forEach(u => {
                html += `<tr>
                    <td>${u.id}</td><td>${u.username}</td><td>${u.role}</td>
                    <td>${u.gewicht ?? '-'} kg</td><td>${u.groesse ?? '-'} cm</td>
                    <td>${u.alter ?? '-'}</td><td>${u.fitness ?? '-'}</td>
                    <td><button class="btn btn-danger btn-delete-user" data-id="${u.id}">Loeschen</button></td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('usersTable').innerHTML = html;
            attachUserDeleteHandlers();
        }
    } catch {
        showStatus(document.getElementById('usersTable'), 'Fehler beim Laden.', false);
    }
});

// ══════════════════════════════════════════════════════════════
//  USERS: DELETE /api/users/:id (User löschen)
// ══════════════════════════════════════════════════════════════

function attachUserDeleteHandlers() {
    document.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.id;
            if (!confirm(`User ${userId} wirklich loeschen?`)) return;

            try {
                const response = await fetch(`${API_BASE}/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: authHeaders(),
                });
                const data = await response.json();

                if (response.ok) {
                    btn.closest('tr').remove();
                    showStatus(document.getElementById('usersTable'), data.message, true);
                } else {
                    showStatus(document.getElementById('usersTable'), data.error || 'Fehler.', false);
                }
            } catch {
                showStatus(document.getElementById('usersTable'), 'Fehler beim Loeschen.', false);
            }
        });
    });
}

// ══════════════════════════════════════════════════════════════
//  USERS: PATCH /api/users/:id (einzelne Felder ändern – C3)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnPatchUser').addEventListener('click', async () => {
    const userId   = document.getElementById('patchUserId').value;
    const username = document.getElementById('patchUsername').value.trim();
    const gewicht  = document.getElementById('patchGewicht').value;
    const groesse  = document.getElementById('patchGroesse').value;
    const alter    = document.getElementById('patchAlter').value;
    const fitness  = document.getElementById('patchFitness').value;
    const role     = document.getElementById('patchRole').value;

    const body = {};
    if (username) body.username = username;
    if (gewicht)  body.gewicht  = parseInt(gewicht);
    if (groesse)  body.groesse  = parseInt(groesse);
    if (alter)    body.alter    = parseInt(alter);
    if (fitness)  body.fitness  = fitness;
    if (role)     body.role     = role;

    if (Object.keys(body).length === 0) {
        showStatus(document.getElementById('patchResult'), 'Bitte mindestens ein Feld ausfuellen.', false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/users/${userId}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(body),
        });
        const isXml = response.headers.get('content-type')?.includes('xml');
        const data = isXml ? await response.text() : await response.json();

        if (isXml) {
            showStatus(document.getElementById('patchResult'), response.ok ? 'PATCH erfolgreich (XML)' : 'Fehler (XML)', response.ok);
        } else {
            const msg = response.ok ? (data.message || 'Aktualisiert!') : (data.error || 'Fehler beim Aktualisieren.');
            showStatus(document.getElementById('patchResult'), msg, response.ok);
        }
    } catch {
        showStatus(document.getElementById('patchResult'), 'Fehler beim Patch.', false);
    }
});

// ══════════════════════════════════════════════════════════════
//  USERS: POST /api/users (neuen User anlegen)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnCreateUser').addEventListener('click', async () => {
    const username = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const role     = document.getElementById('newRole').value;
    const gewicht  = document.getElementById('newGewicht').value;
    const groesse  = document.getElementById('newGroesse').value;
    const alter    = document.getElementById('newAlter').value;
    const fitness  = document.getElementById('newFitness').value;

    if (!username || !password) {
        showStatus(document.getElementById('createResult'), 'Username und Passwort sind Pflicht.', false);
        return;
    }

    const body = { username, password, role };
    if (gewicht) body.gewicht = parseInt(gewicht);
    if (groesse) body.groesse = parseInt(groesse);
    if (alter)   body.alter   = parseInt(alter);
    if (fitness) body.fitness = fitness;

    try {
        const response = await fetch(`${API_BASE}/api/users`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(body),
        });
        const data = await response.json();
        const msg = response.ok ? (data.message || 'User erstellt!') : (data.error || 'Fehler.');
        showStatus(document.getElementById('createResult'), msg, response.ok);

        if (response.ok) {
            document.getElementById('newUsername').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('newGewicht').value  = '';
            document.getElementById('newGroesse').value  = '';
            document.getElementById('newAlter').value    = '';
            document.getElementById('newFitness').value  = '';
            document.getElementById('newRole').value     = 'user';
        }
    } catch {
        showStatus(document.getElementById('createResult'), 'Fehler beim Erstellen.', false);
    }
});

// ══════════════════════════════════════════════════════════════
//  PLANS: GET /api/plans (alle Trainingspläne laden)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnLoadPlans').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/plans`, { headers: authHeaders() });
        const isXml = response.headers.get('content-type')?.includes('xml');

        if (isXml) {
            const text = await response.text();
            showRaw(document.getElementById('plansRaw'), text);
            document.getElementById('plansTable').innerHTML = '<p>XML-Antwort im Raw-Output angezeigt.</p>';
            return;
        }

        const data = await response.json();
        showRaw(document.getElementById('plansRaw'), data);

        if (data.plans) {
            let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Ziel</th><th>Erstellt</th><th>Aktion</th></tr></thead><tbody>';
            data.plans.forEach(p => {
                const date = new Date(p.createdAt).toLocaleDateString('de-DE');
                html += `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.ziel}</td><td>${date}</td>`;
                html += `<td><button class="btn btn-danger btn-delete-plan" data-id="${p.id}">Löschen</button></td></tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('plansTable').innerHTML = html;
            attachDeleteHandlers(); // Löschen-Buttons aktivieren
        }
    } catch {
        showStatus(document.getElementById('plansTable'), 'Fehler beim Laden.', false);
    }
});

// ══════════════════════════════════════════════════════════════
//  PLANS: DELETE /api/plans/:id (einzelnen Plan löschen)
// ══════════════════════════════════════════════════════════════

/** Registriert Click-Events für alle Löschen-Buttons in der Tabelle */
function attachDeleteHandlers() {
    document.querySelectorAll('.btn-delete-plan').forEach(btn => {
        btn.addEventListener('click', async () => {
            const planId = btn.dataset.id;
            if (!confirm(`Plan ${planId} wirklich löschen?`)) return;

            try {
                const response = await fetch(`${API_BASE}/api/plans/${planId}`, {
                    method: 'DELETE',
                    headers: authHeaders(),
                });
                const data = await response.json();

                if (response.ok) {
                    btn.closest('tr').remove(); // Zeile aus der Tabelle entfernen
                    showStatus(document.getElementById('plansTable'), data.message, true);
                }
            } catch {
                showStatus(document.getElementById('plansTable'), 'Fehler beim Löschen.', false);
            }
        });
    });
}

// ══════════════════════════════════════════════════════════════
//  EXERCISES: GET /api/exercises (interne Übungen)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnLoadExercises').addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE}/api/exercises`, {
            headers: { 'Accept': getAcceptHeader() },
        });
        const isXml = response.headers.get('content-type')?.includes('xml');

        if (isXml) {
            const text = await response.text();
            document.getElementById('exercisesTable').innerHTML = `<pre class="raw-output">${text}</pre>`;
            return;
        }

        const data = await response.json();
        if (data.exercises) {
            let html = '<table><thead><tr><th>ID</th><th>Name</th><th>Muskel</th><th>Schwierigkeit</th></tr></thead><tbody>';
            data.exercises.forEach(e => {
                html += `<tr><td>${e.id}</td><td>${e.name}</td><td>${e.muscle}</td><td>${e.difficulty}</td></tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('exercisesTable').innerHTML = html;
        }
    } catch {
        showStatus(document.getElementById('exercisesTable'), 'Fehler beim Laden.', false);
    }
});

// ══════════════════════════════════════════════════════════════
//  EXTERNE API: GET /api/exercises/external (wger.de – API 2)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnLoadExternal').addEventListener('click', async () => {
    const el = document.getElementById('externalResult');
    el.textContent = 'Lade...';
    el.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/api/exercises/external`, {
            headers: { 'Accept': getAcceptHeader() },
        });
        const isXml = response.headers.get('content-type')?.includes('xml');
        const data = isXml ? await response.text() : await response.json();
        showRaw(el, data);
    } catch {
        el.textContent = 'Fehler beim Laden der externen API.';
    }
});

// ══════════════════════════════════════════════════════════════
//  EXTERNE API: GET /api/weather (Open-Meteo – API 3)
// ══════════════════════════════════════════════════════════════

document.getElementById('btnLoadWeather').addEventListener('click', async () => {
    const el = document.getElementById('weatherResult');
    el.textContent = 'Lade...';
    el.style.display = 'block';

    try {
        const response = await fetch(`${API_BASE}/api/weather`, {
            headers: { 'Accept': getAcceptHeader() },
        });
        const isXml = response.headers.get('content-type')?.includes('xml');
        const data = isXml ? await response.text() : await response.json();
        showRaw(el, data);
    } catch {
        el.textContent = 'Fehler beim Laden der Wetter-API.';
    }
});