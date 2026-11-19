// Code partagé : Firebase, connexion, rôles
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,
         onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc,
         query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, query, orderBy,
         serverTimestamp, signOut, updatePassword, onAuthStateChanged };

export const OWNER = "nemesisshadow";            // ton pseudo (en minuscules)
const OWNER_FIRST_PASS = "azerty";              // mot de passe de départ, à changer à la 1re connexion
export const toEmail = p => `${p.trim().toLowerCase()}@monsite.app`;

// Connexion par pseudo
export async function login(pseudo, pass) {
  const email = toEmail(pseudo);
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    // 1re connexion du propriétaire : on crée son compte admin automatiquement
    if (pseudo.trim().toLowerCase() === OWNER && pass === OWNER_FIRST_PASS &&
        (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found")) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await setDoc(doc(db, "users", cred.user.uid),
        { pseudo: pseudo.trim(), role: "admin", mustChangePassword: true, createdAt: serverTimestamp() });
      return cred;
    }
    throw e;
  }
}

export async function register(pseudo, pass) {
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(pseudo.trim())) throw { code: "pseudo" };
  if (pseudo.trim().toLowerCase() === OWNER) throw { code: "auth/email-already-in-use" };
  const cred = await createUserWithEmailAndPassword(auth, toEmail(pseudo), pass);
  await setDoc(doc(db, "users", cred.user.uid),
    { pseudo: pseudo.trim(), role: "user", mustChangePassword: false, createdAt: serverTimestamp() });
  return cred;
}

export async function getProfile(uid) {
  const s = await getDoc(doc(db, "users", uid));
  return s.exists() ? s.data() : null;
}

// Protège une page : renvoie {user, profile} ou redirige vers le login
export function requireAuth(needAdmin = false) {
  return new Promise(res => onAuthStateChanged(auth, async user => {
    if (!user) return (location.href = "login.html");
    const profile = await getProfile(user.uid);
    if (!profile || profile.mustChangePassword) return (location.href = "login.html");
    if (needAdmin && profile.role !== "admin") return (location.href = "user.html");
    res({ user, profile });
  }));
}

export function errMsg(e) {
  return ({
    "auth/invalid-credential": "Pseudo ou mot de passe incorrect",
    "auth/user-not-found": "Pseudo ou mot de passe incorrect",
    "auth/wrong-password": "Pseudo ou mot de passe incorrect",
    "auth/email-already-in-use": "Ce pseudo est déjà pris",
    "auth/weak-password": "Mot de passe trop court (6 caractères minimum)",
    "auth/too-many-requests": "Trop d'essais, réessaie dans quelques minutes",
    "pseudo": "Pseudo : 3 à 20 caractères (lettres, chiffres, _)"
  })[e.code] || ("Erreur : " + (e.message || e.code));
}
