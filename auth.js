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

// ===== Header Sign In button + User dropdown =====
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signInBtn");
  if (!btn) return;
  const label = btn.querySelector(".btn-label");
  const dropdown = document.getElementById("userDropdown");

  function fillDropdown(user) {
    if (!user) return;
    const name = user.displayName || "User";
    document.getElementById("udAvatar").textContent = name[0].toUpperCase();
    document.getElementById("udName").textContent = name;
    document.getElementById("udEmail").textContent = user.email || "";
  }

  function toggleDropdown(force) {
    if (!btn.dataset.logged) return; // logged-out me dropdown nahi
    const open = dropdown.classList.toggle("open", force);
    btn.setAttribute("aria-expanded", String(open));
  }

  fbWatch((user) => {
    if (user) {
      const name = (user.displayName || user.email || "User").split(" ")[0];
      if (label) label.textContent = "📦 " + name;
      btn.dataset.logged = "1";
      fillDropdown(user);
    } else {
      if (label) label.textContent = "Sign In";
      btn.dataset.logged = "";
      dropdown.classList.remove("open");
    }
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!btn.dataset.logged) {
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
      return;
    }
    // Logged in → user dashboard dropdown toggle
    toggleDropdown();
  });

  // Bahar click → dropdown band
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#userMenu")) dropdown.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") dropdown.classList.remove("open");
  });
  // Dropdown ke andar link click → band
  dropdown?.addEventListener("click", (e) => {
    if (e.target.closest(".ud-link")) dropdown.classList.remove("open");
  });

  // Sign out
  document.getElementById("udSignOut")?.addEventListener("click", () => {
    fbSignOut().then(() => location.reload());
  });

  // Testing/preview ke liye expose
  window.renderUserMenu = fillDropdown;
});

// ===== Homepage "My Account" panel (Google login state ke hisaab se) =====
document.addEventListener("DOMContentLoaded", () => {
  const signedOutEl = document.getElementById("accountSignedOut");
  const loggedInEl = document.getElementById("accountLoggedIn");
  if (!signedOutEl || !loggedInEl) return;

  function renderAccountPanel(user) {
    if (!user) {
      signedOutEl.style.display = "";
      loggedInEl.style.display = "none";
      return;
    }
    signedOutEl.style.display = "none";
    loggedInEl.style.display = "";

    const name = user.displayName || "User";
    document.getElementById("accAvatar").textContent = name[0].toUpperCase();
    document.getElementById("accName").textContent = name;
    document.getElementById("accEmail").textContent = user.email || "";

    // User ke recent orders (latest 3)
    let orders = [];
    try {
      orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
    } catch {
      orders = [];
    }
    const mine = orders.filter(
      (o) => o.customer.uid === user.uid || (o.customer.email && o.customer.email === user.email)
    );
    const host = document.getElementById("accOrders");
    host.innerHTML = mine.length
      ? mine
          .slice(-3)
          .reverse()
          .map(
            (o) => `
        <div class="uo-order">
          <div class="uo-order-head">
            <div>
              <b>${o.id}</b>
              <span class="row-sub">${o.date || ""} · ${o.pay || "COD"}</span>
            </div>
            <span class="uo-status ${o.status === "Delivered" ? "uo-done" : o.status === "Shipped" ? "uo-ship" : "uo-pend"}">${o.status}</span>
          </div>
          <div class="uo-items">
            ${o.items
              .map(
                (i) => `
              <div class="uo-item">
                ${i.image ? '<img src="' + i.image + '" alt="" loading="lazy" />' : '<span class="uo-emoji">' + (i.emoji || "📦") + "</span>"}
                <span class="uo-item-name">${i.name}</span>
                <span class="uo-item-qty">× ${i.qty}</span>
                <span class="uo-item-price">₹${Number(i.price * i.qty).toLocaleString("en-IN")}</span>
              </div>`
              )
              .join("")}
          </div>
          <div class="uo-total">Total · <b>₹${Number(o.total).toLocaleString("en-IN")}</b></div>
        </div>`
          )
          .join("")
      : '<div class="acc-empty">Abhi koi order nahi — <a href="#products">Best Sellers se shuru karo</a>!</div>';
  }

  fbWatch(renderAccountPanel);

  document.getElementById("accountGoogleBtn")?.addEventListener("click", () => {
    const m = document.getElementById("accountMsg");
    m.textContent = "Google window khul rahi hai...";
    m.style.color = "var(--muted)";
    fbGoogleSignIn().catch((err) => {
      let t = err.message || err.code || "Unknown error";
      if (err.code === "auth/operation-not-allowed") {
        t = "Google sign-in Firebase Console me enable nahi hai — Console → Authentication → Google → Enable karo.";
      }
      m.textContent = "❌ " + t;
      m.style.color = "#b33232";
    });
  });

  document.getElementById("accSignOut")?.addEventListener("click", () => {
    fbSignOut().then(() => location.reload());
  });
});
