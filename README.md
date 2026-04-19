# Wink — MVP App de actividades grupales

App web/mobile (React + Vite) para conectar personas en actividades sociales y deportivas.

## Inicio rápido

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estado global | Zustand |
| Routing | React Router v6 |
| Backend / DB | Firebase (Firestore + Auth + Storage) |
| Fuentes | Syne (display) + DM Sans (body) |

---

## Estructura del proyecto

```
src/
├── screens/
│   ├── Feed.jsx          ← Feed principal con actividades
│   ├── Proponer.jsx      ← Formulario para proponer actividad
│   ├── Profile.jsx       ← Perfil e intereses del usuario
│   └── Nps.jsx           ← Sistema de valoración NPS
├── components/
│   ├── ActivityCard.jsx       ← Tarjeta de actividad
│   ├── CategoryIllustration.jsx ← SVG temático por categoría
│   └── BottomNav.jsx          ← Navegación inferior
├── services/
│   ├── firestoreService.js    ← CRUD de Firestore
│   └── externalActivities.js ← Integración fuentes externas
├── data/
│   └── mockData.js       ← Datos de desarrollo
├── store.js              ← Estado global (Zustand)
├── firebase.js           ← Configuración Firebase
└── styles/index.css      ← Design tokens + estilos globales
```

---

## Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitá **Firestore**, **Authentication** (Google + Email) y **Storage**
3. Copiá tu configuración en `src/firebase.js`

### Colecciones de Firestore

**`users/{uid}`**
```json
{
  "name": "Sol Rodriguez",
  "city": "Buenos Aires",
  "bio": "...",
  "interests": ["ciclismo", "cenas"],
  "joinedActivities": ["act_01"],
  "reputation": 120
}
```

**`activities/{id}`**
```json
{
  "title": "Cicleada nocturna",
  "category": "aventura",
  "subcategory": "ciclismo",
  "city": "Buenos Aires",
  "date": "2026-04-26T21:00:00.000Z",
  "location": "Puente 3, Costanera",
  "description": "...",
  "maxSpots": 10,
  "spotsLeft": 4,
  "source": "wink",
  "participants": ["uid_1", "uid_2"],
  "createdBy": "uid_1",
  "imageUrl": null,
  "whatsappLink": "https://chat.whatsapp.com/...",
  "status": "active"
}
```

**`ratings/{id}`**
```json
{
  "userId": "uid_sol",
  "activityId": "act_01",
  "type": "activity",
  "npsScore": 9,
  "stars": 5,
  "comment": "Muy buena organización",
  "createdAt": "Timestamp"
}
```

**`chats/{chatId}/messages/{msgId}`**
```json
{
  "userId": "uid_sol",
  "name": "Sol",
  "text": "¿Hacemos pausa en el bar?",
  "createdAt": "Timestamp"
}
```

---

## Fuentes externas de actividades

Ver `src/services/externalActivities.js` para la documentación de cada API.

Variables de entorno necesarias en el backend:
```
SERPAPI_KEY=...        # Google Events
EVENTBRITE_TOKEN=...   # Eventbrite
RAPIDAPI_KEY=...       # Instagram scraper
```

---

## Próximos pasos

- [ ] Conectar Firebase real (reemplazar mockData)
- [ ] Implementar backend Node.js para scrapers externos
- [ ] Añadir Firebase Auth (Google login)
- [ ] Dashboard de analytics con métricas NPS
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Deploy en Vercel / Firebase Hosting

---

## Build para producción

```bash
npm run build
# Los archivos quedan en /dist — deployable en Vercel, Netlify o Firebase Hosting
```
