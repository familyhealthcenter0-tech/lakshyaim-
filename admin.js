// Admin login logic (credentials stored in localStorage, default admin/admin123)

function getAdminCreds() {
  try {
    const raw = localStorage.getItem("lakshyaim_admin_creds");
    if (raw) {
      const c = JSON.parse(raw);
      if (c.username && c.password) return c;
    }
  } catch {}
  return { username: "admin", password: "admin123" };
}

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

  const creds = getAdminCreds();
  const userOk = user === creds.username.toLowerCase();
  const passOk = pass === creds.password.toLowerCase();

  if (userOk && passOk) {
    sessionStorage.setItem("lakshyaim_admin", creds.username);
    openDashboard(creds.username);
  } else if (!userOk && passOk) {
    errorMsg.textContent = "Username galat hai.";
    errorMsg.classList.add("show");
  } else if (userOk && !passOk) {
    errorMsg.textContent = "Password galat hai.";
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
  document.getElementById("welcomeMsg").textContent = "Welcome back, " + user + "! 👋";
  document.getElementById("adDate").textContent = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const titles = {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    analytics: "Analytics",
    gallerymgmt: "Gallery Manager",
    database: "Database",
    members: "Members",
    content: "Site Content",
    activity: "Activity Log",
    settings: "Settings",
  };
  document.getElementById("viewTitle").textContent = titles[view] || "Dashboard";
  if (view === "database") renderDatabase();
  if (view === "analytics") renderAnalytics();
  if (view === "gallerymgmt") renderGalleryManager();
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
        <td class="cell-actions">
          <button class="edit-btn" data-index="${i}">✏️ Edit</button>
          <button class="del-btn" data-index="${i}">🗑</button>
        </td>
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
    if (editingIndex != null) {
      // Update existing product
      list[editingIndex] = product;
      saveProducts(list);
      refreshProductTable();
      setProdMsg(`✅ "${product.name}" update ho gaya.`, "#0b6b46");
      logActivity("✏️", 'Product "' + product.name + '" update kiya');
      editingIndex = null;
      saveBtn.textContent = "Save Product";
    } else {
      // Naya product add
      list.push(product);
      saveProducts(list);
      refreshProductTable();
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
      logActivity("➕", 'Naya product add kiya: "' + product.name + '" (' + formatPrice(product.price) + ")");
    }
    addForm.reset();
    document.getElementById("pRating").value = 5;
    document.getElementById("pReviews").value = 0;
    addPreview.hidden = true;
    addPreviewImg.removeAttribute("src");
  });
  // Delete + Edit product
  tableBody.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-btn");
    if (editBtn) {
      startEdit(+editBtn.dataset.index);
      return;
    }
    const btn = e.target.closest(".del-btn");
    if (!btn) return;
    const list = await getProducts();
    const removed = list.splice(+btn.dataset.index, 1)[0];
    saveProducts(list);
    refreshProductTable();
    setProdMsg("🗑 Product delete ho gaya.", "#b33232");
    if (editingIndex != null) {
      editingIndex = null;
      saveBtn.textContent = "Save Product";
    }
    logActivity("🗑", 'Product "' + (removed ? removed.name : "?") + '" delete kiya');
  });

  // Reset to defaults
  document.getElementById("resetProductsBtn").addEventListener("click", async () => {
    localStorage.removeItem("lakshyaim_products");
    editingIndex = null;
    saveBtn.textContent = "Save Product";
    refreshProductTable();
    setProdMsg("↩ Catalog default products pe reset ho gaya.", "#5f6d66");
    logActivity("↩", "Catalog default products pe reset kiya");
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
      (o) => {
        const stClass = o.status === "Delivered" ? "st-done" : o.status === "Shipped" ? "st-ship" : "st-pend";
        const detailId = "od-" + o.id.replace(/[^a-zA-Z0-9]/g, "");
        return `
      <tr class="order-row" data-oid="${o.id}">
        <td><b>${o.id}</b></td>
        <td>
          <div class="cust-cell"><b>${o.customer.name}</b><span class="row-sub">${o.date || ""} · ${o.customer.city || ""}</span></div>
        </td>
        <td>${o.items.length > 1 ? o.items[0].name + " +" + (o.items.length - 1) + " more" : o.items[0].name}</td>
        <td><b>${fmtN(o.total)}</b></td>
        <td><span class="pay-chip">${o.pay || "COD"}</span></td>
        <td>
          <select class="status-select ${stClass}" data-id="${o.id}" aria-label="Order status">
            <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Shipped" ${o.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered</option>
          </select>
        </td>
        <td class="cell-actions">
          <button class="view-order-btn" data-details="${detailId}" title="Poore details dekhein">👁</button>
          <button class="del-order-btn" data-id="${o.id}" title="Delete order">✕</button>
        </td>
      </tr>
      <tr class="order-details-row" id="${detailId}" style="display:none">
        <td colspan="7">
          <div class="order-detail-card">
            <div class="od-grid">
              <div>
                <p class="od-sec">👤 Customer</p>
                <p class="od-line"><b>${o.customer.name}</b></p>
                <p class="od-line">📞 ${o.customer.phone || "—"}</p>
                <p class="od-line">✉️ ${o.customer.email || "—"}</p>
              </div>
              <div>
                <p class="od-sec">📍 Delivery Address</p>
                <p class="od-line">${o.customer.address || "—"}</p>
                <p class="od-line">${o.customer.city || ""}${o.customer.state ? ", " + o.customer.state : ""}${o.customer.pin ? " - " + o.customer.pin : ""}</p>
              </div>
              <div>
                <p class="od-sec">💳 Order Info</p>
                <p class="od-line">Payment: <b>${o.pay || "COD"}</b></p>
                <p class="od-line">Date: ${o.date || "—"}</p>
                <p class="od-line">Status: ${o.status}</p>
              </div>
            </div>
            <p class="od-sec">📦 Items (${o.items.length})</p>
            <div class="od-items">
              ${o.items
                .map(
                  (i) => `
                <div class="od-item">
                  ${i.image ? '<img src="' + i.image + '" alt="" loading="lazy" />' : '<span class="od-emoji">' + (i.emoji || "📦") + "</span>"}
                  <span class="od-item-name">${i.name}</span>
                  <span class="od-item-qty">× ${i.qty}</span>
                  <span class="od-item-price">${fmtN(i.price * i.qty)}</span>
                </div>`
                )
                .join("")}
            </div>
            <div class="od-total">Order Total · <b>${fmtN(o.total)}</b></div>
          </div>
        </td>
      </tr>`;
      }
    )
    .join("");
  updateStats();
}

// Order details toggle — row ya 👁 button click par
function toggleOrderDetails(orderId) {
  const detailId = "od-" + orderId.replace(/[^a-zA-Z0-9]/g, "");
  const row = document.getElementById(detailId);
  if (!row) return;
  row.style.display = row.style.display === "none" ? "" : "none";
}

// Order delete
function deleteOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
  const next = orders.filter((x) => x.id !== orderId);
  localStorage.setItem("lakshyaim_orders", JSON.stringify(next));
  logActivity("🗑", `Order ${orderId} delete kiya`);
  renderRecentOrders();
}

const ordersTbody = document.getElementById("ordersTableBody");
ordersTbody.addEventListener("change", (e) => {
  const sel = e.target.closest(".status-select");
  if (!sel) return;
  setStatus(sel.dataset.id, sel.value);
  logActivity("🚚", `Order ${sel.dataset.id} ka status "${sel.value}" hua`);
});
ordersTbody.addEventListener("click", (e) => {
  // Delete order
  const del = e.target.closest(".del-order-btn");
  if (del) {
    if (confirm("Order " + del.dataset.id + " delete karna hai?")) deleteOrder(del.dataset.id);
    return;
  }
  // Status select ke click par details toggle nahi hota
  if (e.target.closest("select")) return;
  // Row ya 👁 button click → poore details toggle karo
  const row = e.target.closest(".order-row");
  if (row) toggleOrderDetails(row.dataset.oid);
});

// ===== Members (homepage join form se) =====
function renderMembers() {
  const tbody = document.getElementById("membersTableBody");
  if (!tbody) return;
  let members = [];
  try {
    members = JSON.parse(localStorage.getItem("lakshyaim_members")) || [];
  } catch {
    members = [];
  }
  tbody.innerHTML = members.length
    ? members
        .slice()
        .reverse()
        .map(
          (m) => `
      <tr>
        <td>${m.email}</td>
        <td>${m.date || ""}</td>
      </tr>`
        )
        .join("")
    : '<tr><td colspan="2" style="color:var(--muted)">Abhi koi member nahi — homepage join form se log join karte hi yahan aayenge.</td></tr>';
}

// ===== Activity log (audit) =====
function logActivity(icon, text) {
  let log = [];
  try {
    log = JSON.parse(localStorage.getItem("lakshyaim_activity")) || [];
  } catch {
    log = [];
  }
  log.unshift({
    icon,
    text,
    time: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
  });
  localStorage.setItem("lakshyaim_activity", JSON.stringify(log.slice(0, 40)));
  renderActivity();
}

function renderActivity() {
  const list = document.getElementById("activityList");
  if (!list) return;
  let log = [];
  try {
    log = JSON.parse(localStorage.getItem("lakshyaim_activity")) || [];
  } catch {
    log = [];
  }
  list.innerHTML = log.length
    ? log
        .map(
          (a) => `
      <li class="activity-item">
        <span class="act-ico">${a.icon}</span>
        <span class="act-text">${a.text}</span>
        <span class="act-time">${a.time}</span>
      </li>`
        )
        .join("")
    : '<li class="activity-item" style="color:var(--muted)">Koi activity nahi — admin actions yahan record hote hain.</li>';
}

// ===== Settings =====
function getSettings() {
  try {
    return JSON.parse(localStorage.getItem("lakshyaim_settings")) || {};
  } catch {
    return {};
  }
}

function renderSettings() {
  const s = getSettings();
  const fo = document.getElementById("setFreeOver");
  const sf = document.getElementById("setShipFee");
  const gstin = document.getElementById("setGstin");
  const gstRate = document.getElementById("setGstRate");
  if (fo) fo.value = s.freeShipOver != null ? s.freeShipOver : 2999;
  if (sf) sf.value = s.shipFee != null ? s.shipFee : 99;
  if (gstin) gstin.value = s.gstin || "";
  if (gstRate) gstRate.value = s.gstRate != null ? s.gstRate : 0;

  // Logo preview
  const preview = document.getElementById("logoPreview");
  if (preview) {
    if (s.logo) preview.innerHTML = '<img src="' + s.logo + '" alt="Logo" />';
    else preview.innerHTML = '<span class="logo-mark">L</span>';
  }
}

// Logo upload / remove
function compressImage(file, max) {
  max = max || 240;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png", 0.9));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById("logoFile")?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const dataUrl = await compressImage(file, 240);
    const s = getSettings();
    s.logo = dataUrl;
    localStorage.setItem("lakshyaim_settings", JSON.stringify(s));
    applyLogo();
    const preview = document.getElementById("logoPreview");
    if (preview) preview.innerHTML = '<img src="' + dataUrl + '" alt="Logo" />';
    logActivity("L", "Website logo upload kiya");
    const msg = document.getElementById("settingsMsg");
    if (msg) {
      msg.textContent = "Logo upload ho gaya - header aur sidebar me turant apply.";
      msg.style.color = "#0b6b46";
    }
  } catch {
    const msg = document.getElementById("settingsMsg");
    if (msg) {
      msg.textContent = "Logo upload fail - chhota image try karo.";
      msg.style.color = "#b33232";
    }
  }
  e.target.value = "";
});

document.getElementById("removeLogoBtn")?.addEventListener("click", () => {
  const s = getSettings();
  delete s.logo;
  localStorage.setItem("lakshyaim_settings", JSON.stringify(s));
  applyLogo();
  const preview = document.getElementById("logoPreview");
  if (preview) preview.innerHTML = '<span class="logo-mark">L</span>';
  logActivity("L", "Website logo remove kiya");
  const msg = document.getElementById("settingsMsg");
  if (msg) {
    msg.textContent = "Logo remove ho gaya - default L mark wapas.";
    msg.style.color = "#0b6b46";
  }
});

