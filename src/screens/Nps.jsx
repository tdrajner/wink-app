// src/screens/Nps.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { submitRating } from '../services/firestoreService'
import CategoryIllustration from '../components/CategoryIllustration'
import { MOCK_ACTIVITIES } from '../data/mockData'

export default function Nps() {
  const navigate = useNavigate()
  const { user, pendingNpsActivityId, clearPendingNps, addRating } = useStore()
  const [tab, setTab] = useState('activity') // 'activity' | 'app'
  const [actNps, setActNps]     = useState(null)
  const [appNps, setAppNps]     = useState(null)
  const [stars, setStars]       = useState(0)
  const [actComment, setActComment] = useState('')
  const [appComment, setAppComment] = useState('')
  const [submitted, setSubmitted]   = useState(false)

  const activity = MOCK_ACTIVITIES.find((a) => a.id === pendingNpsActivityId)
    || MOCK_ACTIVITIES[0]

  function npsClass(score) {
    if (score <= 6) return 'detractor'
    if (score <= 8) return 'passive'
    return 'promoter'
  }

  async function handleSubmit() {
    const ratings = []
    if (actNps !== null) {
      ratings.push({ userId: user.uid, activityId: activity.id, type: 'activity', npsScore: actNps, stars, comment: actComment })
    }
    if (appNps !== null) {
      ratings.push({ userId: user.uid, activityId: null, type: 'app', npsScore: appNps, comment: appComment })
    }
    for (const r of ratings) {
      addRating(r)
      try { await submitRating(r) } catch (e) { /* offline ok */ }
    }
    clearPendingNps()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="screen">
        <div className="success-container">
          <div style={{ marginBottom: 16, fontSize: 12, color: '#888' }}>
            {activity.title}
          </div>
          <div className="success-icon-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
            Gracias por valorar
          </div>
          <div style={{ fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 12 }}>
            Tu feedback ayuda a mejorar Wink y a que otros encuentren las mejores actividades.
          </div>
          <div className="rep-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BA7517" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            +10 puntos de reputación
          </div>
          <button className="submit-btn" onClick={() => navigate('/')}>
            Seguir explorando
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen">
      {/* Activity image header */}
      <div style={{ height: 140, position: 'relative', overflow: 'hidden' }}>
        <CategoryIllustration category={activity.category} subcategory={activity.subcategory} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.38)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '12px 16px'
        }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff' }}>
            {activity.title}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            {new Date(activity.date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 80px' }}>
        {/* Tab toggle */}
        <div className="nps-tabs">
          <button className={`nps-tab-btn ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
            Esta actividad
          </button>
          <button className={`nps-tab-btn ${tab === 'app' ? 'active' : ''}`} onClick={() => setTab('app')}>
            La app Wink
          </button>
        </div>

        {/* ── Activity tab ── */}
        {tab === 'activity' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>
              ¿Cuánto disfrutaste la actividad?
            </div>
            <div className="stars-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`star-btn ${stars >= n ? 'selected' : ''}`} onClick={() => setStars(n)}>
                  ★
                </button>
              ))}
            </div>
            <div className="nps-divider" />
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>
              ¿Recomendarías esta actividad? (0 – 10)
            </div>
            <div className="nps-numbers">
              {Array.from({ length: 11 }, (_, i) => (
                <div
                  key={i}
                  className={`nps-num ${npsClass(i)} ${actNps === i ? 'selected' : ''}`}
                  onClick={() => setActNps(i)}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="nps-range-labels">
              <span>Nada probable</span><span>Muy probable</span>
            </div>
            <textarea
              className="form-input"
              style={{ height: 72, resize: 'none', marginBottom: 16 }}
              placeholder="¿Qué mejorarías? (opcional)"
              value={actComment}
              onChange={(e) => setActComment(e.target.value)}
            />
          </>
        )}

        {/* ── App tab ── */}
        {tab === 'app' && (
          <>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 12 }}>
              ¿Qué tan probable es que recomiendes Wink a un amigo? (0 – 10)
            </div>
            <div className="nps-numbers">
              {Array.from({ length: 11 }, (_, i) => (
                <div
                  key={i}
                  className={`nps-num ${npsClass(i)} ${appNps === i ? 'selected' : ''}`}
                  onClick={() => setAppNps(i)}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="nps-range-labels">
              <span>Nada probable</span><span>Muy probable</span>
            </div>
            <div className="nps-divider" />
            <div style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', marginBottom: 10 }}>
              ¿Qué funcionalidad agregarías?
            </div>
            <textarea
              className="form-input"
              style={{ height: 72, resize: 'none', marginBottom: 16 }}
              placeholder="Tu feedback nos ayuda a mejorar..."
              value={appComment}
              onChange={(e) => setAppComment(e.target.value)}
            />
          </>
        )}

        <button className="teal-submit" onClick={handleSubmit}>
          Enviar valoración
        </button>
        <span className="skip-link" onClick={() => { clearPendingNps(); navigate('/') }}>
          Ahora no
        </span>
      </div>
    </div>
  )
}
