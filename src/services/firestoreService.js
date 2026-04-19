// src/services/firestoreService.js
import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, onSnapshot, serverTimestamp,
  arrayUnion, increment,
} from 'firebase/firestore'
import { db } from '../firebase'

// ── Activities ──────────────────────────────────────────────────────────────

export async function getActivities({ city, category }) {
  let q = query(collection(db, 'activities'), where('city', '==', city), orderBy('date', 'asc'))
  if (category && category !== 'all') {
    q = query(q, where('category', '==', category))
  }
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export function subscribeActivities(city, callback) {
  const q = query(
    collection(db, 'activities'),
    where('city', '==', city),
    orderBy('date', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function createActivity(data, userId) {
  const ref = await addDoc(collection(db, 'activities'), {
    ...data,
    createdBy: userId,
    source: 'wink',
    status: 'pending_moderation',
    participants: [userId],
    spotsLeft: data.maxSpots - 1,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function joinActivity(activityId, userId) {
  const ref = doc(db, 'activities', activityId)
  await updateDoc(ref, {
    participants: arrayUnion(userId),
    spotsLeft: increment(-1),
  })
  await updateDoc(doc(db, 'users', userId), {
    joinedActivities: arrayUnion(activityId),
  })
}

// ── Ratings / NPS ──────────────────────────────────────────────────────────

export async function submitRating({ userId, activityId, type, npsScore, stars, comment }) {
  await addDoc(collection(db, 'ratings'), {
    userId,
    activityId: activityId || null,
    type,         // 'activity' | 'app'
    npsScore,     // 0–10
    stars: stars || null,
    comment: comment || '',
    createdAt: serverTimestamp(),
  })

  // Update activity avg rating
  if (type === 'activity' && activityId) {
    // In production: use a Cloud Function to recalculate avg
    const actRef = doc(db, 'activities', activityId)
    await updateDoc(actRef, { lastRatedAt: serverTimestamp() })
  }

  // Give reputation points to user
  await updateDoc(doc(db, 'users', userId), {
    reputation: increment(10),
  })
}

// ── Chat ───────────────────────────────────────────────────────────────────

export function subscribeChat(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(chatId, { userId, name, text }) {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    userId,
    name,
    text,
    createdAt: serverTimestamp(),
  })
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null
}

export async function updateUserInterests(uid, interests) {
  await updateDoc(doc(db, 'users', uid), { interests, updatedAt: serverTimestamp() })
}
