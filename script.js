// Mobile menu toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));

// Close mobile menu after clicking a link (dropdown toggle ko chhod kar — uska apna behavior hai)
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    if (a.id !== "dropToggle") navLinks.classList.remove("open");
  })
);

// Navbar shadow on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 8);
});

// Add-to-cart clicks — product cart store (cart.js) me add hota hai
// aur turant cart page par le jata hai
const cartBtn = document.querySelector(".icon-btn[aria-label='Cart']");
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".card .add-cart-btn");
  if (!btn) return;
  getProducts().then((list) => {
    const p = list[+btn.dataset.index];
    if (!p) return;
    addToCart(p);
    location.href = "cart.html";
  });
});

// Shop grid render (products.js ke saath) — homepage par max 5 products
const productGrid = document.getElementById("productGrid");
if (productGrid) {
  getProducts().then((list) => {
    productGrid.innerHTML = list.slice(0, 5).map((p, i) => productCardHTML(p, i)).join("");
    const countLine = document.getElementById("catalogCountLine");
    if (countLine) {
      countLine.textContent =
        "Catalog me " + list.length + " products live hain — admin panel se jitne bhi add karo, sab yahan drishti me aayenge.";
    }
  });
}

// ===== Gallery (gallery/manifest.json se saari images) =====
const galleryGrid = document.getElementById("galleryGrid");
let galleryImages = [];

async function initGallery() {
  if (!galleryGrid) return;
  try {
    const res = await fetch("gallery/manifest.json");
    galleryImages = await res.json();
  } catch {
    galleryImages = [];
  }
  if (!Array.isArray(galleryImages) || !galleryImages.length) {
    galleryGrid.innerHTML = '<p class="gallery-empty">Gallery abhi load nahi hui — thodi der baad refresh karein.</p>';
    return;
  }
  // Homepage par sirf pehli 6 photos — baaki gallery.html par
  galleryGrid.innerHTML = galleryImages
    .slice(0, 6)
    .map(
      (src, i) => `
    <figure class="gallery-item" data-index="${i}">
      <img src="${src}" alt="Lakshyaim photo ${i + 1}" loading="lazy" />
    </figure>`
    )
    .join("");
  const btn = document.getElementById("galleryViewBtn");
  if (btn) btn.textContent = `View Full Gallery (${galleryImages.length} photos) →`;
}

// ===== Lightbox =====
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCount = document.getElementById("lbCount");
let lbIndex = 0;

function showLightbox(i) {
  lbIndex = (i + galleryImages.length) % galleryImages.length;
  lbImg.src = galleryImages[lbIndex];
  lbCount.textContent = `${lbIndex + 1} / ${galleryImages.length}`;
}

function openLightbox(i) {
  showLightbox(i);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lbImg.src = "";
}

function stepLightbox(delta) {
  showLightbox(lbIndex + delta);
}

