// Lakshyaim product store — shared between shop (index.html) and admin (admin.html)

let defaultProducts = null;

// product/products.json me se default catalog load karo
async function loadDefaultProducts() {
  if (defaultProducts) return defaultProducts;
  try {
    const res = await fetch("product/products.json");
    defaultProducts = await res.json();
  } catch {
    defaultProducts = [];
  }
  return defaultProducts;
}

async function getProducts() {
  const defaults = await loadDefaultProducts();
  try {
    const saved = JSON.parse(localStorage.getItem("lakshyaim_products"));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch {}
  // Reference leak na ho — hamesha copy return karo
  return JSON.parse(JSON.stringify(defaults));
}

function saveProducts(list) {
  localStorage.setItem("lakshyaim_products", JSON.stringify(list));
}

function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

// Shared HTML for one product card (used on shop + admin preview)

// Image crop control: imgPos = focus point ("30% 55%"), imgZoom = optional zoom (1.5 = 1.5x).
// Zoom ke waqt imgPos transform-origin ban jata hai — taki product wala hissa card me dikhe.
function productImgAttrs(p) {
  if (p.imgZoom) {
    return `style="transform:scale(${p.imgZoom});transform-origin:${p.imgPos || "50% 50%"}"`;
  }
  if (p.imgPos) return `style="object-position:${p.imgPos}"`;
  return "";
}

function productCardHTML(p) {
  const stars = "★".repeat(p.rating) + "☆".repeat(5 - p.rating);
  const mrp = p.mrp && p.mrp > p.price ? ` <s>${formatPrice(p.mrp)}</s>` : "";
  // Image ho to photo, warna emoji. Emoji peeche rehta hai — image load fail ho to wahi dikhega.
  const media = p.image
    ? `<img src="${p.image}" alt="${p.name}" loading="lazy" ${productImgAttrs(p)} onerror="this.remove()" />`
    : "";
  return `
    <div class="card">
      <div class="card-img" style="background:${p.bg}"><span>${p.emoji}</span>${media}</div>
      <p class="tag ${p.tagClass}">${p.tag}</p>
      <h3>${p.name}</h3>
      <p class="stars">${stars} <span>(${p.reviews})</span></p>
      <p class="price">${formatPrice(p.price)}${mrp}</p>
      <button class="btn btn-full">Add to Cart</button>
    </div>`;
}
