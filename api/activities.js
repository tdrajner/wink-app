// api/activities.js — Vercel Serverless Function
// Busca actividades reales de Eventbrite y Meetup

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const city     = req.query.city     || 'Buenos Aires'
  const category = req.query.category || ''

  const [eventbrite, meetup] = await Promise.allSettled([
    fetchEventbrite(city, category),
    fetchMeetup(city, category),
  ])

  const activities = [
    ...(eventbrite.status === 'fulfilled' ? eventbrite.value : []),
    ...(meetup.status    === 'fulfilled' ? meetup.value    : []),
  ].sort((a, b) => new Date(a.date) - new Date(b.date))

  res.status(200).json({ activities, total: activities.length })
}

// ── Eventbrite ──────────────────────────────────────────────────────────────
async function fetchEventbrite(city, category) {
  const token = process.env.EVENTBRITE_TOKEN
  if (!token) return []

  const catMap = { aventura: '108', social: '105', cultura: '103' }
  const catParam = catMap[category] ? `&categories=${catMap[category]}` : ''

  // Coordenadas de Buenos Aires
  const url = `https://www.eventbriteapi.com/v3/events/search/` +
    `?location.latitude=-34.6037&location.longitude=-58.3816` +
    `&location.within=15km` +
    `&expand=venue,logo` +
    `&start_date.keyword=this_month` +
    `&sort_by=date` +
    `&locale=es_AR` +
    catParam

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!r.ok) return []
  const data = await r.json()
  if (!data.events?.length) return []

  return data.events.map(e => ({
    id:          `eb_${e.id}`,
    title:       e.name?.text || 'Sin título',
    category:    mapEbCategory(e.category_id),
    subcategory: '',
    city,
    date:        e.start?.local || new Date().toISOString(),
    location:    e.venue?.address?.localized_address_display || city,
    description: stripHtml(e.description?.text || '').slice(0, 220),
    imageUrl:    e.logo?.url || null,
    source:      'eventbrite',
    externalUrl: e.url,
    spotsLeft:   e.capacity ? Math.max(e.capacity - (e.quantity_sold || 0), 0) : 20,
    maxSpots:    e.capacity || 20,
    participants:[],
    recommended: false,
    isFree:      e.is_free,
  }))
}

// ── Meetup ──────────────────────────────────────────────────────────────────
async function fetchMeetup(city, category) {
  const keywords = {
    aventura: 'outdoor hiking cycling sports',
    social:   'dinner social networking drinks',
    cultura:  'art culture museum music concert',
    '':       'activities social outdoor',
  }
  const kw = keywords[category] || keywords['']

  const query = `{
    keywordSearch(
      filter: {
        query: "${kw}",
        lat: -34.6037,
        lon: -58.3816,
        radius: 20,
        source: EVENTS
      }
      first: 12
    ) {
      edges {
        node {
          result {
            ... on Event {
              id
              title
              dateTime
              description
              eventUrl
              going
              maxTickets
              venue { name address city }
              group { name }
            }
          }
        }
      }
    }
  }`

  try {
    const r = await fetch('https://api.meetup.com/gql', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    })
    if (!r.ok) return []
    const data = await r.json()
    const edges = data?.data?.keywordSearch?.edges || []

    return edges
      .map(e => e?.node?.result)
      .filter(Boolean)
      .map(e => ({
        id:          `mt_${e.id}`,
        title:       e.title,
        category:    category || 'social',
        subcategory: '',
        city,
        date:        e.dateTime,
        location:    e.venue ? `${e.venue.name || ''}, ${e.venue.address || ''}`.trim() : city,
        description: stripHtml(e.description || '').slice(0, 220),
        imageUrl:    null,
        source:      'meetup',
        externalUrl: e.eventUrl,
        spotsLeft:   Math.max((e.maxTickets || 30) - (e.going || 0), 0),
        maxSpots:    e.maxTickets || 30,
        participants:[],
        recommended: false,
      }))
  } catch {
    return []
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function mapEbCategory(id) {
  const map = {
    '108': 'aventura', '109': 'aventura',
    '105': 'social',   '116': 'social',
    '103': 'cultura',  '104': 'cultura', '102': 'cultura',
  }
  return map[String(id)] || 'social'
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
