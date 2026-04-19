// src/components/ActivityCard.jsx
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import CategoryIllustration from './CategoryIllustration'
import { CATEGORY_COLORS, SOURCE_LABELS } from '../data/mockData'

export default function ActivityCard({ activity }) {
  const navigate   = useNavigate()
  const { user, joinedIds } = useStore()
  const isJoined   = joinedIds.has(activity.id)
  const catColors  = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.aventura

  function handleJoinClick() {
    navigate('/participantes', { state: { activity } })
  }

  const formattedDate = activity.date
    ? new Date(activity.date).toLocaleDateString('es-AR', {
        weekday: 'short', day: 'numeric', month: 'short',
      })
    : ''
  const formattedTime = activity.date
    ? new Date(activity.date).toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  const sourceLabel = {
    predicthq:   'PredictHQ',
    ticketmaster:'Ticketmaster',
    meetup:      'Meetup',
    wink:        'Wink',
    eventbrite:  'Eventbrite',
  }[activity.source] || activity.source

  return (
    <div className="activity-card">
      {/* Image */}
      <div className="card-image">
        {activity.imageUrl ? (
          <img src={activity.imageUrl} alt={activity.title} />
        ) : (
          <CategoryIllustration category={activity.category} subcategory={activity.subcategory} />
        )}
        <div className="card-image-overlay" />

        <div className="card-badges">
          <span className={`card-badge badge-${activity.category}`}>
            {catColors.label}
          </span>
          {activity.recommended && (
            <span className="card-badge badge-recommended">⭐ Para vos</span>
          )}
        </div>

        <div className={`source-badge source-${activity.source}`}>
          {sourceLabel}
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-title">{activity.title}</div>
        <div className="card-meta">
          📅 {formattedDate} {formattedTime && `· ${formattedTime}`}
          {activity.location && ` · 📍 ${activity.location}`}
        </div>
        <div className="card-desc">{activity.description}</div>
      </div>

      {/* Footer */}
      <div className="card-footer">
        <div>
          <div className="avatars-row">
            {(activity.participants || []).slice(0, 4).map((p, i) => (
              <div key={i} className="mini-avatar"
                style={{ background: p.bg || '#D85A30', color: p.color || '#fff', fontSize: p.small ? '8px' : '9px' }}>
                {p.initials}
              </div>
            ))}
          </div>
          <div className="spots-text">
            {activity.spotsLeft > 0 ? `${activity.spotsLeft} cupos libres` : 'Sin cupos'}
          </div>
        </div>

        <button
          className={isJoined ? 'btn-joined' : 'btn-primary'}
          onClick={handleJoinClick}
          style={{ fontSize: 13, padding: '9px 18px' }}
        >
          {isJoined ? '✓ Anotado' : 'Anotarme'}
        </button>
      </div>
    </div>
  )
}
