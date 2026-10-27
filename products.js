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
function productCardHTML(p) {
  const stars = "★".repeat(p.rating) + "☆".repeat(5 - p.rating);
  const mrp = p.mrp && p.mrp > p.price ? ` <s>${formatPrice(p.mrp)}</s>` : "";
  return `
    <div class="card">
      <div class="card-img" style="background:${p.bg}"><span>${p.emoji}</span></div>
      <p class="tag ${p.tagClass}">${p.tag}</p>
      <h3>${p.name}</h3>
      <p class="stars">${stars} <span>(${p.reviews})</span></p>
      <p class="price">${formatPrice(p.price)}${mrp}</p>
      <button class="btn btn-full">Add to Cart</button>
    </div>`;
}