document.getElementById("settingsForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fo = Number(document.getElementById("setFreeOver").value);
  const sf = Number(document.getElementById("setShipFee").value);
  localStorage.setItem(
    "lakshyaim_settings",
    JSON.stringify({ freeShipOver: fo > 0 ? fo : 2999, shipFee: sf >= 0 ? sf : 99 })
  );
  logActivity("⚙️", "Store settings update ki (free shipping / fee)");
  const msg = document.getElementById("settingsMsg");
  if (msg) msg.textContent = "✅ Settings save ho gayi — cart/checkout par turant apply.";
});

// ===== CSV exports =====
function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((c) => '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"').join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById("exportOrdersBtn")?.addEventListener("click", () => {
  const orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
  const rows = [["Order ID", "Date", "Customer", "Phone", "Email", "City", "Payment", "Items", "Total", "Status"]];
  orders.forEach((o) =>
    rows.push([
      o.id, o.date, o.customer.name, o.customer.phone, o.customer.email,
      o.customer.city, o.pay,
      o.items.map((i) => i.name + " x" + i.qty).join(" | "),
      o.total, o.status,
    ])
  );
  downloadCSV("lakshyaim-orders.csv", rows);
  logActivity("⬇", "Orders CSV export ki (" + orders.length + " orders)");
});

document.getElementById("exportMembersBtn")?.addEventListener("click", () => {
  const members = JSON.parse(localStorage.getItem("lakshyaim_members") || "[]");
  downloadCSV("lakshyaim-members.csv", [["Email", "Joined"], ...members.map((m) => [m.email, m.date])]);
  logActivity("⬇", "Members CSV export ki (" + members.length + " members)");
});

document.getElementById("clearActivityBtn")?.addEventListener("click", () => {
  localStorage.removeItem("lakshyaim_activity");
  renderActivity();
});

// ===== Product edit flow =====
let editingIndex = null;
const saveBtn = addForm.querySelector('button[type="submit"]');

function startEdit(index) {
  getProducts().then((list) => {
    const p = list[index];
    if (!p) return;
    editingIndex = index;
    document.getElementById("pName").value = p.name;
    document.getElementById("pEmoji").value = p.emoji || "";
    const sel = document.getElementById("pImage");
    if (p.image) {
      let opt = [...sel.options].find((o) => o.value === p.image);
      if (!opt) {
        opt = document.createElement("option");
        opt.value = p.image;
        opt.textContent = "📷 " + p.image.split("/").pop();
        sel.appendChild(opt);
      }
      sel.value = p.image;
    } else {
      sel.value = "";
    }
    document.getElementById("pImgPos").value = p.imgPos || "";
    document.getElementById("pImgZoom").value = p.imgZoom || "";
    document.getElementById("pTag").value = p.tag;
    document.getElementById("pTagClass").value = p.tagClass || "tag-green";
    document.getElementById("pPrice").value = p.price;
    document.getElementById("pMrp").value = p.mrp || "";
    document.getElementById("pRating").value = p.rating;
    document.getElementById("pReviews").value = p.reviews || 0;
    saveBtn.textContent = "Update Product";
    updateAddPreview();
    document.getElementById("addProductPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    setProdMsg('✏️ "' + p.name + '" edit mode me hai — changes karke Update dabao.', "#5f6d66");
  });
}

// Order status change — dropdown se status update hota hai, stats turant refresh
function setStatus(orderId, status) {
  const orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
  const order = orders.find((x) => x.id === orderId);
  if (!order) return;
  order.status = status;
  localStorage.setItem("lakshyaim_orders", JSON.stringify(orders));
  renderRecentOrders();
}

// Status dropdown change — delegated listener (main handler upar hai)
renderRecentOrders();
renderMembers();
renderActivity();
renderSettings();

// ===== GST settings =====
document.getElementById("saveGstBtn")?.addEventListener("click", () => {
  const gstin = document.getElementById("setGstin").value.trim();
  const rate = Number(document.getElementById("setGstRate").value) || 0;
  const s = getSettings();
  s.gstin = gstin;
  s.gstRate = Math.min(28, Math.max(0, rate));
  localStorage.setItem("lakshyaim_settings", JSON.stringify(s));
  const msg = document.getElementById("gstMsg");
  msg.textContent = gstRate > 0
    ? "✅ GST save ho gaya — checkout par " + rate + "% (incl.) auto-calculate hoga."
    : "✅ GST save ho gaya (off).";
  msg.style.color = "#0b6b46";
  logActivity("🧮", "GST settings update ki (" + (rate || 0) + "%)");
});

// ============================================================
// Gallery Manager — photos hide/show/delete/upload
// ============================================================
const GM_LIMIT = 20;

async function renderGalleryManager() {
  const grid = document.getElementById("gmGrid");
  if (!grid) return;
  const gl = await getGalleryList();
  const countEl = document.getElementById("gmCount");
  if (countEl) countEl.textContent = gl.visible.length + " / " + gl.all.length + " visible";
  grid.innerHTML = gl.all
    .map((src, i) => {
      const hidden = gl.hidden.includes(src);
      const isExtra = gl.extra.includes(src);
      return `
      <div class="gm-card ${hidden ? "gm-hidden" : ""}">
        <img src="${src}" loading="lazy" alt="Gallery photo ${i + 1}" />
        <div class="gm-badge">${hidden ? "🚫 Hidden" : "👁 Visible"}</div>
        <div class="gm-actions">
          <button class="gm-btn" data-gm="toggle" data-src="${src}">${hidden ? "Show" : "Hide"}</button>
          ${isExtra ? '<button class="gm-btn gm-del" data-gm="del" data-src="' + src + '">🗑</button>' : ""}
        </div>
      </div>`;
    })
    .join("");
}

document.getElementById("gmGrid")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-gm]");
  if (!btn) return;
  const cfg = getGalleryConfig();
  const src = btn.dataset.src;
  if (btn.dataset.gm === "toggle") {
    cfg.hidden = cfg.hidden.includes(src) ? cfg.hidden.filter((s) => s !== src) : [...cfg.hidden, src];
    saveGalleryConfig(cfg);
    logActivity("🖼", "Gallery photo " + (cfg.hidden.includes(src) ? "hide" : "show") + " kiya");
    renderGalleryManager();
  } else if (btn.dataset.gm === "del") {
    cfg.extra = cfg.extra.filter((s) => s !== src);
    saveGalleryConfig(cfg);
    logActivity("🗑", "Uploaded gallery photo delete ki");
    renderGalleryManager();
  }
});

