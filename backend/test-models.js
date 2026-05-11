require('dotenv').config();

async function checkModels() {
    console.log("Frage Google nach verfügbaren Modellen...");
    
    try {
        // Wir nutzen die direkte Google API URL, um alle Modelle abzufragen
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("\n✅ Erfolgreich! Kopiere EINES dieser Modelle in deine server.js:");
            console.log("--------------------------------------------------");
            
            // Wir filtern nach Modellen, die Text generieren können
            data.models.forEach(model => {
                if (model.supportedGenerationMethods.includes('generateContent')) {
                    // Wir entfernen das "models/" am Anfang, damit du nur den reinen Namen hast
                    console.log(`-> "${model.name.replace('models/', '')}"`);
                }
            });
            console.log("--------------------------------------------------\n");
        } else {
            console.log("❌ Fehler bei der Abfrage:", data);
        }
    } catch (error) {
        console.log("Netzwerkfehler:", error);
    }
}

checkModels();