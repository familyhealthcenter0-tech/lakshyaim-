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
  document.getElementById("loginHeader").style.display = "none";
  dashboard.style.display = "flex";
  const chip = "👤 " + user;
  document.getElementById("adUserChip").textContent = chip;
  document.getElementById("adUserChipTop").textContent = chip;
  document.getElementById("welcomeMsg").textContent =
    `Welcome back, ${user}! Here's what's happening at Lakshyaim today.`;
  switchView("dashboard");
}

// ===== Sidebar view switching =====
function switchView(view) {
  document.querySelectorAll(".ad-view").forEach((v) => {
    v.style.display = v.id === "view-" + view ? "block" : "none";
  });
  document.querySelectorAll(".ad-link[data-view]").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === view);
  });
  const titles = { dashboard: "Dashboard", products: "Products", orders: "Orders" };
  document.getElementById("viewTitle").textContent = titles[view] || "Dashboard";
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll(".ad-link[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});
document.querySelectorAll(".qa-btn[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.goto));
});

// Mobile sidebar toggle
function closeSidebar() {
  document.body.classList.remove("sidebar-open");
}
document.getElementById("adBurger")?.addEventListener("click", () => {
  document.body.classList.toggle("sidebar-open");
});
document.getElementById("adOverlay")?.addEventListener("click", closeSidebar);

// Logout
logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("lakshyaim_admin");
  dashboard.style.display = "none";
  document.getElementById("loginHeader").style.display = "";
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
const pImageSelect = document.getElementById("pImage");
const addPreview = document.getElementById("addPreview");
const addPreviewImg = document.getElementById("addPreviewImg");

// Gallery photos ko picker me bharo (gallery/manifest.json se)
if (pImageSelect) {
  fetch("gallery/manifest.json")
    .then((r) => r.json())
    .then((list) => {
      pImageSelect.innerHTML =
        '<option value="">— Koi photo nahi (emoji dikhega) —</option>' +
        (Array.isArray(list)
          ? list
              .map(
                (src) =>
                  `<option value="${src}">📷 ${src.split("/").pop().replace(".jpg", "")}</option>`
              )
              .join("")
          : "");
    })
    .catch(() => {
      pImageSelect.innerHTML =
        '<option value="">— Photos load nahi hui (server chalu karo) —</option>';
    });
}

// Preview: selected photo + focus/zoom live dikhaye
function updateAddPreview() {
  if (!addPreview) return;
  const src = pImageSelect.value;
  if (!src) {
    addPreview.hidden = true;
    addPreviewImg.removeAttribute("src");
    return;
  }
  const pos = document.getElementById("pImgPos").value.trim() || "50% 50%";
  const zoom = parseFloat(document.getElementById("pImgZoom").value) || 1;
  addPreviewImg.src = src;
  addPreviewImg.style.objectPosition = zoom > 1 ? "50% 50%" : pos;
  addPreviewImg.style.transform = zoom > 1 ? `scale(${zoom})` : "";
  addPreviewImg.style.transformOrigin = zoom > 1 ? pos : "";
  addPreview.hidden = false;
}
["pImage", "pImgPos", "pImgZoom"].forEach((id) =>
  document.getElementById(id)?.addEventListener("input", updateAddPreview)
);

function setProdMsg(text, color) {
  prodMsg.textContent = text;
  prodMsg.style.color = color;
}
function refreshProductTable() {
  if (!tableBody) return;
  getProducts().then((list) => {
    prodCount.textContent = list.length;
    const statProducts = document.getElementById("statProducts");
    if (statProducts) statProducts.textContent = list.length;
    tableBody.innerHTML = list
      .map(
        (p, i) => `
      <tr data-search="${(p.name + " " + p.tag).toLowerCase()}">
        <td class="cell-emoji"><span class="p-thumb" style="background:${p.bg}">${p.image ? `<img src="${p.image}" alt="" onerror="this.remove()" />` : p.emoji}</span></td>
        <td>${p.name}</td>
        <td>${p.tag}</td>
        <td>${formatPrice(p.price)}</td>
        <td><button class="del-btn" data-index="${i}">🗑 Delete</button></td>
      </tr>`
      )
      .join("");
    updateStats();
  });
}

// Product search filter — catalog table live filter
const searchInput = document.getElementById("prodSearch");
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    [...tableBody.querySelectorAll("tr")].forEach((tr) => {
      const hay = (tr.dataset.search || "");
      tr.style.display = hay.includes(q) ? "" : "none";
    });
  });
}

