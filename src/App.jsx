// src/App.jsx
import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { useStore } from './store'
import BottomNav     from './components/BottomNav'
import Feed          from './screens/Feed'
import Proponer      from './screens/Proponer'
import Profile       from './screens/Profile'
import Nps           from './screens/Nps'
import Login         from './screens/Login'
import Participants  from './screens/Participants'

const HIDE_NAV = ['/nps', '/participantes']

export default function App() {
  const { user, setUser } = useStore()
  const { pathname }      = useLocation()
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fu) => {
      if (fu) {
        try {
          const snap = await getDoc(doc(db, 'users', fu.uid))
          if (snap.exists()) {
            setUser({ uid: fu.uid, ...snap.data() })
          } else {
            setUser({
              uid: fu.uid,
              name: fu.displayName || 'Usuario',
              email: fu.email,
              initials: (fu.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
              city: 'Buenos Aires',
              interests: [],
              joinedActivities: [],
              reputation: 0,
              activitiesCount: 0,
              connectionsCount: 0,
            })
          }
        } catch {
          setUser({ uid: fu.uid, name: fu.displayName || 'Usuario', email: fu.email, initials: 'U', city: 'Buenos Aires', interests: [], joinedActivities: [], reputation: 0, activitiesCount: 0, connectionsCount: 0 })
        }
      } else {
        setUser(null)
      }
      setAuthReady(true)
    })
    return unsub
  }, [])

  if (!authReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#D85A30' }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 44, color: '#fff', letterSpacing: -2 }}>
          wink<span style={{ color: '#9FE1CB' }}>.</span>
        </div>
      </div>
    )
  }

  if (!user) return <Login />

  const showNav = !HIDE_NAV.includes(pathname)

  return (
    <div className="app-shell">
      {showNav && (
        <header className="app-header">
          <div className="app-logo">wink<span>.</span></div>
          <div className="city-pill">{user.city}</div>
          <div className="user-avatar">{user.initials}</div>
        </header>
      )}
      <Routes>
        <Route path="/"              element={<Feed />} />
        <Route path="/descubrir"     element={<Feed />} />
        <Route path="/proponer"      element={<Proponer />} />
        <Route path="/perfil"        element={<Profile />} />
        <Route path="/nps"           element={<Nps />} />
        <Route path="/participantes" element={<Participants />} />
      </Routes>
      {showNav && <BottomNav />}
    </div>
  )
}
