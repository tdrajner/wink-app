// src/screens/Profile.jsx
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useStore } from '../store'
import { updateUserInterests } from '../services/firestoreService'
import { INTERESTS } from '../data/mockData'

const CAT_COLORS = {
  aventura: { label: '🏔 Aventura', color: '#993C1D' },
  social:   { label: '🍽 Social',   color: '#0F6E56' },
  cultura:  { label: '🎭 Cultura',  color: '#185FA5' },
}

export default function Profile() {
  const { user, setUser } = useStore()
  const [interests, setInterests] = useState(new Set(user.interests || []))
  const [saved, setSaved] = useState(false)

  function toggleInterest(id) {
    setInterests(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setSaved(false)
  }

  async function saveInterests() {
    const arr = [...interests]
    setUser({ ...user, interests: arr })
    try { await updateUserInterests(user.uid, arr) } catch {}
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleLogout() {
    await signOut(auth)
    setUser(null)
  }

  return (
    <div className="screen">
      <div className="profile-hero">
        <div className="profile-avatar-lg">{user.initials}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-bio">{user.city} · {user.bio || 'Sin bio todavía'}</div>
      </div>
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-number">{user.activitiesCount || 0}</div><div className="stat-label">actividades</div></div>
        <div className="stat-box"><div className="stat-number">{user.connectionsCount || 0}</div><div className="stat-label">conexiones</div></div>
        <div className="stat-box"><div className="stat-number">{user.reputation || 0}</div><div className="stat-label">reputación</div></div>
        <div className="stat-box"><div className="stat-number">{interests.size}</div><div className="stat-label">intereses</div></div>
      </div>
      <div style={{ padding: '0 16px 16px' }}>
        <div className="section-label" style={{ padding: '0 0 12px' }}>Mis intereses</div>
        {Object.entries(INTERESTS).map(([cat, items]) => (
          <div key={cat}>
            <div className="int-cat-label" style={{ color: CAT_COLORS[cat].color }}>{CAT_COLORS[cat].label}</div>
            <div className="form-grid-2" style={{ marginBottom: 14 }}>
              {items.map(item => (
                <div key={item.id} className={`interest-item ${interests.has(item.id) ? 'selected' : ''}`} onClick={() => toggleInterest(item.id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={interests.has(item.id) ? '#D85A30' : 'currentColor'} strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    {interests.has(item.id) && <path d="M8 12l3 3 5-5" strokeWidth="2.5"/>}
                  </svg>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="submit-btn" onClick={saveInterests}>{saved ? '✓ Guardado' : 'Guardar intereses'}</button>
        <button onClick={handleLogout} style={{
          width:'100%', marginTop:12, padding:13, borderRadius:14,
          background:'#f8f8f6', color:'#888', border:'0.5px solid #ddd',
          fontFamily:'DM Sans,sans-serif', fontSize:14, cursor:'pointer'
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
