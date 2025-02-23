// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCYOO7tjhiVhKZtI1q-71BPm8JoUu6HPXY",
  authDomain: "e-schoolbus-1690b.firebaseapp.com",
  projectId: "e-schoolbus-1690b",
  storageBucket: "e-schoolbus-1690b.firebasestorage.app",
  messagingSenderId: "123402514451",
  appId: "1:123402514451:web:57c0192c115edbe6e10fe6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };