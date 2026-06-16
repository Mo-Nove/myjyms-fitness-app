/**
 * fallback-responses.js – Fixe Übungsempfehlungen (Fallback-Stufe 2)
 *
 * Wird verwendet, wenn die KI (Google Gemini) nicht erreichbar ist.
 * Die Antworten werden mit Benutzerdaten (Name, Alter, Fitness-Level)
 * personalisiert, damit sie trotzdem individuell wirken.
 */

const RESPONSES = {
    brust: [
        'Hier sind die Top Brust-Übungen:\n\n1. **Bankdrücken (Bench Press)** – Der Klassiker für Brustmasse. 3–4 Sätze à 8–12 Wdh.\n2. **Liegestütze (Push-Ups)** – Perfekt für überall, keine Geräte nötig. 3 Sätze bis zum Muskelversagen.\n3. **Schrägbankdrücken (Incline Press)** – Fokus auf die obere Brust. 3 Sätze à 10–12 Wdh.\n4. **Fliegende (Dumbbell Flyes)** – Isolationsübung für maximale Dehnung. 3 Sätze à 12–15 Wdh.\n\n> 💡 Tipp: Beginne mit der schwersten Übung, wenn du noch frisch bist!',
        'Die besten Brustübungen für dein Training:\n\n1. **Dips** – Oberkörper leicht nach vorne lehnen für Brustfokus. 3 × 10–15.\n2. **Kurzhantel-Bankdrücken** – Größerer Bewegungsradius als Langhantel. 3 × 10–12.\n3. **Cable Crossover** – Konstante Spannung auf der Brust. 3 × 12–15.\n\n> 💡 Tipp: Achte auf die Mind-Muscle-Connection – spüre die Brust bei jeder Wiederholung!',
    ],
    bauch: [
        'Hier ist ein starkes Core-Workout:\n\n1. **Plank** – 3 × 30–60 Sekunden halten.\n2. **Crunches** – 3 × 20 Wiederholungen.\n3. **Beinheben (Leg Raises)** – 3 × 15 für den unteren Bauch.\n4. **Russian Twists** – 3 × 20 (mit oder ohne Gewicht).\n5. **Mountain Climbers** – 3 × 30 Sekunden.\n\n> 💡 Tipp: Bauchmuskeln werden in der Küche gemacht – Ernährung ist entscheidend!',
    ],
    beine: [
        'Intensives Beintraining:\n\n1. **Kniebeugen (Squats)** – König aller Übungen! 4 × 8–12.\n2. **Ausfallschritte (Lunges)** – 3 × 12 pro Seite.\n3. **Beinpresse (Leg Press)** – 3 × 12–15.\n4. **Wadenheben (Calf Raises)** – 4 × 15–20.\n5. **Beinstrecker (Leg Extension)** – 3 × 12 für den Quadrizeps.\n\n> 💡 Tipp: Nie den Leg Day skippen – starke Beine sind das Fundament!',
    ],
    arme: [
        'Arm-Workout für Bizeps & Trizeps:\n\n**Bizeps:**\n1. **Bizeps-Curls (Langhantel)** – 3 × 10–12.\n2. **Hammer Curls** – 3 × 12 für den Brachialis.\n3. **Konzentrations-Curls** – 3 × 12 für den Peak.\n\n**Trizeps:**\n1. **Trizeps-Dips** – 3 × 12–15.\n2. **Skull Crushers** – 3 × 10–12.\n3. **Trizepsdrücken am Kabel** – 3 × 15.\n\n> 💡 Tipp: Der Trizeps macht 2/3 des Armumfangs aus – vernachlässige ihn nicht!',
    ],
    nacken: [
        'Übungen für den Nacken & Trapezius:\n\n1. **Shrugs (Schulterheben)** – 4 × 15 mit Kurzhanteln.\n2. **Nackenziehen** – 3 × 12 am Kabelzug.\n3. **Face Pulls** – 3 × 15 für hintere Schulter & oberen Trapez.\n4. **Nackendehnung** – 30 Sekunden pro Seite halten.\n\n> 💡 Tipp: Nackenübungen beugen Verspannungen und Kopfschmerzen vor!',
    ],
    oberer_ruecken: [
        'Übungen für den oberen Rücken:\n\n1. **Klimmzüge (Pull-Ups)** – 3–4 × 8–12. Der beste Latissimus-Builder.\n2. **Langhantelrudern (Barbell Row)** – 3 × 10–12.\n3. **Latzug (Lat Pulldown)** – 3 × 12 als Klimmzug-Alternative.\n4. **Face Pulls** – 3 × 15 für Trapez & hintere Schulter.\n\n> 💡 Tipp: Ein starker Rücken kennt keinen Schmerz!',
    ],
    unterer_ruecken: [
        'Übungen für den unteren Rücken:\n\n1. **Hyperextensions** – 3 × 15 (mit oder ohne Zusatzgewicht).\n2. **Good Mornings** – 3 × 12 mit Langhantel.\n3. **Kreuzheben (Deadlift)** – 3 × 8 (wichtig: Technik zuerst!).\n4. **Superman Hold** – 3 × 30 Sekunden.\n\n> ⚠️ Bei Rückenproblemen immer zuerst einen Arzt konsultieren!',
    ],
    po: [
        'Intensives Glute-Workout:\n\n1. **Hip Thrusts** – Die #1 Übung für den Po! 4 × 12.\n2. **Sumo Squats** – 3 × 15 mit breiter Fußstellung.\n3. **Bulgarian Split Squats** – 3 × 12 pro Seite.\n4. **Glute Bridge** – 3 × 20 als Aufwärmübung.\n5. **Kickbacks am Kabelzug** – 3 × 15 pro Seite.\n\n> 💡 Tipp: Am obersten Punkt 2 Sekunden halten für maximalen Squeeze!',
    ],
    hamstrings: [
        'Übungen für die hintere Oberschenkelmuskulatur:\n\n1. **Rumänisches Kreuzheben (Romanian Deadlift)** – 3 × 10–12.\n2. **Beinbeuger-Maschine (Leg Curl)** – 3 × 12–15.\n3. **Good Mornings** – 3 × 12.\n4. **Nordic Hamstring Curls** – 3 × 6–8 (fortgeschritten!).\n\n> 💡 Tipp: Starke Hamstrings schützen vor Knieverletzungen!',
    ],
    trizeps: [
        'Trizeps-Workout für die Armrückseite:\n\n1. **Trizeps-Dips** – 3 × 12–15 (am Barren oder an der Bank).\n2. **Skull Crushers** – 3 × 10–12 mit SZ-Stange.\n3. **Trizepsdrücken am Kabel** – 3 × 15.\n4. **Enges Bankdrücken (Close-Grip Bench)** – 3 × 10.\n5. **Overhead Extension** – 3 × 12.\n\n> 💡 Tipp: Der Trizeps hat drei Köpfe – variiere die Übungen!',
    ],
    kopf: [
        'Mentale Übungen für dein Training:\n\n1. **Visualisierung** – Stell dir vor dem Satz die perfekte Ausführung vor.\n2. **Mind-Muscle-Connection** – Konzentriere dich auf den Zielmuskel bei jeder Wiederholung.\n3. **Box-Breathing** – 4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten. Perfekt zwischen den Sätzen.\n4. **Positive Selbstgespräche** – Ersetze „Ich kann nicht" durch „Ich werde".\n5. **Fokus-Musik** – Die richtige Playlist kann die Leistung um bis zu 15% steigern!\n\n> 🧠 Das stärkste Organ im Gym ist dein Gehirn!',
    ],
    allgemein: [
        'Hier sind ein paar allgemeine Trainingstipps:\n\n1. **Aufwärmen** – Immer 5–10 Minuten vor dem Training.\n2. **Progressive Overload** – Steigere regelmäßig Gewicht oder Wiederholungen.\n3. **Regeneration** – Mindestens 48h Pause pro Muskelgruppe.\n4. **Ernährung** – Genügend Protein (1,6–2,2g pro kg Körpergewicht).\n5. **Schlaf** – 7–9 Stunden für optimale Regeneration.\n\n> 💡 Konsistenz schlägt Perfektion – bleib dran!',
    ],
};

