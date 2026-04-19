// src/services/activityService.js
// Fuentes: PredictHQ + Ticketmaster + Meetup + Usuarios Wink

const PREDICTHQ_TOKEN = '92FSp0vdYuN_JMbwexLq3SFOm7IFr-L5t-J36g0j'
const TM_KEY          = 'DpTBmkSyKTGHS8qzBfTLmCcLqKr3vdLn'

const CAT_KEYWORDS = {
  aventura: 'sports outdoor cycling hiking',
  social:   'food community networking social',
  cultura:  'concert music theatre art festival',
  '':       'community social sports concert festival',
}

export async function fetchExternalActivities(city = 'Buenos Aires', category = '') {
  const [phq, tm, meetup] = await Promise.allSettled([
    fetchPredictHQ(category),
    fetchTicketmaster(category),
    fetchMeetup(category),
  ])

  const all = [
    ...(phq.status    === 'fulfilled' ? phq.value    : []),
    ...(tm.status     === 'fulfilled' ? tm.value     : []),
    ...(meetup.status === 'fulfilled' ? meetup.value : []),
  ]

  // Deduplicar por título similar y ordenar por fecha
  const seen = new Set()
  return all
    .filter(a => {
      const key = a.title.toLowerCase().slice(0, 30)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

// ── PredictHQ ──────────────────────────────────────────────────────────────
async function fetchPredictHQ(category) {
  const phqCatMap = {
    aventura: 'sports',
    cultura:  'concerts,festivals,performing-arts',
    social:   'community,expos,conferences',
    '':       'concerts,sports,festivals,performing-arts,community',
  }
  const cats = phqCatMap[category] || phqCatMap['']
  const today = new Date().toISOString().split('T')[0]

  const url = `https://api.predicthq.com/v1/events/?` +
    `country=AR` +
    `&location_around.origin=-34.6037%2C-58.3816` +
    `&location_around.radius=15km` +
    `&active.gte=${today}` +
    `&category=${cats}` +
    `&limit=20` +
    `&sort=start`

  try {
    const res  = await fetch(url, {
      headers: { Authorization: `Bearer ${PREDICTHQ_TOKEN}` }
    })
    const data = await res.json()
    console.log('PredictHQ eventos:', data.results?.length)
    if (!data.results?.length) return []

    return data.results.map(e => ({
      id:          `phq_${e.id}`,
      title:       e.title,
      category:    mapPhqCategory(e.category),
      subcategory: e.category,
      city:        'Buenos Aires',
      date:        e.start,
      location:    e.geo?.address?.formatted_address || e.location?.[0] || 'Buenos Aires',
      description: e.description || `${e.category} en Buenos Aires`,
      imageUrl:    null,
      source:      'predicthq',
      externalUrl: `https://www.predicthq.com/events/${e.id}`,
      spotsLeft:   e.phq_attendance || 50,
      maxSpots:    e.phq_attendance || 50,
      participants:[],
      recommended: false,
      rank:        e.rank || 0,
    }))
  } catch (err) {
    console.warn('PredictHQ error:', err.message)
    return []
  }
}

// ── Ticketmaster ───────────────────────────────────────────────────────────
async function fetchTicketmaster(category) {
  const segMap = {
    aventura: 'Sports',
    cultura:  'Music,Arts',
    social:   '',
  }
  const seg = segMap[category] || ''
  const segParam = seg ? `&segmentName=${encodeURIComponent(seg)}` : ''

  const url = `https://app.ticketmaster.com/discovery/v2/events.json` +
    `?apikey=${TM_KEY}` +
    `&latlong=-34.6037,-58.3816` +
    `&radius=30&unit=km` +
    `&size=15&sort=date,asc` +
    segParam

  try {
    const res  = await fetch(url)
    const data = await res.json()
    console.log('Ticketmaster eventos:', data._embedded?.events?.length)
    const events = data._embedded?.events || []

    return events.map(e => ({
      id:          `tm_${e.id}`,
      title:       e.name,
      category:    mapTmCategory(e.classifications?.[0]?.segment?.name),
      subcategory: e.classifications?.[0]?.genre?.name || '',
      city:        'Buenos Aires',
      date:        e.dates?.start?.localDate + 'T' + (e.dates?.start?.localTime || '20:00:00'),
      location:    [e._embedded?.venues?.[0]?.name, e._embedded?.venues?.[0]?.address?.line1].filter(Boolean).join(', '),
      description: e.info || e.pleaseNote || 'Evento en Buenos Aires',
      imageUrl:    e.images?.find(i => i.ratio === '16_9' && i.width > 500)?.url || e.images?.[0]?.url || null,
      source:      'ticketmaster',
      externalUrl: e.url,
      spotsLeft:   20,
      maxSpots:    20,
      participants:[],
      recommended: false,
    }))
  } catch (err) {
    console.warn('Ticketmaster error:', err.message)
    return []
  }
}

// ── Meetup ─────────────────────────────────────────────────────────────────
async function fetchMeetup(category) {
  const kw = CAT_KEYWORDS[category] || CAT_KEYWORDS['']
  const query = `{
    keywordSearch(
      filter: { query: "${kw}", lat: -34.6037, lon: -58.3816, radius: 20, source: EVENTS }
      first: 12
    ) {
      edges { node { result {
        ... on Event {
          id title dateTime description eventUrl going maxTickets
          venue { name address }
        }
      }}}
    }
  }`
  try {
    const res  = await fetch('https://api.meetup.com/gql', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    })
    const data = await res.json()
    const edges = data?.data?.keywordSearch?.edges || []
    console.log('Meetup eventos:', edges.length)

    return edges
      .map(e => e?.node?.result)
      .filter(Boolean)
      .map(e => ({
        id:          `mt_${e.id}`,
        title:       e.title,
        category:    category || 'social',
        subcategory: '',
        city:        'Buenos Aires',
        date:        e.dateTime,
        location:    e.venue ? `${e.venue.name}, ${e.venue.address}` : 'Buenos Aires',
        description: stripHtml(e.description || '').slice(0, 220),
        imageUrl:    null,
        source:      'meetup',
        externalUrl: e.eventUrl,
        spotsLeft:   Math.max((e.maxTickets || 30) - (e.going || 0), 0),
        maxSpots:    e.maxTickets || 30,
        participants:[],
        recommended: false,
      }))
  } catch (err) {
    console.warn('Meetup error:', err.message)
    return []
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────
function mapPhqCategory(cat) {
  const map = {
    'sports':           'aventura',
    'concerts':         'cultura',
    'festivals':        'cultura',
    'performing-arts':  'cultura',
    'music':            'cultura',
    'community':        'social',
    'expos':            'social',
    'conferences':      'social',
  }
  return map[cat] || 'social'
}

function mapTmCategory(seg) {
  const map = {
    'Sports':         'aventura',
    'Arts & Theatre': 'cultura',
    'Music':          'cultura',
    'Miscellaneous':  'social',
  }
  return map[seg] || 'social'
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
