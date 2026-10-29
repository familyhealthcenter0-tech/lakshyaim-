// ============================================================
// auth.js — Firebase Google Authentication (customers ke liye)
// Include: index.html, checkout.html (body ke end me)
// Firebase config Firebase Hosting auto-init se (public info)
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBbNc0Xu_7-8vZB8fIVZXe6gJveE4m3O88",
  authDomain: "future-academy-80ae5.firebaseapp.com",
  projectId: "future-academy-80ae5",
  storageBucket: "future-academy-80ae5.firebasestorage.app",
  messagingSenderId: "179125643535",
};

// SDK load (compat build — simple global firebase object)
window.__fbReady = new Promise((resolve, reject) => {
  const s1 = document.createElement("script");
  s1.src = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
  s1.onload = () => {
    const s2 = document.createElement("script");
    s2.src = "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth-compat.js";
    s2.onload = () => {
      try {
        firebase.initializeApp(FIREBASE_CONFIG);
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    s2.onerror = () => reject(new Error("auth-sdk-load-failed"));
    document.head.appendChild(s2);
  };
  s1.onerror = () => reject(new Error("sdk-load-failed"));
  document.head.appendChild(s1);
});

// Auth state change — har page par chalega (header update etc.)
function fbWatch(cb) {
  return window.__fbReady
    .then(() => firebase.auth().onAuthStateChanged(cb))
    .catch((e) => console.warn("Auth SDK load fail:", e.message));
}

function fbCurrentUser() {
  return window.__fbReady.then(() => firebase.auth().currentUser);
}

// Google sign-in — popup pehle, block ho to redirect fallback
function fbGoogleSignIn() {
  return window.__fbReady.then(() => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return firebase
      .auth()
      .signInWithPopup(provider)
      .catch((err) => {
        if (
          ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(err.code)
        ) {
          return firebase.auth().signInWithRedirect(provider);
        }
        throw err;
      });
  });
}

function fbSignOut() {
  return window.__fbReady.then(() => firebase.auth().signOut());
}

// Redirect flow complete (signInWithRedirect ke baad wapas aane par)
window.__fbReady
  .then(() => firebase.auth().getRedirectResult())
  .catch(() => {});

// ===== Header Sign In button auto-integration =====
// index.html ka Sign In button: login → naam dikhata hai, click = sign out
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signInBtn");
  if (!btn) return;
  const label = btn.querySelector(".btn-label");

  fbWatch((user) => {
    if (user) {
      const name = (user.displayName || user.email || "User").split(" ")[0];
      if (label) label.textContent = "👋 " + name;
      btn.dataset.logged = "1";
    } else {
      if (label) label.textContent = "Sign In";
      btn.dataset.logged = "";
    }
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (btn.dataset.logged) {
      // Logged in → user dashboard (My Orders)
      location.href = "my-orders.html";
      return;
    }
    fbGoogleSignIn().catch((err) => {
      let m = err.message || err.code || "Unknown error";
      if (err.code === "auth/operation-not-allowed") {
        m = "Google sign-in Firebase Console me enable nahi hai — Authentication → Sign-in method → Google → Enable karo.";
      }
      if (err.code === "auth/unauthorized-domain") {
        m = "Ye domain authorized nahi hai — Firebase Console → Authentication → Settings → Authorized domains me add karo.";
      }
      alert("Google sign-in fail: " + m);
    });
  });
});
