import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyBjulnCC-v7GrND2M7WFe8acga_mzwfp74",
  authDomain: "wink-15127.firebaseapp.com",
  projectId: "wink-15127",
  storageBucket: "wink-15127.firebasestorage.app",
  messagingSenderId: "583312395417",
  appId: "1:583312395417:web:cb6e0d6e3e279a238cbc08",
  measurementId: "G-87VN6WX957"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
