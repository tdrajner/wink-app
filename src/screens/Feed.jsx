// src/screens/Feed.jsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { useStore } from '../store'
import ActivityCard from '../components/ActivityCard'
import { fetchExternalActivities } from '../services/activityService'

const FILTERS = [
  { id: 'all',      label: 'Todo' },
  { id: 'aventura', label: '🏔 Aventura' },
  { id: 'social',   label: '🍽 Social' },
  { id: 'cultura',  label: '🎭 Cultura' },
]

export default function Feed() {
  const navigate = useNavigate()
  const { user, activeFilter, setFilter } = useStore()
  const [external,     setExternal]     = useState([])
  const [userCreated,  setUserCreated]  = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  // ── Fetch actividades externas (Eventbrite + Meetup) ──
  const loadExternal = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchExternalActivities(
        user.city || 'Buenos Aires',
        activeFilter === 'all' ? '' : activeFilter
      )
      setExternal(data)
    } catch (e) {
      setError('No se pudieron cargar actividades externas.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user.city, activeFilter])

  useEffect(() => { loadExternal() }, [loadExternal])

  // ── Actividades propuestas por usuarios (Firestore, tiempo real) ──
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'activities'),
      (snap) => setUserCreated(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      (err)  => console.warn('Firestore:', err.message)
    )
    return unsub
  }, [])

  // ── Filtrar y recomendar ──
  const filterAct = (arr) =>
    activeFilter === 'all' ? arr : arr.filter(a => a.category === activeFilter)

  const score = (a) =>
    (user.interests || []).includes(a.subcategory || a.category) ? 1 : 0

  const recommended = filterAct([...external, ...userCreated])
    .filter(a => score(a) > 0)

  const externalFiltered = filterAct(external)
    .filter(a => score(a) === 0)

  const userFiltered = filterAct(userCreated)
    .filter(a => score(a) === 0)

  const total = filterAct([...external, ...userCreated]).length
  const monthName = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="screen">
      {/* Greeting */}
      <div className="greeting-row">
        <div>
          <div className="greeting-name">Hola, {user.name?.split(' ')[0]} 👋</div>
          <div className="greeting-sub">
            {loading ? 'Buscando actividades...' : `${total} actividades en ${user.city || 'Buenos Aires'}`}
          </div>
        </div>
        <div className="month-pill">{monthName}</div>
      </div>

      {/* Filters */}
      <div className="chips-row">
        {FILTERS.map(f => (
          <div
            key={f.id}
            className={`chip ${activeFilter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 14px 0' }}>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FCEBEB', border: '0.5px solid #F09595',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#A32D2D', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            {error}
            <button onClick={loadExternal} style={{
              background: '#A32D2D', color: '#fff', border: 'none',
              borderRadius: 8, padding: '4px 10px', fontSize: 12, cursor: 'pointer'
            }}>Reintentar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 36, height: 36, border: '3px solid #f0f0f0',
              borderTopColor: '#D85A30', borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }}/>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              Buscando actividades en {user.city || 'Buenos Aires'}...
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Recommended */}
            {recommended.length > 0 && (
              <>
                <div className="section-label">
                  <span style={{ fontSize: 16 }}>⭐</span> Según tus intereses
                </div>
                {recommended.map(a => <ActivityCard key={a.id} activity={a} />)}
              </>
            )}

            {/* External */}
            {externalFiltered.length > 0 && (
              <>
                <div className="section-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D85A30" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Actividades en {user.city || 'Buenos Aires'}
                </div>
                {externalFiltered.map(a => <ActivityCard key={a.id} activity={a} />)}
              </>
            )}

            {/* User-created */}
            {userFiltered.length > 0 && (
              <>
                <div className="section-label">
                  <span style={{ fontSize: 16 }}>🫂</span> Propuestas por la comunidad
                </div>
                {userFiltered.map(a => <ActivityCard key={a.id} activity={a} />)}
              </>
            )}

            {/* Empty state */}
            {total === 0 && !error && (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>
                  Sin actividades en esta categoría
                </div>
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, marginBottom: 20 }}>
                  Probá otro filtro o proponé una actividad vos.
                </div>
                <button onClick={() => navigate('/proponer')} style={{
                  padding: '11px 22px', borderRadius: 14,
                  background: '#D85A30', color: '#fff', border: 'none',
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                }}>
                  + Proponer actividad
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => navigate('/proponer')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}
