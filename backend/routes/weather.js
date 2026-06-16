/**
 * routes/weather.js – Wetter-API
 *
 * ── Anforderungen ───────────────────────────────────────────
 *   S1 – Mind. 2 externe REST-Services      → Open-Meteo = Externe API 2
 *   C1 – Mind. 3 externe REST-Services      → Open-Meteo = Externe API 2
 *        (API 1 = Google Gemini)
 *
 * GET /api/weather – Aktuelle Wetterdaten von Open-Meteo (Externe API 3)
 *
 * Gibt eine Trainingsempfehlung basierend auf dem Wetter zurück.
 * Standard-Standort: Wien (lat 48.21, lon 16.37)
 */

const express = require('express');
const { sendResponse } = require('../helpers');

const router = express.Router();

// Standard-Koordinaten (Wien)
const DEFAULT_LAT = 48.2085;
const DEFAULT_LON = 16.3721;

// Temperatur-Grenzen für die Empfehlung
const MIN_OUTDOOR_TEMP = 15;
const MAX_OUTDOOR_TEMP = 35;
const MAX_WIND_SPEED = 30;
const COLD_THRESHOLD = 5;

router.get('/', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat) || DEFAULT_LAT;
        const lon = parseFloat(req.query.lon) || DEFAULT_LON;

        // C1: Dritter externer REST-Service (Open-Meteo API)
        const url = `https://api.open-meteo.com/v1/forecast`
            + `?latitude=${lat}&longitude=${lon}&current_weather=true`;

        const response = await fetch(url);
        const data = await response.json();
        const weather = data.current_weather;

        sendResponse(req, res, {
            source: 'open-meteo.com',
            temperature: weather.temperature,
            windspeed: weather.windspeed,
            weathercode: weather.weathercode,
            recommendation: getTrainingTip(weather),
        });
    } catch {
        sendResponse(req, res, { error: 'Wetter-API nicht erreichbar.' }, 502);
    }
});

/** Gibt einen passenden Trainingstipp zurück */
function getTrainingTip(weather) {
    const { temperature, windspeed } = weather;

    if (temperature > MIN_OUTDOOR_TEMP && temperature < MAX_OUTDOOR_TEMP && windspeed < MAX_WIND_SPEED) {
        return 'Perfektes Wetter für Outdoor-Training!';
    }
    if (temperature <= COLD_THRESHOLD) {
        return 'Sehr kalt draußen – lieber ins Gym!';
    }
    return 'Gutes Wetter für Indoor-Training.';
}

module.exports = router;
