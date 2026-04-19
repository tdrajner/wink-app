// src/screens/Login.jsx
import { useState } from 'react'
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'

export default function Login() {
  const [mode, setMode]       = useState('login') // 'login' | 'register'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]       = useState('')
  const [city, setCity]       = useState('Buenos Aires')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function ensureUserDoc(firebaseUser, extraData = {}) {
    const ref = doc(db, 'users', firebaseUser.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        name: extraData.name || firebaseUser.displayName || 'Usuario',
        email: firebaseUser.email,
        city: extraData.city || 'Buenos Aires',
        bio: '',
        interests: [],
        joinedActivities: [],
        reputation: 0,
        activitiesCount: 0,
        connectionsCount: 0,
        initials: (extraData.name || firebaseUser.displayName || 'U')
          .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
        createdAt: serverTimestamp(),
      })
    }
  }

  async function handleGoogle() {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      await ensureUserDoc(result.user)
    } catch (e) {
      setError('Error al iniciar con Google. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleEmail() {
    if (!email || !password) { setError('Completá email y contraseña.'); return }
    if (mode === 'register' && !name) { setError('Escribí tu nombre.'); return }
    setLoading(true)
    setError('')
    try {
      if (mode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        await ensureUserDoc(result.user, { name, city })
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (e) {
      const msgs = {
        'auth/email-already-in-use': 'Este email ya tiene una cuenta.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/user-not-found': 'No existe una cuenta con ese email.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email': 'El email no es válido.',
      }
      setError(msgs[e.code] || 'Error al iniciar sesión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Hero */}
      <div style={{
        background: '#D85A30', padding: '48px 24px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: '#F0997B', opacity: 0.3,
        }}/>
        <div style={{
          position: 'absolute', bottom: -50, left: -20,
          width: 120, height: 120, borderRadius: '50%',
          background: '#993C1D', opacity: 0.3,
        }}/>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: 38, color: '#fff', letterSpacing: -2,
          position: 'relative', zIndex: 1,
        }}>
          wink<span style={{ color: '#9FE1CB' }}>.</span>
        </div>
        <div style={{
          fontSize: 16, color: '#F5C4B3', marginTop: 8,
          lineHeight: 1.4, position: 'relative', zIndex: 1,
        }}>
          Encontrá personas para hacer<br/>las actividades que te gustan
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: '28px 24px', flex: 1 }}>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', border: '0.5px solid #ddd',
          borderRadius: 12, overflow: 'hidden', marginBottom: 24,
        }}>
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
              background: mode === m ? '#D85A30' : '#fff',
              color: mode === m ? '#fff' : '#888',
              transition: 'all 0.15s',
            }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: '#FCEBEB', border: '0.5px solid #F09595',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#A32D2D', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {mode === 'register' && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>
                Nombre completo
              </label>
              <input
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '0.5px solid #ccc', fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  background: '#f8f8f6',
                }}
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>
                Ciudad
              </label>
              <input
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10,
                  border: '0.5px solid #ccc', fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif', outline: 'none',
                  background: '#f8f8f6',
                }}
                placeholder="Buenos Aires"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>
            Email
          </label>
          <input
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10,
              border: '0.5px solid #ccc', fontSize: 14,
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
              background: '#f8f8f6',
            }}
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>
            Contraseña
          </label>
          <input
            style={{
              width: '100%', padding: '11px 14px', borderRadius: 10,
              border: '0.5px solid #ccc', fontSize: 14,
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
              background: '#f8f8f6',
            }}
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmail()}
          />
        </div>

        <button
          onClick={handleEmail}
          disabled={loading}
          style={{
            width: '100%', padding: 14, borderRadius: 14,
            background: loading ? '#ccc' : '#D85A30',
            color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15,
            marginBottom: 14, transition: 'background 0.15s',
          }}
        >
          {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }}/>
          <span style={{ fontSize: 12, color: '#aaa' }}>o</span>
          <div style={{ flex: 1, height: '0.5px', background: '#eee' }}/>
        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%', padding: 13, borderRadius: 14,
            background: '#fff', color: '#333', border: '0.5px solid #ddd',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>
      </div>
    </div>
  )
}
