# Postman Test: M5 + C2 – JSON & XML auf allen Endpoints

## Setup
- **Base URL:** `http://localhost:3000`
- Jeden Request **2x testen:**
  - 1x mit Header `Accept: application/json` → bekommt JSON
  - 1x mit Header `Accept: application/xml` → bekommt XML

---

## 1. POST /api/login (Token holen)
```
POST http://localhost:3000/api/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
    "username": "admin",
    "password": "1234"
}
```
> Den `token` aus der Antwort kopieren! Wird als `Bearer <token>` für geschützte Routen gebraucht.

---

## 2. GET /api/exercises (öffentlich)
```
GET http://localhost:3000/api/exercises
Headers: Accept: application/json       ← Test 1
Headers: Accept: application/xml        ← Test 2
```

## 3. GET /api/weather (öffentlich)
```
GET http://localhost:3000/api/weather
Headers: Accept: application/json       ← Test 1
Headers: Accept: application/xml        ← Test 2
```

## 4. GET /api/models (öffentlich)
```
GET http://localhost:3000/api/models
Headers: Accept: application/json       ← Test 1
Headers: Accept: application/xml        ← Test 2
```

## 5. GET /api/users (JWT geschützt)
```
GET http://localhost:3000/api/users
Headers:
  Accept: application/json              ← Test 1 (dann xml für Test 2)
  Authorization: Bearer <TOKEN>
```

## 6. GET /api/plans (JWT geschützt)
```
GET http://localhost:3000/api/plans
Headers:
  Accept: application/xml
  Authorization: Bearer <TOKEN>
```

## 7. POST /api/users (JWT geschützt)
```
POST http://localhost:3000/api/users
Headers:
  Content-Type: application/json
  Accept: application/xml
  Authorization: Bearer <TOKEN>
Body:
{
    "username": "testuser",
    "password": "test123",
    "role": "user"
}
```

## 8. PUT /api/users/1 (öffentlich)
```
PUT http://localhost:3000/api/users/1
Headers:
  Content-Type: application/json
  Accept: application/xml
Body:
{
    "username": "admin",
    "gewicht": 85,
    "groesse": 182
}
```

## 9. PATCH /api/users/1 (JWT geschützt, C3)
```
PATCH http://localhost:3000/api/users/1
Headers:
  Content-Type: application/json
  Accept: application/xml
  Authorization: Bearer <TOKEN>
Body:
{
    "fitness": "Profi"
}
```

## 10. DELETE /api/plans/1 (JWT geschützt)
```
DELETE http://localhost:3000/api/plans/1
Headers:
  Accept: application/xml
  Authorization: Bearer <TOKEN>
```

## 11. DELETE /api/users/2 (JWT geschützt)
```
DELETE http://localhost:3000/api/users/2
Headers:
  Accept: application/xml
  Authorization: Bearer <TOKEN>
```

## 12. PUT /api/models (öffentlich)
```
PUT http://localhost:3000/api/models
Headers:
  Content-Type: application/json
  Accept: application/xml
Body:
{
    "modelId": "gemini-2.5-flash"
}
```

---

## Erklärung für den Professor

> **M5/C2:** Alle Endpunkte nutzen die zentrale Funktion `sendResponse()` in `helpers.js`.
> Diese prüft den `Accept`-Header des Clients:
> - `Accept: application/json` → JSON-Antwort
> - `Accept: application/xml` → XML-Antwort (via `convertToXml()`)
>
> Dadurch müssen die Routen selbst nichts über das Format wissen –
> ein einziger Punkt steuert alles (**Single Responsibility**).
