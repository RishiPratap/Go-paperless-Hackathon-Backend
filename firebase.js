const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");
const { getAuth } = require("firebase/auth");
// const { getStorage, ref  } = require("firebase/storage");

console.log(process.env.FIREBASE_API_KEY);

const firebaseConfig = {
  apiKey: "AIzaSyBvlzod6y_erkwulDck59xHd6HT04uOX-g",
  authDomain: "go-paperless-hackathon-2022.firebaseapp.com",
  projectId: "go-paperless-hackathon-2022",
  storageBucket: "go-paperless-hackathon-2022.appspot.com",
  messagingSenderId: "900300196057",
  appId: "1:900300196057:web:5b3e34b5a48157d2a016c8",
  measurementId: "G-SCDGHY1GK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();
// const storage = getStorage(app);
// const imagesRef = ref(storage, 'images');

auth.languageCode = "it";
module.exports = { auth, db };