galleryGrid?.addEventListener("click", (e) => {
  const item = e.target.closest(".gallery-item");
  if (item) openLightbox(+item.dataset.index);
});
document.getElementById("lbClose")?.addEventListener("click", closeLightbox);
document.getElementById("lbPrev")?.addEventListener("click", () => stepLightbox(-1));
document.getElementById("lbNext")?.addEventListener("click", () => stepLightbox(1));
lightbox?.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox(); // background par click = band
});
document.addEventListener("keydown", (e) => {
  if (!lightbox?.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") stepLightbox(-1);
  else if (e.key === "ArrowRight") stepLightbox(1);
});

initGallery();

// ===== Why People Choose Us — auto-sliding carousel =====
(() => {
  const track = document.getElementById("whyTrack");
  const dotsEl = document.getElementById("whyDots");
  if (!track || !dotsEl) return;

  const slider = document.getElementById("whySlider");
  const slides = track.children;
  const AUTO_MS = 4200;
  let per = 3;
  let pos = 0;
  let timer = null;

  const GAP = 20;
  const perView = () => {
    if (window.innerWidth >= 1025) return 3;
    if (window.innerWidth >= 641) return 2;
    return 1;
  };
  const maxPos = () => Math.max(0, slides.length - per);
  const step = () => slides[0].getBoundingClientRect().width + GAP;

  function update() {
    track.style.transform = "translateX(" + -(pos * step()) + "px)";
    [...dotsEl.children].forEach((d, i) => d.classList.toggle("active", i === pos));
  }

  function go(delta) {
    pos = delta > 0 ? (pos >= maxPos() ? 0 : pos + 1) : (pos <= 0 ? maxPos() : pos - 1);
    update();
  }

  function buildDots() {
    dotsEl.innerHTML = "";
    for (let i = 0; i <= maxPos(); i++) {
      const b = document.createElement("button");
      b.className = "dot";
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", () => { pos = i; update(); restart(); });
      dotsEl.appendChild(b);
    }
    update();
  }

  function layout() {
    per = perView();
    pos = Math.min(pos, maxPos());
    buildDots();
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go(1), AUTO_MS);
  }

  document.getElementById("whyPrev").addEventListener("click", () => { go(-1); restart(); });
  document.getElementById("whyNext").addEventListener("click", () => { go(1); restart(); });

  // Hover par ruk jaata hai, bahar nikal te hi continue
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", () => restart());
  document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : restart()));

  // Touch swipe
  let startX = null;
  slider.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  slider.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) { go(dx < 0 ? 1 : -1); restart(); }
    startX = null;
  });

  layout();
  restart();
  window.addEventListener("resize", layout);
})();

// ===== FAQ accordion (smooth open/close) =====
const faqList = document.getElementById("faqList");
if (faqList) {
  faqList.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq-q");
    if (!btn) return;
    const item = btn.closest(".faq-item");
    const panel = item.querySelector(".faq-a");
    const isOpen = item.classList.contains("open");

    // Sirf ek FAQ khula rakhte hain
    faqList.querySelectorAll(".faq-item.open").forEach((other) => {
      if (other !== item) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = "0px";
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      }
    });

    item.classList.toggle("open", !isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
    panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : "0px";
  });
}

// ===== Header "Products" dropdown (catalog se dynamic) =====
const navDrop = document.getElementById("navDrop");
const dropToggle = document.getElementById("dropToggle");
const dropMenu = document.getElementById("dropMenu");

function closeDrop() {
  navDrop?.classList.remove("open");
  dropToggle?.setAttribute("aria-expanded", "false");
}

if (navDrop && dropToggle && dropMenu) {
  // Toggle: click par open/close
  dropToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const open = navDrop.classList.toggle("open");
    dropToggle.setAttribute("aria-expanded", String(open));
  });
  // Bahar click → dropdown band + pura menu panel band
  document.addEventListener("click", (e) => {
    if (e.target.closest("#navbar")) return;
    closeDrop();
    navLinks?.classList.remove("open");
  });
  // Escape → band
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeDrop();
      navLinks?.classList.remove("open");
    }
  });
  // Catalog se items bharo (products.js ka data)
  getProducts().then((list) => {
    dropMenu.innerHTML = `
      <a class="drop-item drop-all" href="#products" role="menuitem">🛍️ All Products</a>
      ${list
        .map(
          (p) => `
        <a class="drop-item" href="#products" role="menuitem">
          <span class="drop-thumb" style="background:${p.bg}">${p.image ? `<img src="${p.image}" alt="" loading="lazy" onerror="this.remove()" />` : p.emoji}</span>
          <span class="drop-name">${p.name}</span>
          <span class="drop-price">${formatPrice(p.price)}</span>
        </a>`
        )
        .join("")}
    `;
  });
  // Item click → dropdown + mobile menu dono band
  dropMenu.addEventListener("click", () => {
    closeDrop();
    navLinks.classList.remove("open");
  });
}

// Join form
const joinForm = document.getElementById("joinForm");
const formMsg = document.getElementById("formMsg");
joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  formMsg.textContent = `✅ Thanks! Member invite sent to ${email}`;
  formMsg.style.color = "#7ee6b0";
  joinForm.reset();
});
