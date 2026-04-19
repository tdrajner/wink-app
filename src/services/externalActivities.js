// src/services/externalActivities.js
// ─────────────────────────────────────────────────────────────────────────────
// Service para importar actividades de fuentes externas.
// En producción, estas llamadas van al backend (Node.js) para no exponer
// API keys en el cliente. Aquí se documentan las integraciones.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/**
 * Trae actividades externas ya normalizadas desde el backend.
 * El backend las cachea en Firestore y las refresca cada 6 horas.
 */
export async function fetchExternalActivities({ city, category, month }) {
  const params = new URLSearchParams({ city, category: category || '', month: month || '' })
  const res = await fetch(`${API_BASE}/api/activities/external?${params}`)
  if (!res.ok) throw new Error('Error trayendo actividades externas')
  return res.json()
}

/**
 * Estructura normalizada que devuelve el backend para cada fuente.
 * Ver backend/services/scrapers/ para la implementación de cada uno.
 */
export const EXTERNAL_SOURCES = {
  /**
   * Google Events via SerpAPI
   * Docs: https://serpapi.com/google-events-api
   * Env:  SERPAPI_KEY
   */
  google: {
    name: 'Google Events',
    color: '#fff',
    textColor: '#444',
    endpoint: '/api/scrape/google',
    params: (city) => ({ q: `actividades grupales ${city}`, hl: 'es', gl: 'ar' }),
  },

  /**
   * Meetup GraphQL API (sin auth para búsquedas públicas)
   * Docs: https://www.meetup.com/api/guide/
   */
  meetup: {
    name: 'Meetup',
    color: '#F64060',
    textColor: '#fff',
    endpoint: '/api/scrape/meetup',
    params: (city) => ({ city, radius: 25, topics: ['outdoors', 'social', 'culture'] }),
  },

  /**
   * Eventbrite REST API v3
   * Docs: https://www.eventbrite.com/platform/api
   * Env:  EVENTBRITE_TOKEN
   */
  eventbrite: {
    name: 'Eventbrite',
    color: '#FF6B35',
    textColor: '#fff',
    endpoint: '/api/scrape/eventbrite',
    params: (city) => ({ location: city, categories: '108,119,113' }),
  },

  /**
   * Instagram hashtags via RapidAPI
   * API: https://rapidapi.com/instagram-scraper
   * Env:  RAPIDAPI_KEY
   */
  instagram: {
    name: 'Instagram',
    color: '#E93E7D',
    textColor: '#fff',
    endpoint: '/api/scrape/instagram',
    params: (city) => ({
      hashtags: [
        `actividades${city.replace(' ', '')}`,
        `planes${city.replace(' ', '')}`,
        'actividadesgrupales'
      ]
    }),
  },
}

/**
 * Schema de normalización — todas las fuentes se convierten a esto:
 * @typedef {Object} NormalizedActivity
 * @property {string}   id
 * @property {string}   title
 * @property {string}   category        — 'aventura' | 'social' | 'cultura'
 * @property {string}   city
 * @property {string}   date            — ISO string
 * @property {string}   location
 * @property {string}   description
 * @property {number}   maxSpots
 * @property {string}   source          — 'google' | 'meetup' | 'instagram' | 'eventbrite'
 * @property {string}   externalUrl
 * @property {string|null} imageUrl
 * @property {boolean}  recommended
 */
