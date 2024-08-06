import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDZn7okFcq_zBsAUQ77yzptd7d9_RPA0Kk",
  authDomain: "inventory-management-b5a39.firebaseapp.com",
  projectId: "inventory-management-b5a39",
  storageBucket: "inventory-management-b5a39.appspot.com",
  messagingSenderId: "691935823038",
  appId: "1:691935823038:web:e8e9ea64ccd34b7daa0aef",
  measurementId: "G-SEMBXP57RS"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);



const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { firestore, auth, provider };