document.getElementById("galleryUpload")?.addEventListener("change", async (e) => {
  const files = [...e.target.files];
  if (!files.length) return;
  const cfg = getGalleryConfig();
  cfg.extra = Array.isArray(cfg.extra) ? cfg.extra : [];
  let added = 0;
  for (const file of files) {
    if (cfg.extra.length >= GM_LIMIT) break;
    try {
      const dataUrl = await compressImage(file);
      cfg.extra.push(dataUrl);
      added++;
    } catch {}
  }
  saveGalleryConfig(cfg);
  logActivity("🖼", added + " gallery photos upload kiye");
  renderGalleryManager();
  e.target.value = "";
});

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// Analytics — 12 KPIs + charts
// ============================================================
const ANALYTICS_COLORS = ["kpi-green", "kpi-blue", "kpi-amber", "kpi-violet", "kpi-teal", "kpi-rose"];

async function renderAnalytics() {
  const fmtRupee = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
  const orders = JSON.parse(localStorage.getItem("lakshyaim_orders") || "[]");
  const products = await getProducts();
  const members = JSON.parse(localStorage.getItem("lakshyaim_members") || "[]");
  const activity = JSON.parse(localStorage.getItem("lakshyaim_activity") || "[]");
  const cartItems = JSON.parse(localStorage.getItem("lakshyaim_cart") || "[]").reduce(
    (n, i) => n + (Number(i.qty) || 0),
    0
  );
  const gallery = await getGalleryList();
  const settings = getSettings();
  const gstRate = Number(settings.gstRate) || 0;

  const revenue = orders.reduce((n, o) => n + Number(o.total || 0), 0);
  const aov = orders.length ? Math.round(revenue / orders.length) : 0;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const shipped = orders.filter((o) => o.status === "Shipped").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const gstCollected = gstRate
    ? orders.reduce((n, o) => n + Math.round(Number(o.total || 0) * gstRate / (100 + gstRate)), 0)
    : 0;

  const kpis = [
    { icon: "🧾", n: orders.length, l: "Total Orders", c: "kpi-green" },
    { icon: "💰", n: "₹" + revenue.toLocaleString("en-IN"), l: "Total Revenue", c: "kpi-violet" },
    { icon: "📊", n: "₹" + aov.toLocaleString("en-IN"), l: "Avg Order Value", c: "kpi-blue" },
    { icon: "⏳", n: pending, l: "Pending Orders", c: "kpi-amber" },
    { icon: "🚚", n: shipped, l: "Shipped", c: "kpi-teal" },
    { icon: "✅", n: delivered, l: "Delivered", c: "kpi-green" },
    { icon: "👥", n: members.length, l: "Members", c: "kpi-amber" },
    { icon: "📦", n: products.length, l: "Products Live", c: "kpi-blue" },
    { icon: "🖼", n: gallery.visible.length, l: "Gallery Photos", c: "kpi-violet" },
    { icon: "🛒", n: cartItems, l: "In Active Carts", c: "kpi-rose" },
    { icon: "🕒", n: activity.length, l: "Log Events", c: "kpi-teal" },
    { icon: "🧮", n: "₹" + gstCollected.toLocaleString("en-IN"), l: "GST Collected" + (gstRate ? " (" + gstRate + "%)" : ""), c: "kpi-rose" },
  ];

  const kpiHost = document.getElementById("analyticsKpis");
  if (kpiHost) {
    kpiHost.innerHTML = kpis
      .map(
        (k) =>
          '<div class="dash-card kpi ' + k.c + '"><span class="dash-ico">' + k.icon + '</span><p class="dash-num">' + k.n + '</p><p class="dash-label">' + k.l + "</p></div>"
      )
      .join("");
  }

  // Chart 1 — Revenue last 8 orders
  const revEl = document.getElementById("chartRevenue");
  if (revEl) {
    const last = orders.slice(-8);
    const max = Math.max(1, ...last.map((o) => Number(o.total || 0)));
    revEl.innerHTML = last.length
      ? '<div class="chart-bar-row">' +
        last
          .map(
            (o) =>
              '<div class="chart-bar-col"><div class="chart-bar" style="height:' +
              Math.max(8, (Number(o.total || 0) / max) * 130) + 'px"><span class="chart-bar-val">' +
              fmtAnalytics(o.total) +
              "</span></div><span class=\"chart-bar-label\">" +
              o.id.replace("#LA-", "") +
              "</span></div>"
          )
          .join("") +
        "</div>"
      : '<p class="chart-empty">Koi order nahi — checkout se test order karo, chart yahan banega.</p>';
  }

  // Chart 2 — Status donut
  const donut = document.getElementById("donutStatus");
  if (donut) {
    const total = orders.length || 0;
    const segs = [
      { n: pending, color: "#f59e0b", l: "Pending" },
      { n: shipped, color: "#3b82c4", l: "Shipped" },
      { n: delivered, color: "#12a96e", l: "Delivered" },
    ].filter((s) => s.n > 0);
    const sum = segs.reduce((n, s) => n + s.n, 0);
    if (total > 0 && sum) {
      let acc = 0;
      const parts = segs
        .map((s) => {
          const start = (acc / sum) * 360;
          acc += s.n;
          const end = (acc / sum) * 360;
          return s.color + " " + start + "deg " + end + "deg";
        })
        .join(", ");
      donut.style.background = "conic-gradient(" + parts + ")";
    } else {
      donut.style.background = "rgba(255,255,255,0.08)";
    }
    const totalEl = document.getElementById("donutTotal");
    if (totalEl) totalEl.textContent = total;
    const legend = document.getElementById("statusLegend");
    if (legend) {
      legend.innerHTML = segs.length
        ? segs
            .map((s) => '<div class="legend-item"><span class="legend-dot" style="background:' + s.color + '"></span>' + s.l + " — <b>" + s.n + "</b></div>")
            .join("")
        : '<div class="legend-item" style="color:var(--muted)">No orders yet</div>';
    }
  }

  // Chart 3 — Payment split
  const payEl = document.getElementById("chartPay");
  if (payEl) {
    const pays = {};
    orders.forEach((o) => {
      const k = o.pay || "COD";
      pays[k] = (pays[k] || 0) + 1;
    });
    const keys = Object.keys(pays);
    const colors = { COD: "#12a96e", UPI: "#3b82c4", Card: "#f59e0b", Razorpay: "#9d6bff" };
    payEl.innerHTML = keys.length
      ? keys
          .map((k) => {
            const pct = Math.round((pays[k] / orders.length) * 100);
            return (
              '<div class="hbar"><span class="hbar-label">' + k + '</span>' +
              '<span class="hbar-track"><span class="hbar-fill" style="width:' + pct + '%;background:' + (colors[k] || "#9d6bff") + '"></span></span>' +
              '<span class="hbar-val">' + pays[k] + " (" + pct + "%)</span></div>"
            );
          })
          .join("")
      : '<p class="chart-empty">No orders yet.</p>';
  }

  // Chart 4 — Top products
  const topEl = document.getElementById("chartTop");
  if (topEl) {
    const counts = {};
    orders.forEach((o) => o.items.forEach((i) => (counts[i.name] = (counts[i.name] || 0) + i.qty)));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxC = Math.max(1, ...top.map((t) => t[1]));
    topEl.innerHTML = top.length
      ? top
          .map(
            (t) =>
              '<div class="hbar"><span class="hbar-label">' + t[0].slice(0, 18) + '</span>' +
              '<span class="hbar-track"><span class="hbar-fill" style="width:' + Math.round((t[1] / maxC) * 100) + '%;background:linear-gradient(90deg,#f59e0b,#d97706)"></span></span>' +
              '<span class="hbar-val">' + t[1] + "</span></div>"
          )
          .join("")
      : '<p class="chart-empty">No order items yet.</p>';
  }

  // Chart 5 — Revenue trend line (SVG, order by order)
  const trendEl = document.getElementById("chartTrend");
  if (trendEl) {
    const pts = orders.slice(-12).map((o) => ({ id: o.id.replace("#LA-", ""), v: Number(o.total) || 0 }));
    if (pts.length >= 2) {
      const w = 640, h = 220, padL = 52, padR = 18, padT = 20, padB = 34;
      const max = Math.max(...pts.map((p) => p.v), 1);
      const iw = w - padL - padR, ih = h - padT - padB;
      const xs = (i) => padL + (i * iw) / (pts.length - 1);
      const ys = (v) => padT + ih - (v / max) * ih;
      const line = pts.map((p, i) => (i ? "L" : "M") + xs(i).toFixed(1) + " " + ys(p.v).toFixed(1)).join(" ");
      const area = line + " L" + xs(pts.length - 1).toFixed(1) + " " + (padT + ih) + " L" + xs(0).toFixed(1) + " " + (padT + ih) + " Z";
      let grid = "";
      for (let g = 0; g <= 4; g++) {
        const y = padT + (ih / 4) * g;
        const val = Math.round(max - (max / 4) * g);
        grid +=
          '<line x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" stroke="#e6ebf1" stroke-width="1"/>' +
          '<text x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end" font-size="10" fill="#8a97a5">₹' + fmtAnalytics(val) + "</text>";
      }
      const dots = pts
        .map((p, i) => '<circle cx="' + xs(i).toFixed(1) + '" cy="' + ys(p.v).toFixed(1) + '" r="4.5" fill="#0d9b64" stroke="#fff" stroke-width="2"/>')
        .join("");
      const labels = pts
        .map((p, i) => '<text x="' + xs(i).toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" font-size="10" fill="#8a97a5">' + p.id + "</text>")
        .join("");
      trendEl.innerHTML =
        '<svg viewBox="0 0 ' + w + " " + h + '" style="width:100%;height:auto;display:block">' +
        '<defs><linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="rgba(13,155,100,0.35)"/><stop offset="100%" stop-color="rgba(13,155,100,0.02)"/>' +
        "</linearGradient></defs>" +
        grid +
        '<path d="' + area + '" fill="url(#trendGrad)"/>' +
        '<path d="' + line + '" fill="none" stroke="#0d9b64" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
        dots +
        labels +
        "</svg>";
    } else {
      trendEl.innerHTML = '<p class="chart-empty">Trend chart ke liye kam se kam 2 orders chahiye.</p>';
    }
  }

  // Chart 6 — Catalog by category
  const catEl = document.getElementById("chartCategory");
  if (catEl) {
    const cats = {};
    products.forEach((p) => {
      const k = p.tag || "Other";
      cats[k] = (cats[k] || 0) + 1;
    });
    const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    const maxCat = Math.max(1, ...entries.map((e) => e[1]));
    catEl.innerHTML = entries.length
      ? entries
          .map(
            (e) =>
              '<div class="hbar"><span class="hbar-label">' + e[0].slice(0, 18) + '</span>' +
              '<span class="hbar-track"><span class="hbar-fill" style="width:' + Math.round((e[1] / maxCat) * 100) + '%;background:linear-gradient(90deg,#12a96e,#077a4c)"></span></span>' +
              '<span class="hbar-val">' + e[1] + "</span></div>"
          )
          .join("")
      : '<p class="chart-empty">No products.</p>';
  }

  // Chart 7 — Members growth (join date ke hisaab se)
  const memEl = document.getElementById("chartMembers");
  if (memEl) {
    const byDate = {};
    members.forEach((m) => {
      const d = (m.date || "").split(",")[0];
      if (d) byDate[d] = (byDate[d] || 0) + 1;
    });
    const dates = Object.keys(byDate);
    const maxM = Math.max(1, ...Object.values(byDate));
    memEl.innerHTML = dates.length
      ? dates
          .map(
            (d) =>
              '<div class="hbar"><span class="hbar-label">' + d + '</span>' +
              '<span class="hbar-track"><span class="hbar-fill" style="width:' + Math.round((byDate[d] / maxM) * 100) + '%;background:linear-gradient(90deg,#f59e0b,#d97706)"></span></span>' +
              '<span class="hbar-val">' + byDate[d] + "</span></div>"
          )
          .join("")
      : '<p class="chart-empty">No members yet.</p>';
  }

  // GST report — per-order breakdown
  const gstNote = document.getElementById("gstReportNote");
  const gstTable = document.getElementById("gstTable");
  const gstBody = document.getElementById("gstTableBody");
  if (gstNote && gstTable && gstBody) {
    const rate = Number(settings.gstRate) || 0;
    const gstin = settings.gstin || "";
    if (rate > 0) {
      gstNote.textContent =
        "GST " + rate + "% (inclusive)" + (gstin ? " · GSTIN: " + gstin : "") + " — har order me included GST amount:";
      document.getElementById("gstRateLabel").textContent = rate;
      gstTable.style.display = "";
      const rows = orders.map((o) => {
        const t = Number(o.total) || 0;
        return { id: o.id, name: o.customer.name, total: t, gst: Math.round((t * rate) / (100 + rate)) };
      });
      const totalGst = rows.reduce((n, r) => n + r.gst, 0);
      gstBody.innerHTML =
        rows
          .map(
            (r) =>
              "<tr><td><b>" + r.id + "</b></td><td>" + r.name + "</td><td>" + fmtRupee(r.total) + "</td><td><b>" + fmtRupee(r.gst) + "</b></td></tr>"
          )
          .join("") +
        '<tr><td colspan="2" style="text-align:right;font-weight:800">Total GST</td><td></td><td style="font-weight:800">' +
        fmtRupee(totalGst) +
        "</td></tr>";
    } else {
      gstNote.textContent = "GST off hai — Settings me GST rate set karo, phir yahan per-order GST report banega.";
      gstTable.style.display = "none";
    }
  }
}

function fmtAnalytics(n) {
  const v = Number(n) || 0;
  return v >= 1000 ? "₹" + (v / 1000).toFixed(1) + "k" : "₹" + v;
}

// ============================================================
// CMS — Site Content Editor (header/hero/why/testimonials/plans/footer)
// ============================================================
const CMS_SCHEMA = [
  {
    key: "topbar", icon: "🔔", label: "Header / Topbar",
    fields: [
      { p: "topbar.t1", t: "text", l: "Left text" },
      { p: "topbar.t2", t: "text", l: "Right text" },
    ],
  },
  {
    key: "hero", icon: "🚀", label: "Hero Section",
    fields: [
      { p: "hero.badge", t: "text", l: "Badge text" },
      { p: "hero.l1", t: "text", l: "Title — white part" },
      { p: "hero.accent", t: "text", l: "Title — green accent word" },
      { p: "hero.l2", t: "text", l: "Title — baaki (line break ke liye <br> use karo)", html: true },
      { p: "hero.sub", t: "textarea", l: "Subtitle" },
      { p: "hero.cta1", t: "text", l: "Primary button text" },
      { p: "hero.cta2", t: "text", l: "Secondary button text" },
      { p: "hero.cardTitle", t: "text", l: "Product card — title" },
      { p: "hero.cardSub", t: "text", l: "Product card — subtitle" },
    ],
    items: [{ arr: "hero.stats", label: "Stat", fields: [{ p: "n", t: "text", l: "Number" }, { p: "l", t: "text", l: "Label" }] }],
  },
  {
    key: "why", icon: "💎", label: "Why Choose Us",
    fields: [
      { p: "why.title", t: "text", l: "Section title" },
      { p: "why.sub", t: "textarea", l: "Section subtitle" },
    ],
    items: [{
      arr: "why.cards", label: "Card",
      fields: [
        { p: "icon", t: "text", l: "Icon (emoji)" },
        { p: "t", t: "text", l: "Title" },
        { p: "d", t: "textarea", l: "Description" },
      ],
    }],
  },
  {
    key: "testi", icon: "💬", label: "Testimonials",
    fields: [{ p: "testi.meta", t: "text", l: "Rating summary line" }],
    items: [{
      arr: "testi.items", label: "Review",
      fields: [
        { p: "name", t: "text", l: "Name" },
        { p: "role", t: "text", l: "Role / plan" },
        { p: "stars", t: "number", l: "Stars (1–5)" },
        { p: "text", t: "textarea", l: "Review text" },
        { p: "chip", t: "text", l: "Result chip" },
      ],
    }],
  },
  {
    key: "plans", icon: "🎯", label: "Choose Your Journey (Plans)",
    fields: [{ p: "plans.note", t: "text", l: "Bottom note" }],
    items: [{
      arr: "plans.items", label: "Plan",
      fields: [
        { p: "goal", t: "text", l: "Goal chip" },
        { p: "name", t: "text", l: "Plan name" },
        { p: "price", t: "number", l: "Price (₹)" },
        { p: "featured", t: "checkbox", l: "Featured (dark card)" },
        { p: "features.0", t: "text", l: "Feature 1" },
        { p: "features.1", t: "text", l: "Feature 2" },
        { p: "features.2", t: "text", l: "Feature 3" },
        { p: "features.3", t: "text", l: "Feature 4" },
      ],
    }],
  },
  {
    key: "footer", icon: "🦶", label: "Footer",
    fields: [
      { p: "footer.about", t: "textarea", l: "About text" },
      { p: "footer.credit", t: "textarea", l: "Credit line (HTML allowed — <b> use karo)", html: true },
      { p: "footer.copyright", t: "text", l: "Copyright line" },
    ],
  },
];

const cmsHost = document.getElementById("cmsEditor");
const cmsMsg = document.getElementById("cmsMsg");

function cmsFieldHTML(f, value) {
  const pathAttr = 'data-cms-path="' + f.p + '"' + (f.html ? ' data-cms-htmlfield="1"' : "");
  if (f.t === "textarea") {
    return '<label class="cms-field cms-wide"><span>' + f.l + '</span><textarea data-cms-path="' + f.p + '" rows="3">' + (value || "") + "</textarea></label>";
  }
  if (f.t === "number") {
    return '<label class="cms-field"><span>' + f.l + '</span><input type="number" data-cms-path="' + f.p + '" value="' + (value != null ? value : "") + '" /></label>';
  }
  if (f.t === "checkbox") {
    return '<label class="cms-check"><input type="checkbox" data-cms-path="' + f.p + '"' + (value ? " checked" : "") + " /> " + f.l + "</label>";
  }
  return '<label class="cms-field"><span>' + f.l + '</span><input type="text" ' + pathAttr + ' value="' + String(value == null ? "" : value).replace(/"/g, "&quot;") + '" /></label>';
}

function buildCmsEditor() {
  if (!cmsHost) return;
  const c = getSiteContent();
  cmsHost.innerHTML = CMS_SCHEMA.map(
    (g) => `
    <details class="cms-group">
      <summary>${g.icon} ${g.label}</summary>
      <div class="cms-fields">
        ${(g.fields || [])
          .map((f) => cmsFieldHTML(f, getPath(c, f.p)))
          .join("")}
        ${(g.items || [])
          .map((itemDef) =>
            getPath(c, itemDef.arr)
              .map(
                (item, idx) => `
          <div class="cms-item">
            <p class="cms-item-title">${itemDef.label} ${idx + 1}</p>
            <div class="cms-fields">
              ${itemDef.fields
                .map((f) => cmsFieldHTML(f, getPath(item, f.p)))
                .join("")
                .replace(/data-cms-path="/g, 'data-cms-path="' + itemDef.arr + "." + idx + ".")}
            </div>
          </div>`
              )
              .join("")
          ).join("")}
      </div>
    </details>`
  ).join("");
}
buildCmsEditor();

// Save — saare inputs collect karke content me daalo
document.getElementById("saveContentBtn")?.addEventListener("click", () => {
  const c = getSiteContent();
  let savedCount = 0;
  cmsHost.querySelectorAll("[data-cms-path]").forEach((input) => {
    const path = input.dataset.cmsPath;
    let val;
    if (input.type === "checkbox") val = input.checked;
    else if (input.type === "number") val = Number(input.value) || 0;
    else val = input.value;
    const old = getPath(c, path);
    if (String(old) !== String(val)) savedCount++;
    setPath(c, path, val);
  });
  saveSiteContent(c);
  applySiteContent();
  cmsMsg.textContent = "✅ Content save ho gaya (" + savedCount + " fields change hue) — homepage par live hai!";
  cmsMsg.style.color = "#0b6b46";
  logActivity("🎨", "Site content update kiya (" + savedCount + " fields)");
});

document.getElementById("exportContentBtn")?.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(getSiteContent(), null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "site-content.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("importContentFile")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      saveSiteContent(data);
      buildCmsEditor();
      cmsMsg.textContent = "⬆ Content import ho gaya — Save dabao ya seedha site dekho.";
      cmsMsg.style.color = "#0b6b46";
      logActivity("⬆", "Site content JSON import kiya");
    } catch {
      cmsMsg.textContent = "❌ File galat hai — valid JSON export hi import karo.";
      cmsMsg.style.color = "#b33232";
    }
  };
  reader.readAsText(file);
});

// ===== Payment settings =====
function loadPaymentSettings() {
  const p = getSiteContent().payment;
  const rzp = document.getElementById("payRzp");
  const rzpKey = document.getElementById("payRzpKey");
  const note = document.getElementById("payNote");
  if (rzp) rzp.checked = p.razorpay !== false;
  if (rzpKey) rzpKey.value = p.razorpayKey || "";
  if (note) note.value = p.note || "";
}
loadPaymentSettings();

document.getElementById("savePaymentBtn")?.addEventListener("click", () => {
  const c = getSiteContent();
  c.payment.razorpay = document.getElementById("payRzp").checked;
  c.payment.razorpayKey = document.getElementById("payRzpKey").value.trim();
  c.payment.note = document.getElementById("payNote").value.trim();
  if (!c.payment.razorpay) {
    const pm = document.getElementById("payMsg");
    pm.textContent = "❌ Kam se kam ek payment method on rakho.";
    pm.style.color = "#b33232";
    return;
  }
  saveSiteContent(c);
  logActivity("💳", "Payment settings update ki (Razorpay)");
  const pm = document.getElementById("payMsg");
  pm.textContent = "✅ Payment settings save ho gayi — checkout par live.";
  pm.style.color = "#0b6b46";
});

// ===== Social media settings =====
function loadSocialSettings() {
  const c = getSiteContent();
  const social = (c.footer && c.footer.social) || {};
  const ig = document.getElementById("socialInstagramUrl");
  const fb = document.getElementById("socialFacebookUrl");
  const yt = document.getElementById("socialYoutubeUrl");
  const wa = document.getElementById("socialWhatsappUrl");
  const tw = document.getElementById("socialTwitterUrl");
  if (ig) ig.value = social.instagram || "";
  if (fb) fb.value = social.facebook || "";
  if (yt) yt.value = social.youtube || "";
  if (wa) wa.value = social.whatsapp || "";
  if (tw) tw.value = social.twitter || "";
}
loadSocialSettings();

document.getElementById("saveSocialBtn")?.addEventListener("click", () => {
  const c = getSiteContent();
  if (!c.footer) c.footer = {};
  if (!c.footer.social) c.footer.social = {};
  c.footer.social.instagram = document.getElementById("socialInstagramUrl").value.trim() || "#";
  c.footer.social.facebook = document.getElementById("socialFacebookUrl").value.trim() || "#";
  c.footer.social.youtube = document.getElementById("socialYoutubeUrl").value.trim() || "#";
  c.footer.social.whatsapp = document.getElementById("socialWhatsappUrl").value.trim() || "#";
  c.footer.social.twitter = document.getElementById("socialTwitterUrl").value.trim() || "#";
  saveSiteContent(c);
  logActivity("S", "Social media links update kiye");
  const msg = document.getElementById("socialMsg");
  if (msg) {
    msg.textContent = "Social links save ho gaye - footer par live.";
    msg.style.color = "#0b6b46";
  }
});

// ===== Admin credentials update =====
document.getElementById("saveAdminCredsBtn")?.addEventListener("click", () => {
  const newUser = document.getElementById("adminNewUser").value.trim();
  const newPass = document.getElementById("adminNewPass").value.trim();
  const confirmPass = document.getElementById("adminConfirmPass").value.trim();
  const msg = document.getElementById("adminCredsMsg");

  if (!newUser || !newPass) {
    msg.textContent = "Username aur password dono bhariye.";
    msg.style.color = "#b33232";
    return;
  }
  if (newPass !== confirmPass) {
    msg.textContent = "Password aur confirm password match nahi kar rahe.";
    msg.style.color = "#b33232";
    return;
  }
  if (newPass.length < 4) {
    msg.textContent = "Password kam se kam 4 characters ka ho.";
    msg.style.color = "#b33232";
    return;
  }

  const creds = { username: newUser, password: newPass };
  localStorage.setItem("lakshyaim_admin_creds", JSON.stringify(creds));
  logActivity("A", "Admin credentials update kiye");
  msg.textContent = "Credentials update ho gaye - naye credentials se login karo.";
  msg.style.color = "#0b6b46";

  // Clear fields
  document.getElementById("adminNewUser").value = "";
  document.getElementById("adminNewPass").value = "";
  document.getElementById("adminConfirmPass").value = "";
});

// ===== Database view — localStorage overview =====
const DB_COLLECTIONS = [
  { key: "lakshyaim_orders", label: "Orders", icon: "🧾" },
  { key: "lakshyaim_products", label: "Products", icon: "📦" },
  { key: "lakshyaim_members", label: "Members", icon: "👥" },
  { key: "lakshyaim_activity", label: "Activity Log", icon: "🕒" },
  { key: "lakshyaim_content", label: "Site Content", icon: "🎨" },
  { key: "lakshyaim_cart", label: "Active Cart", icon: "🛒" },
  { key: "lakshyaim_settings", label: "Settings", icon: "⚙️" },
];

function dbRead(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function renderDatabase() {
  const kpis = document.getElementById("dbKpis");
  const tbody = document.getElementById("dbTableBody");
  if (!tbody) return;

  const orders = dbRead("lakshyaim_orders") || [];
  const products = dbRead("lakshyaim_products") || [];
  const members = dbRead("lakshyaim_members") || [];
  const revenue = orders.reduce((n, o) => n + Number(o.total || 0), 0);

  if (kpis) {
    kpis.innerHTML = [
      { ico: "🧾", n: orders.length, l: "Orders", c: "kpi-green" },
      { ico: "📦", n: products.length, l: "Products", c: "kpi-blue" },
      { ico: "👥", n: members.length, l: "Members", c: "kpi-amber" },
      { ico: "💰", n: "₹" + revenue.toLocaleString("en-IN"), l: "Revenue", c: "kpi-violet" },
    ]
      .map(
        (k) =>
          '<div class="dash-card kpi ' + k.c + '"><span class="dash-ico">' + k.ico + '</span><p class="dash-num">' + k.n + '</p><p class="dash-label">' + k.l + "</p></div>"
      )
      .join("");
  }

  tbody.innerHTML = DB_COLLECTIONS.map((col) => {
    const data = dbRead(col.key);
    let count = data == null ? 0 : Array.isArray(data) ? data.length : Object.keys(data).length;
    let size = "0 B";
    try {
      const raw = localStorage.getItem(col.key) || "";
      const bytes = new Blob([raw]).size;
      size = bytes > 1024 ? (bytes / 1024).toFixed(1) + " KB" : bytes + " B";
    } catch {}
    return (
      "<tr><td><b>" + col.icon + " " + col.label + "</b><div class='row-sub'>" + col.key + "</div></td>" +
      "<td><b>" + count + "</b></td>" +
      "<td>" + size + "</td>" +
      "<td class='cell-actions'><button class='edit-btn' data-dbexport='" + col.key + "'>⬇ Export</button>" +
      "<button class='del-btn' data-dbclear='" + col.key + "'>Clear</button></td></tr>"
    );
  }).join("");
}

document.getElementById("dbTableBody")?.addEventListener("click", (e) => {
  const exp = e.target.closest("[data-dbexport]");
  const clr = e.target.closest("[data-dbclear]");
  if (exp) {
    const key = exp.dataset.dbexport;
    const data = dbRead(key);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = key + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }
  if (clr) {
    const key = clr.dataset.dbclear;
    if (confirm(key + " ka saara data delete karna hai? (Backup le lena — Export pehle)")) {
      localStorage.removeItem(key);
      renderDatabase();
      logActivity("🗄", key + " collection clear kiya");
    }
  }
});

document.getElementById("exportAllBtn")?.addEventListener("click", () => {
  const all = {};
  DB_COLLECTIONS.forEach((col) => {
    const d = dbRead(col.key);
    if (d != null) all[col.key] = d;
  });
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "lakshyaim-database-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
  logActivity("🗄", "Poora database backup export kiya");
});

// ===== Sidebar keyboard navigation (↑ ↓) =====
document.addEventListener("keydown", (e) => {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  const dash = document.getElementById("dashboard");
  if (!dash || dash.style.display === "none") return;
  const tag = document.activeElement.tagName;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
  const items = [...document.querySelectorAll(".ad-nav .ad-link")];
  const cur = items.indexOf(document.activeElement);
  e.preventDefault();
  if (cur === -1) {
    items[e.key === "ArrowDown" ? 0 : items.length - 1].focus();
  } else {
    const next = e.key === "ArrowDown" ? Math.min(items.length - 1, cur + 1) : Math.max(0, cur - 1);
    items[next].focus();
  }
});
