// src/screens/Proponer.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { createActivity } from '../services/firestoreService'

const CATEGORIES = [
  { id: 'aventura',       label: '🏔 Aventura' },
  { id: 'social',         label: '🍽 Social' },
  { id: 'cultura',        label: '🎭 Cultura' },
  { id: 'entretenimiento',label: '🎮 Entretenimiento' },
]

export default function Proponer() {
  const navigate = useNavigate()
  const { user, addActivity } = useStore()

  const [form, setForm] = useState({
    title: '', category: 'aventura', subcategory: '',
    date: '', time: '18:00', location: '', city: user.city,
    description: '', maxSpots: 10, whatsappLink: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('El nombre es obligatorio.'); return }
    if (!form.date)          { setError('La fecha es obligatoria.'); return }
    if (!form.location.trim()){ setError('El lugar es obligatorio.'); return }
    setError('')
    setSubmitting(true)
    try {
      const dateISO = new Date(`${form.date}T${form.time}:00`).toISOString()
      const newActivity = {
        ...form,
        date: dateISO,
        maxSpots: Number(form.maxSpots),
        spotsLeft: Number(form.maxSpots) - 1,
        source: 'wink',
        recommended: false,
        imageUrl: imagePreview || null,
        participants: [{ initials: user.initials, bg: '#FAECE7', color: '#993C1D' }],
        createdBy: user.uid,
      }
      await createActivity(newActivity, user.uid)
      addActivity({ id: `act_${Date.now()}`, ...newActivity })
      navigate('/')
    } catch (e) {
      setError('Error al publicar. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="screen">
      <div className="form-scr" style={{ padding: '14px 16px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <div className="page-title">Proponer actividad</div>
        </div>

        {error && (
          <div style={{
            background: '#FCEBEB', border: '0.5px solid #F09595',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 13, color: '#A32D2D', marginBottom: 14
          }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Nombre de la actividad *</label>
          <input
            className="form-input"
            type="text"
            placeholder="Ej: Picnic en el Rosedal..."
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Categoría</label>
          <div className="form-grid-2">
            {CATEGORIES.map((c) => (
              <div
                key={c.id}
                className={`cat-option ${form.category === c.id ? 'selected' : ''}`}
                onClick={() => set('category', c.id)}
              >
                {c.label}
              </div>
            ))}
          </div>
        </div>

        {/* Date + Time */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Fecha *</label>
            <input className="form-input" type="date"
              value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Hora</label>
            <input className="form-input" type="time"
              value={form.time} onChange={(e) => set('time', e.target.value)} />
          </div>
        </div>

        {/* Location + City */}
        <div className="form-group">
          <label className="form-label">Lugar *</label>
          <input className="form-input" type="text"
            placeholder="Dirección o punto de referencia"
            value={form.location} onChange={(e) => set('location', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Ciudad</label>
            <input className="form-input" type="text"
              value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Cupos máx.</label>
            <input className="form-input" type="number"
              min="2" max="100" value={form.maxSpots}
              onChange={(e) => set('maxSpots', e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea className="form-input" style={{ height: 80, resize: 'none' }}
            placeholder="¿De qué trata? ¿Qué traer? ¿Nivel requerido?"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        {/* WhatsApp */}
        <div className="form-group">
          <label className="form-label">Link de WhatsApp (opcional)</label>
          <input className="form-input" type="url"
            placeholder="https://chat.whatsapp.com/..."
            value={form.whatsappLink}
            onChange={(e) => set('whatsappLink', e.target.value)} />
        </div>

        {/* Image upload */}
        <div className="form-group">
          <label className="form-label">Foto de la actividad</label>
          {imagePreview ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 120 }}>
              <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => setImagePreview(null)}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  width: 28, height: 28, color: '#fff', cursor: 'pointer', fontSize: 14
                }}
              >✕</button>
            </div>
          ) : (
            <label className="img-upload-zone">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              Subir foto
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            </label>
          )}
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Publicando...' : 'Publicar actividad'}
        </button>
      </div>
    </div>
  )
}