// ── Wochenpläne nach Trainingsziel ──────────────────────────

const WOCHENPLAENE = {
    muskelaufbau: '## 💪 Wochenplan – Muskelaufbau\n\n'
        + '| Tag | Training | Fokus |\n|-----|----------|-------|\n'
        + '| **Montag** | Brust & Trizeps | Bankdrücken, Schrägbank, Dips, Skull Crushers |\n'
        + '| **Dienstag** | Rücken & Bizeps | Klimmzüge, Rudern, Bizeps-Curls, Hammer Curls |\n'
        + '| **Mittwoch** | Ruhetag | Aktive Erholung (Spaziergang, Dehnen) |\n'
        + '| **Donnerstag** | Beine & Bauch | Kniebeugen, Beinpresse, Ausfallschritte, Plank |\n'
        + '| **Freitag** | Schultern & Arme | Schulterdrücken, Seitheben, Curls, Trizeps |\n'
        + '| **Samstag** | Ganzkörper (leicht) | Compound-Übungen mit reduziertem Gewicht |\n'
        + '| **Sonntag** | Ruhetag | Regeneration & gute Ernährung |\n\n'
        + '> 📌 **3–4 Sätze à 8–12 Wiederholungen** pro Übung. Steigere das Gewicht wöchentlich.',

    cardio: '## 🏃 Wochenplan – Cardio / Ausdauer\n\n'
        + '| Tag | Training | Dauer |\n|-----|----------|-------|\n'
        + '| **Montag** | Joggen (moderate Pace) | 30 Min. |\n'
        + '| **Dienstag** | Intervall-Training (HIIT) | 20 Min. |\n'
        + '| **Mittwoch** | Ruhetag | Leichtes Stretching |\n'
        + '| **Donnerstag** | Radfahren oder Schwimmen | 40 Min. |\n'
        + '| **Freitag** | Seilspringen + Bodyweight | 25 Min. |\n'
        + '| **Samstag** | Langer Lauf (lockeres Tempo) | 40–50 Min. |\n'
        + '| **Sonntag** | Ruhetag | Regeneration |\n\n'
        + '> 📌 Puls im aeroben Bereich halten (ca. 60–75% der max. Herzfrequenz).',

    abnehmen: '## 🔥 Wochenplan – Abnehmen / Fettverbrennung\n\n'
        + '| Tag | Training | Fokus |\n|-----|----------|-------|\n'
        + '| **Montag** | Ganzkörper-Krafttraining | Compound-Übungen (Kniebeugen, Bankdrücken, Rudern) |\n'
        + '| **Dienstag** | HIIT Cardio | 20 Min. Intervalle (30s Sprint / 60s Pause) |\n'
        + '| **Mittwoch** | Ruhetag | Spaziergang (30 Min.) |\n'
        + '| **Donnerstag** | Oberkörper + Core | Liegestütze, Klimmzüge, Plank, Russian Twists |\n'
        + '| **Freitag** | Unterkörper + Cardio | Ausfallschritte, Deadlifts, 15 Min. Radfahren |\n'
        + '| **Samstag** | Aktiver Tag | Wandern, Schwimmen oder Sport nach Wahl |\n'
        + '| **Sonntag** | Ruhetag | Regeneration & Meal Prep |\n\n'
        + '> 📌 Kaloriendefizit + Krafttraining = Fett verbrennen & Muskeln erhalten.',

    allgemein: '## 📋 Wochenplan – Allgemeine Fitness\n\n'
        + '| Tag | Training | Fokus |\n|-----|----------|-------|\n'
        + '| **Montag** | Push (Drückübungen) | Brust, Schultern, Trizeps |\n'
        + '| **Dienstag** | Cardio | 30 Min. Joggen oder Radfahren |\n'
        + '| **Mittwoch** | Pull (Zugübungen) | Rücken, Bizeps |\n'
        + '| **Donnerstag** | Ruhetag | Stretching & Mobilität |\n'
        + '| **Freitag** | Beine & Core | Kniebeugen, Ausfallschritte, Plank |\n'
        + '| **Samstag** | Freie Wahl | Lieblingssportart oder leichtes Training |\n'
        + '| **Sonntag** | Ruhetag | Regeneration |\n\n'
        + '> 📌 Jede Einheit: 5 Min. Aufwärmen, 30–45 Min. Training, 5 Min. Cool-down.',
};

