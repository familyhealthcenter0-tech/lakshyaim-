// Admin login logic (demo — credentials are client-side only)

const CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");
const togglePass = document.getElementById("togglePass");
const passwordInput = document.getElementById("password");
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");

// Password show/hide
togglePass.addEventListener("click", () => {
  const show = passwordInput.type === "password";
  passwordInput.type = show ? "text" : "password";
});

// Login
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // trim aur lowercase — typing ki galtiyon (Caps Lock, extra space) pe maaf karta hai
  const user = document.getElementById("username").value.trim().toLowerCase();
  const pass = passwordInput.value.trim().toLowerCase();

  const userOk = user === CREDENTIALS.username;
  const passOk = pass === CREDENTIALS.password;

  if (userOk && passOk) {
    sessionStorage.setItem("lakshyaim_admin", CREDENTIALS.username);
    openDashboard(CREDENTIALS.username);
  } else if (!userOk && passOk) {
    errorMsg.textContent = "❌ Username galat hai. Sahi username: admin";
    errorMsg.classList.add("show");
  } else if (userOk && !passOk) {
    errorMsg.textContent = "❌ Password galat hai. Sahi password: admin123";
    errorMsg.classList.add("show");
  } else {
    errorMsg.textContent = "❌ Username aur password dono galat hain.";
    errorMsg.classList.add("show");
  }
});

function openDashboard(user) {
  loginScreen.style.display = "none";
  dashboard.style.display = "block";
  document.getElementById("welcomeMsg").textContent =
    `Welcome back, ${user}! Here's what's happening at Lakshyaim today.`;
  dashboard.scrollIntoView({ behavior: "instant" });
}

// Logout
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lakshyaim_admin");
  dashboard.style.display = "none";
  loginScreen.style.display = "grid";
  loginForm.reset();
  errorMsg.classList.remove("show");
});

// Auto-login if session already active
window.addEventListener("load", () => {
  const saved = sessionStorage.getItem("lakshyaim_admin");
  if (saved) openDashboard(saved);
});

// ===== Product management =====
const addForm = document.getElementById("addProductForm");
const prodMsg = document.getElementById("prodMsg");
const tableBody = document.getElementById("productTableBody");
const prodCount = document.getElementById("prodCount");

function refreshProductTable() {
  if (!tableBody) return;
  getProducts().then((list) => {
    prodCount.textContent = list.length;
    tableBody.innerHTML = list
      .map(
        (p, i) => `
      <tr>
        <td class="cell-emoji"><span class="p-thumb" style="background:${p.bg}">${p.emoji}</span></td>
        <td>${p.name}</td>
        <td>${p.tag}</td>
        <td>${formatPrice(p.price)}</td>
        <td><button class="del-btn" data-index="${i}">🗑 Delete</button></td>
      </tr>`
      )
      .join("");
  });
}

function saveAndRefresh(list, msg) {
  saveProducts(list);
  refreshProductTable();
  prodMsg.textContent = msg;
  prodMsg.style.color = "#bff0c8";
}

if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const list = JSON.parse(JSON.stringify(await getProducts()));
    const product = {
      emoji: document.getElementById("pEmoji").value.trim() || "📦",
      bg: "#eef5ec",
      tag: document.getElementById("pTag").value.trim(),
      tagClass: document.getElementById("pTagClass").value,
      name: document.getElementById("pName").value.trim(),
      rating: Math.min(5, Math.max(1, +document.getElementById("pRating").value)),
      reviews: +document.getElementById("pReviews").value || 0,
      price: +document.getElementById("pPrice").value,
      mrp: +document.getElementById("pMrp").value || 0,
    };
    list.push(product);
    saveProducts(list);
    saveAndRefresh(list, `✅ "${product.name}" save ho gaya. Shop page pe live hai!`);
    addForm.reset();
    document.getElementById("pRating").value = 5;
    document.getElementById("pReviews").value = 0;
  });

  // Delete product
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".del-btn");
    if (!btn) return;
    const list = await getProducts();
    list.splice(+btn.dataset.index, 1);
    saveProducts(list);
    refreshProductTable();
    prodMsg.textContent = "🗑 Product delete ho gaya.";
    prodMsg.style.color = "#ffd6d6";
  });

  // Reset to defaults
  document.getElementById("resetProductsBtn").addEventListener("click", async () => {
    localStorage.removeItem("lakshyaim_products");
    refreshProductTable();
    prodMsg.textContent = "↩ Catalog default products pe reset ho gaya.";
    prodMsg.style.color = "#eef7ef";
  });

  refreshProductTable();
}
