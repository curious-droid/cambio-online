// src/firebase.js
import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBoL3thhlCojOtawPTCAXTA5FRhvTJEUKE",
    authDomain: "cambio-98f60.firebaseapp.com",
    projectId: "cambio-98f60",
    storageBucket: "cambio-98f60.firebasestorage.app",
    messagingSenderId: "96143970260",
    appId: "1:96143970260:web:479673f3ee908dd215d041",
    measurementId: "G-1H3LZJZEZL"
  };

const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
const db = getFirestore(app);

// export { auth, db };

export { db };