// ── Fixe Chat-Antworten für freie Nachrichten ───────────────

const CHAT_RESPONSES = [
    'Hier sind ein paar allgemeine Trainingstipps:\n\n1. **Aufwärmen** – Immer 5–10 Min. vor dem Training.\n2. **Progressive Overload** – Steigere regelmäßig Gewicht oder Wiederholungen.\n3. **Regeneration** – Mindestens 48h Pause pro Muskelgruppe.\n4. **Ernährung** – Genügend Protein (1,6–2,2g pro kg Körpergewicht).\n5. **Schlaf** – 7–9 Stunden für optimale Regeneration.\n\n> 💡 Konsistenz schlägt Perfektion – bleib dran!',
    'Hier ein paar Grundregeln:\n\n- **Trainiere 3–5× pro Woche** – Qualität vor Quantität.\n- **Compound-Übungen zuerst** – Kniebeugen, Bankdrücken, Kreuzheben.\n- **Genug trinken** – Mindestens 2–3 Liter Wasser am Tag.\n- **Tracke deinen Fortschritt** – Was du misst, kannst du verbessern.\n\n> Klicke auf die Muskel-Figur, um gezielte Übungsempfehlungen zu bekommen! 💪',
    'Trainingstipps für dich:\n\n1. **Richtige Form** geht immer vor schwerem Gewicht.\n2. **Mind-Muscle-Connection** – Spüre den Zielmuskel bei jeder Wiederholung.\n3. **Ruhetage sind Pflicht** – Muskeln wachsen in der Erholung!\n4. **Ernährung macht 70%** – Du kannst ein schlechtes Training nachholen, aber nicht schlechte Ernährung.\n\n> 💡 Tipp: Nutze die Muskel-Figur, um Übungen für bestimmte Körperteile zu finden!',
];

