// src/screens/Participants.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useStore } from '../store'

const AVATAR_COLORS = [
  '#D85A30','#1D9E75','#7F77DD','#378ADD','#EF9F27',
  '#D4537E','#639922','#E24B4A',
]

export default function Participants() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const { user }   = useStore()
  const activity   = location.state?.activity

  const [participants, setParticipants] = useState([])
  const [joined,       setJoined]       = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [joining,      setJoining]      = useState(false)

  useEffect(() => {
    if (!activity) return
    loadParticipants()
  }, [activity])

  async function loadParticipants() {
    setLoading(true)
    try {
      // Check if this external activity exists in Firestore
      const actRef = doc(db, 'activities', activity.id)
      const actSnap = await getDoc(actRef)

      if (actSnap.exists()) {
        const data = actSnap.data()
        const uids = data.participantUids || []
        setJoined(uids.includes(user.uid))

        // Load user profiles
        const profiles = await Promise.all(
          uids.map(uid => getDoc(doc(db, 'users', uid)))
        )
        setParticipants(profiles.filter(s => s.exists()).map(s => ({ uid: s.id, ...s.data() })))
      } else {
        setJoined(false)
        setParticipants([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    setJoining(true)
    try {
      const actRef = doc(db, 'activities', activity.id)
      const actSnap = await getDoc(actRef)

      if (!actSnap.exists()) {
        // Create the activity in Firestore for the first time
        await setDoc(actRef, {
          ...activity,
          participantUids: [user.uid],
          createdAt: serverTimestamp(),
        })
      } else {
        await updateDoc(actRef, {
          participantUids: arrayUnion(user.uid),
        })
      }

      // Add to user's joined list
      await updateDoc(doc(db, 'users', user.uid), {
        joinedActivities: arrayUnion(activity.id),
      })

      setJoined(true)
      await loadParticipants()
    } catch (e) {
      console.error(e)
    } finally {
      setJoining(false)
    }
  }

  function handleWhatsApp(participant) {
    if (participant.phone) {
      window.open(`https://wa.me/${participant.phone}`, '_blank')
    } else {
      // Open WA without number — user can search manually
      alert(`Escribile a ${participant.name} en WhatsApp`)
    }
  }

  if (!activity) {
    navigate('/')
    return null
  }

  const formattedDate = activity.date
    ? new Date(activity.date).toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : ''

  return (
    <div className="screen">
      {/* Header */}
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid var(--gray-100)', background: '#fff',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <div>
          <div className="page-title" style={{ fontSize: 16 }}>{activity.title}</div>
          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{formattedDate}</div>
        </div>
      </div>

      {/* Activity info card */}
      <div style={{
        margin: '16px 18px',
        background: 'var(--gray-50)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        border: '1px solid var(--gray-100)',
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r-md)',
            background: activity.category === 'aventura' ? 'var(--purple-lt)' :
                        activity.category === 'cultura'  ? 'var(--blue-lt)'   : 'var(--coral-lt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, flexShrink: 0,
          }}>
            {activity.category === 'aventura' ? '🏔' : activity.category === 'cultura' ? '🎭' : '🍽'}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--gray-900)' }}>{activity.location}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{formattedDate}</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{activity.description}</div>
      </div>

      {/* Join button */}
      <div style={{ padding: '0 18px 16px' }}>
        {joined ? (
          <div style={{
            padding: '14px', borderRadius: 'var(--r-lg)',
            background: 'var(--teal-lt)', border: '1px solid #9FE1CB',
            textAlign: 'center', fontWeight: 600, fontSize: 14, color: 'var(--teal)',
          }}>
            ✓ Ya estás anotado/a en esta actividad
          </div>
        ) : (
          <button className="btn-full" onClick={handleJoin} disabled={joining}>
            {joining ? 'Anotándote...' : '¡Me anoto!'}
          </button>
        )}
      </div>

      {/* Participants list */}
      <div className="section-label">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
        {loading ? 'Cargando...' : `${participants.length} anotado${participants.length !== 1 ? 's' : ''}`}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-300)', fontSize: 14 }}>
          Cargando participantes...
        </div>
      ) : participants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--gray-900)', marginBottom: 6 }}>
            Sé el primero en anotarte
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
            Cuando te anotes vas a aparecer acá y otros usuarios podrán contactarte.
          </div>
        </div>
      ) : (
        <>
          {participants.map((p, i) => (
            <div key={p.uid} className="participant-row">
              <div
                className="participant-av"
                style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
              >
                {p.initials || p.name?.slice(0,2).toUpperCase() || '?'}
              </div>
              <div style={{ flex: 1 }}>
                <div className="participant-name">
                  {p.name}
                  {p.uid === user.uid && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 600,
                      background: 'var(--coral-lt)', color: 'var(--coral)',
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                    }}>vos</span>
                  )}
                </div>
                <div className="participant-city">
                  {p.city || 'Buenos Aires'}
                  {p.interests?.length > 0 && (
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>
                      · {p.interests.slice(0,2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              {p.uid !== user.uid && (
                <button
                  className="wa-contact-btn"
                  onClick={() => handleWhatsApp(p)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.533 5.854L.057 23.25l5.54-1.452A11.93 11.93 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.793 9.793 0 01-5.002-1.373l-.359-.214-3.29.862.878-3.21-.233-.372A9.76 9.76 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
                  </svg>
                  Contactar
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Bottom padding */}
      <div style={{ height: 24 }} />
    </div>
  )
}
