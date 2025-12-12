import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// REPLACE WITH YOUR FIREBASE CONFIG
// Get this from Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
    apiKey: "AIzaSyB1aoL1Jjg1UUKU90YBDNDXYBFOAewgPOs",
    authDomain: "sit-nexux.firebaseapp.com",
    projectId: "sit-nexux",
    storageBucket: "sit-nexux.firebasestorage.app",
    messagingSenderId: "675490956448",
    appId: "1:675490956448:web:99bf10d0692cc6fcea35c5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