/**
 * Übersetzung der Ziel-Eingabe auf Wochenplan-Schlüssel.
 * Erkennt Synonyme und ordnet sie einer Plan-Kategorie zu.
 */
const ZIEL_MAP = {
    muskelaufbau: 'muskelaufbau', muscle: 'muskelaufbau', masse: 'muskelaufbau',
    kraft: 'muskelaufbau', hypertrophie: 'muskelaufbau', aufbau: 'muskelaufbau',
    cardio: 'cardio', ausdauer: 'cardio', laufen: 'cardio', joggen: 'cardio',
    abnehmen: 'abnehmen', fett: 'abnehmen', diät: 'abnehmen', gewicht: 'abnehmen',
    fat: 'abnehmen', definition: 'abnehmen', shredded: 'abnehmen', cut: 'abnehmen',
};

/**
 * Gibt eine personalisierte Fallback-Antwort zurück.
 *
 * @param {string} muskelgruppe – z.B. 'brust', 'arme', 'beine'
 * @param {object} user         – { username, alter, fitness, geschlecht }
 * @returns {string} Markdown-formatierte Trainingsempfehlung
 */
function getResponse(muskelgruppe, user) {
    const responses = RESPONSES[muskelgruppe] || RESPONSES.allgemein;
    const template = responses[Math.floor(Math.random() * responses.length)];

    const name = user.username || 'Sportler';
    const fitness = user.fitness || '';

    // Persönliche Begrüßung zusammenbauen
    let greeting = `Hey **${name}**! `;

    if (user.alter) {
        greeting += `*(${user.alter} Jahre)* – `;
    }

    if (fitness === 'Anfänger') {
        greeting += 'Hier sind perfekte Übungen für deinen Einstieg:\n\n';
    } else if (fitness === 'Fortgeschritten') {
        greeting += 'Hier kommt dein Fortgeschrittenen-Programm:\n\n';
    } else if (fitness === 'Profi') {
        greeting += 'Bereit für die nächste Stufe? Los geht\'s:\n\n';
    } else {
        greeting += 'Hier sind passende Übungen für dich:\n\n';
    }

    return greeting + template;
}

/**
 * Gibt einen fixen Wochenplan basierend auf dem Trainingsziel zurück.
 *
 * @param {string} ziel  – z.B. 'Cardio', 'Muskelaufbau', 'Abnehmen'
 * @param {object} user  – { username, alter, fitness, geschlecht }
 * @returns {string} Markdown-formatierter Wochenplan
 */
function getWochenplan(ziel, user) {
    const name = user.username || 'Sportler';

    // Ziel auf bekannten Schlüssel mappen
    const key = ZIEL_MAP[(ziel || '').toLowerCase()] || 'allgemein';
    const plan = WOCHENPLAENE[key];

    let greeting = `Hey **${name}**! `;
    if (user.alter) greeting += `*(${user.alter} Jahre)* `;
    if (user.fitness) greeting += `*(Level: ${user.fitness})* `;
    greeting += '\n\nUnser KI-Coach ist gerade nicht verfügbar, aber hier ist ein passender Wochenplan für dich:\n\n';

    return greeting + plan;
}

/**
 * Gibt eine fixe Chat-Antwort für freie Nachrichten zurück.
 *
 * @param {object} user – { username }
 * @returns {string} Markdown-formatierte Antwort
 */
function getChatResponse(user) {
    const name = user.username || 'Sportler';
    const template = CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)];
    return `Hey **${name}**! Unser KI-Coach macht gerade Pause, aber hier sind ein paar Tipps:\n\n` + template;
}

module.exports = { getResponse, getWochenplan, getChatResponse };
