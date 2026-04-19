// src/store.js
import { create } from 'zustand'
import { MOCK_USER, MOCK_ACTIVITIES } from './data/mockData'

export const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────
  user: MOCK_USER,
  setUser: (user) => set({ user }),

  // ── Activities ────────────────────────────────────
  activities: MOCK_ACTIVITIES,
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) =>
    set((s) => ({ activities: [activity, ...s.activities] })),

  // ── Joined ────────────────────────────────────────
  joinedIds: new Set(MOCK_USER.joinedActivities),
  joinActivity: (id) =>
    set((s) => ({ joinedIds: new Set([...s.joinedIds, id]) })),

  // ── Filter ────────────────────────────────────────
  activeFilter: 'all',
  setFilter: (f) => set({ activeFilter: f }),

  filteredActivities: () => {
    const { activities, activeFilter } = get()
    if (activeFilter === 'all') return activities
    return activities.filter((a) => a.category === activeFilter)
  },

  // ── NPS pending ───────────────────────────────────
  pendingNpsActivityId: null,
  setPendingNps: (id) => set({ pendingNpsActivityId: id }),
  clearPendingNps: () => set({ pendingNpsActivityId: null }),

  // ── Ratings store (local, ideally goes to Firestore) ──
  ratings: [],
  addRating: (rating) =>
    set((s) => ({ ratings: [...s.ratings, rating] })),
}))
