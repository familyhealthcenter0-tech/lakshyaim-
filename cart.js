// ============================================================
// cart.js — shared cart store (localStorage)
// index / cart / checkout — teeno pages ye include karte hain.
// Cart items snapshot hote hain (name, price, image, qty) —
// catalog change hone par bhi purane cart items safe rehte hain.
// ============================================================

const LKEY_CART = "lakshyaim_cart";
const FREE_SHIP_OVER = 2999;
const SHIP_FEE = 99;
const MAX_QTY = 20;

function getCart() {
  try {
    const c = JSON.parse(localStorage.getItem(LKEY_CART));
    return Array.isArray(c) ? c : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(LKEY_CART, JSON.stringify(cart));
  syncCartBadge();
}

// Product object → cart entry (dedupe by name)
function addToCart(product, qty = 1) {
  const cart = getCart();
  const found = cart.find((i) => i.name === product.name);
  if (found) {
    found.qty = Math.min(MAX_QTY, found.qty + qty);
  } else {
    cart.push({
      name: product.name,
      emoji: product.emoji || "📦",
      image: product.image || "",
      imgPos: product.imgPos || "",
      imgZoom: product.imgZoom || 0,
      price: product.price || 0,
      mrp: product.mrp || 0,
      qty: Math.max(1, qty),
    });
  }
  saveCart(cart);
  return cartTotalItems();
}

function setQty(name, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.name === name);
  if (!item) return;
  item.qty = Math.max(0, Math.min(MAX_QTY, qty));
  const next = item.qty === 0 ? cart.filter((i) => i.name !== name) : cart;
  saveCart(next);
}

function removeFromCart(name) {
  saveCart(getCart().filter((i) => i.name !== name));
}

function clearCart() {
  localStorage.removeItem(LKEY_CART);
  syncCartBadge();
}

function cartTotalItems() {
  return getCart().reduce((n, i) => n + i.qty, 0);
}

function cartSubtotal() {
  return getCart().reduce((n, i) => n + i.price * i.qty, 0);
}

function shippingFee(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIP_OVER ? 0 : SHIP_FEE;
}

function cartGrandTotal() {
  const sub = cartSubtotal();
  return sub + shippingFee(sub);
}

// Har page par badge sync (index / cart / checkout / shop)
function syncCartBadge() {
  const el = document.querySelector(".cart-count");
  if (!el) return;
  const n = cartTotalItems();
  el.textContent = n;
  el.style.display = n > 0 ? "" : "none";
}
syncCartBadge();

// Cart-info image render — product card jaisa hi crop pattern
function cartThumbHTML(item, cssClass) {
  const styles = [];
  if (item.imgPos) styles.push(`object-position:${item.imgPos}`);
  if (item.imgZoom && item.imgZoom > 1) {
    styles.push(`transform:scale(${item.imgZoom})`);
    styles.push(`transform-origin:${item.imgPos || "50% 50%"}`);
  }
  const styleAttr = styles.length ? ` style="${styles.join(";")}"` : "";
  const img = item.image
    ? `<img src="${item.image}" alt="${item.name}" loading="lazy"${styleAttr} onerror="this.remove()" />`
    : "";
  const emojiHtml = item.image ? "" : `<span style="font-size:2.2rem">${item.emoji}</span>`;
  return `<span class="${cssClass}" style="background:#fef5ec">${emojiHtml}${img}</span>`;
}
