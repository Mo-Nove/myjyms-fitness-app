const outputDiv = document.getElementById('output');

// --- M9: Login Logik ---
document.getElementById('btnLogin').addEventListener('click', async () => {
    const user = document.getElementById('inputUsername').value;
    const pass = document.getElementById('inputPassword').value;
    const statusText = document.getElementById('loginStatus');

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login erfolgreich: Neuen Token speichern
            localStorage.setItem('jwt_token', data.token);
            statusText.innerHTML = "✅ Eingeloggt! Token wurde im Browser gespeichert.";
            statusText.style.color = "green";
        } else {
            // WICHTIG: Login fehlgeschlagen! Wir werfen den alten Token weg.
            localStorage.removeItem('jwt_token'); 
            statusText.innerHTML = "❌ Login fehlgeschlagen. Alter Token gelöscht.";
            statusText.style.color = "red";
        }
    } catch (error) {
        console.error("Fehler beim Login.");
    }
});

// Hilfsfunktion, um die Server-Antwort schön anzuzeigen
function showResponse(data) {
    // Wandelt das JSON-Objekt in einen lesbaren Text um
    outputDiv.innerText = JSON.stringify(data, null, 2);
}

// ----------------------------------------------------
// 1. GET Request (Ressourcen abfragen)
// ----------------------------------------------------
document.getElementById('btnGet').addEventListener('click', async () => {
    try {
        const response = await fetch('http://localhost:3000/api/exercises');
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: "Fehler beim Verbinden mit dem Server." });
    }
});

// ----------------------------------------------------
// 2. POST Request (Neue Ressource erstellen)
// ----------------------------------------------------
document.getElementById('btnPost').addEventListener('click', async () => {
    const ziel = document.getElementById('inputPost').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/plans', {
            method: 'POST', // WICHTIG: Methode ändern
            headers: { 'Content-Type': 'application/json' }, // Wir sagen dem Server: "Hier kommt JSON!"
            body: JSON.stringify({ ziel: ziel }) // Unsere Daten aus dem Eingabefeld
        });
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: "Fehler beim Senden (POST)." });
    }
});

// ----------------------------------------------------
// 3. PUT Request (Ressource updaten)
// ----------------------------------------------------
document.getElementById('btnPut').addEventListener('click', async () => {
    const gewicht = document.getElementById('inputPut').value;
    const userId = 1; // Wir tun so, als wäre der User mit der ID 1 eingeloggt
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ neuesGewicht: gewicht })
        });
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: "Fehler beim Updaten (PUT)." });
    }
});

// ----------------------------------------------------
// 4. DELETE Request (Ressource löschen)
// ----------------------------------------------------
document.getElementById('btnDelete').addEventListener('click', async () => {
    const planId = document.getElementById('inputDelete').value;
    const token = localStorage.getItem('jwt_token'); // Wir holen den Stempel aus dem Browser
    
    try {
        const response = await fetch(`http://localhost:3000/api/plans/${planId}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` // Wir zeigen den Stempel im Header vor!
            }
        });
        const data = await response.json();
        showResponse(data);
    } catch (error) {
        showResponse({ error: "Fehler beim Löschen (DELETE)." });
    }
});