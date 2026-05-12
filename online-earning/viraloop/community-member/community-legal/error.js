// We use the full URL so the browser can find the code
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth,onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-functions.js";


const noteConfig = {
  apiKey: "AIzaSyDRrgCyuMvT8BZqUeEw2nX2AF8fLKIGD7Y",
  authDomain: "sapanacyberhub-26310.firebaseapp.com",
  projectId: "sapanacyberhub-26310",
  storageBucket: "sapanacyberhub-26310.firebasestorage.app",
  messagingSenderId: "448116453690",
  appId: "1:448116453690:web:01a91dd284b715bf0a2003",
  measurementId: "G-HKGQ8D55N1",
};


// Initialize Firebase
const app = initializeApp(noteConfig);

// Initialize Services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");

// Cloud Function callables
const createViraLoopMember = httpsCallable(functions, "createViraLoopMember");
const getMemberProfile  = httpsCallable(functions, "getMemberProfile");
const updateLastActive = httpsCallable(functions, "updateLastActive");

// Return/Export everything in one object
export {
    app,
    db,
    auth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    collection,
    getDocs,
    addDoc,
    doc,
    setDoc,
    createViraLoopMember,
    getMemberProfile ,
    updateLastActive,
    deleteUser
};