// ===== Dashboard stats — sab dynamic (localStorage orders) =====
function updateStats() {
  const orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
  const so = document.getElementById("statOrders");
  const sp = document.getElementById("statPending");
  const sr = document.getElementById("statRevenue");
  if (so) so.textContent = orders.length;
  if (sp) sp.textContent = orders.filter((o) => o.status === "Pending").length;
  if (sr) sr.textContent = "₹" + orders.reduce((n, o) => n + Number(o.total || 0), 0).toLocaleString("en-IN");
}

if (addForm) {
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const list = JSON.parse(JSON.stringify(await getProducts()));
    const image = pImageSelect.value.trim();
    const emoji = document.getElementById("pEmoji").value.trim();

    // Emoji ya photo — koi ek zaroori hai
    if (!image && !emoji) {
      setProdMsg(
        "❌ Emoji ya photo — koi ek to do. Gallery se photo choose karo, ya chhota emoji type karo.",
        "#b33232"
      );
      return;
    }

    const imgPos = document.getElementById("pImgPos").value.trim();
    const imgZoom = parseFloat(document.getElementById("pImgZoom").value) || 0;
    const product = {
      emoji: emoji || "📦",
      bg: "#eef5ec",
      ...(image ? { image } : {}),
      ...(image && imgPos ? { imgPos } : {}),
      ...(image && imgZoom > 1 ? { imgZoom } : {}),
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
    refreshProductTable();
    // nayi row highlight + dikhao
    requestAnimationFrame(() => {
      const lastRow = tableBody.lastElementChild;
      if (lastRow) {
        lastRow.classList.add("row-new");
        lastRow.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    });
    setProdMsg(
      `✅ "${product.name}" add ho gaya. Shop pe live hai — ab agla product bharo.`,
      "#0b6b46"
    );
    addForm.reset();
    document.getElementById("pRating").value = 5;
    document.getElementById("pReviews").value = 0;
    addPreview.hidden = true;
    addPreviewImg.removeAttribute("src");
  });
  // Delete product
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target.closest(".del-btn");
    if (!btn) return;
    const list = await getProducts();
    list.splice(+btn.dataset.index, 1);
    saveProducts(list);
    refreshProductTable();
    setProdMsg("🗑 Product delete ho gaya.", "#b33232");
  });

  // Reset to defaults
  document.getElementById("resetProductsBtn").addEventListener("click", async () => {
    localStorage.removeItem("lakshyaim_products");
    refreshProductTable();
    setProdMsg("↩ Catalog default products pe reset ho gaya.", "#5f6d66");
  });

  // Catalog JSON download — products.json file ke roop me
  document.getElementById("downloadCatalogBtn").addEventListener("click", async () => {
    const list = await getProducts();
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "products.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setProdMsg(
      "⬇ products.json download ho gayi. Isse product/products.json replace karke batao — deploy karke sabko naye products dikha denge.",
      "#5f6d66"
    );
  });

  refreshProductTable();
}

// ===== Recent Orders (checkout se place hue) =====
function renderRecentOrders() {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;
  const fmtN = (n) => "₹" + Number(n).toLocaleString("en-IN");
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem("lakshyaim_orders")) || [];
  } catch {
    orders = [];
  }
  if (!orders.length) {
    tbody.innerHTML =
      '<tr><td colspan="6" style="color:var(--muted)">Abhi koi order nahi — site par checkout se pehla order test karo, wahi yahan live dikhega.</td></tr>';
    updateStats();
    return;
  }
  tbody.innerHTML = orders
    .slice()
    .reverse()
    .slice(0, 8)
    .map(
      (o) => `
      <tr>
        <td><b>${o.id}</b></td>
        <td>
          <div class="cust-cell"><b>${o.customer.name}</b><span class="row-sub">${o.date || ""} · ${o.customer.city || ""}</span></div>
        </td>
        <td>${o.items.length > 1 ? o.items[0].name + " +" + (o.items.length - 1) + " more" : o.items[0].name}</td>
        <td><b>${fmtN(o.total)}</b></td>
        <td><span class="pay-chip">${o.pay || "COD"}</span></td>
        <td><span class="status st-pend">${o.status}</span></td>
      </tr>`
    )
    .join("");
  updateStats();
}
renderRecentOrders();
