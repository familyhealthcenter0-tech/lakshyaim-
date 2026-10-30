// ============================================================
// site-content.js — site ka poora editable content (CMS store)
// Admin panel se edit hota hai (lakshyaim_content), aur yahan
// har page load par DOM me apply ho jata hai.
// Include order: products.js → cart.js → site-content.js → script.js
// ============================================================

const CONTENT_DEFAULTS = {
  topbar: {
    t1: "🌿 Free shipping on orders over ₹2,999",
    t2: "👤 Members save 25% every day",
  },
  hero: {
    badge: "Plant-based nutrition · FSSAI certified",
    l1: "Fuel Your ",
    accent: "Better",
    l2: ",<br>Every Single Day",
    sub: "Science-backed shakes, teas and supplements — formulated by nutritionists, delivered fresh to your door, and supported by real human coaching.",
    cta1: "Shop Products",
    cta2: "Get a Free Plan",
    stats: [
      { n: "90+", l: "countries" },
      { n: "40 yrs", l: "of nutrition science" },
      { n: "27k+", l: "pincodes delivered" },
    ],
    cardTitle: "Formula 1 Shake",
    cardSub: "18g protein · 25 vitamins · 0 added sugar",
  },
  why: {
    title: "Why People Choose Us",
    sub: "No shortcuts, no mystery blends — just clean, verified nutrition with real human support.",
    cards: [
      { icon: "🔬", t: "Lab-Verified Quality", d: "Every batch is third-party tested for purity and potency. FSSAI-certified manufacturing, full traceability." },
      { icon: "👩‍⚕️", t: "1-on-1 Expert Coaching", d: "Certified nutritionists build your plan, review progress weekly, and adjust until it works." },
      { icon: "🚚", t: "Fast, Free Delivery", d: "Pan-India shipping in 3–5 days. Free on every order above ₹2,999 — no hidden charges, ever." },
      { icon: "🛡️", t: "90-Day Guarantee", d: "Love the results or get your money back. A full season to judge us — that's how confident we are." },
      { icon: "🎁", t: "Members Save 25%", d: "Preferred pricing on every order, reward points, early access to new flavours and a free monthly check-in." },
      { icon: "💪", t: "Results at Every Level", d: "Weight balance se sports performance tak — 50,000+ members ke routines, results aur reviews aapke saath hain." },
    ],
  },
  testi: {
    meta: "⭐ 4.9 / 5 average from 50,000+ verified member reviews",
    items: [
      { name: "Riya S.", role: "Member · Weight Balance", stars: 5, text: "The shake keeps me full till lunch. I've dropped 6 kg in three months without ever feeling hungry or low on energy.", chip: "−6 kg in 3 months" },
      { name: "Arun K.", role: "Member · Daily Wellness", stars: 5, text: "Tea in the morning replaced my sugary colas completely. Steady energy through the whole workday — no 4 pm crash.", chip: "3 colas → 0 / day" },
      { name: "Meera P.", role: "Member · Sports Performance", stars: 4, text: "The sports kit plus weekly coaching calls got me to my first half marathon properly trained — and properly fueled.", chip: "First 21K finisher 🏅" },
      { name: "Vikas T.", role: "Member · Daily Wellness", stars: 5, text: "Protein Drink Mix after workouts changed everything. Recovery is faster and I finally have the energy to train on back-to-back days.", chip: "90 kg squat PB 🏋️" },
      { name: "Neha D.", role: "Member · Skin & Wellness", stars: 5, text: "The Omega 3 + Herbal Tea combo was my coach's suggestion. Within weeks my skin cleared up and my evening cravings dropped.", chip: "Glow-up in 6 weeks ✨" },
      { name: "Sameer R.", role: "Member · Weight Balance", stars: 5, text: "Meal planner plus 1-on-1 calls kept me honest for the first time in years. Down 12 kg and my sugar reports are normal now.", chip: "−12 kg total 🎉" },
    ],
  },
  plans: {
    note: "🛡️ Har kit 90-day money-back promise ke saath · 🚚 Free shipping ₹2,999 se upar · 📞 Free nutritionist intro-call",
    items: [
      { goal: "🎯 Weight Management", name: "Weight Balance", price: 5999, featured: false, features: ["2 × Formula 1 Shake", "Herbal Tea Concentrate", "Meal planner app", "Coach support"] },
      { goal: "⚡ Active Lifestyle", name: "Healthy Active", price: 8499, featured: true, features: ["Everything in Weight Balance", "Protein Drink Mix", "Multivitamin complex", "1-on-1 coaching calls"] },
      { goal: "🏆 Athletes & Training", name: "Sports Performance", price: 10999, featured: false, features: ["Protein + recovery bundle", "Hydration drink mix", "Workout guide PDF", "Nutritionist check-in"] },
    ],
  },
  footer: {
    about: "Lakshyaim Private Limited - balanced, science-backed nutrition for everyday life. Made in India, made for routines.",
    credit: "Designed & Developed with ❤️ by <b>Mukesh Sharma</b>",
    copyright: "© 2026 Lakshyaim Private Limited - All rights reserved.",
    social: {
      instagram: "#",
      facebook: "#",
      youtube: "#",
      whatsapp: "#",
      twitter: "#",
    },
  },
  payment: {
    razorpay: false,
    razorpayKey: "",
    note: "Secure payment via Razorpay",
  },
};

function getSiteContent() {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem("lakshyaim_content")) || {};
  } catch {
    saved = {};
  }
  // defaults ke saath deep-merge (naye fields bhi cover ho)
  const out = JSON.parse(JSON.stringify(CONTENT_DEFAULTS));
  Object.keys(saved).forEach((k) => {
    if (Array.isArray(out[k]) || typeof out[k] !== "object" || out[k] === null) {
      out[k] = saved[k];
    } else {
      Object.assign(out[k], saved[k]);
    }
  });
  // Migration: old credit text → Mukesh Sharma (auto-update)
  if (out.footer && out.footer.credit && (out.footer.credit.includes("Family Health Center") || out.footer.credit.includes("Sahin"))) {
    out.footer.credit = out.footer.credit.replace("Family Health Center", "Mukesh Sharma").replace("Sahin", "Mukesh Sharma");
    if (!saved.footer) saved.footer = {};
    saved.footer.credit = out.footer.credit;
    try {
      localStorage.setItem("lakshyaim_content", JSON.stringify(saved));
    } catch {}
  }
  return out;
}

function saveSiteContent(content) {
  localStorage.setItem("lakshyaim_content", JSON.stringify(content));
}

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setPath(obj, path, val) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
  target[last] = val;
}

// [data-cms] elements ko content se bharo (text), [data-cms-html] = HTML
function applyContentText() {
  const c = getSiteContent();
  document.querySelectorAll("[data-cms]").forEach((el) => {
    const v = getPath(c, el.dataset.cms);
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-cms-html]").forEach((el) => {
    const v = getPath(c, el.dataset.cmsHtml);
    if (v != null) el.innerHTML = v;
  });
}

// ===== List builders (index page ke sections) =====
function buildHeroStats() {
  const wrap = document.querySelector(".hero-stats");
  if (!wrap) return;
  const c = getSiteContent();
  wrap.innerHTML = c.hero.stats
    .map((s) => `<div><strong>${s.n}</strong><span>${s.l}</span></div>`)
    .join("");
}

function buildWhyCards() {
  const track = document.getElementById("whyTrack");
  if (!track) return;
  const c = getSiteContent();
  track.innerHTML = c.why.cards
    .map(
      (card, i) => `
    <div class="why-card">
      <span class="why-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="why-icon ${i === 0 ? "gold" : ""}">${card.icon}</span>
      <h3>${card.t}</h3>
      <p>${card.d}</p>
    </div>`
    )
    .join("");
}

function buildTestimonials() {
  const track = document.getElementById("ttTrack");
  if (!track) return;
  const c = getSiteContent();
  track.innerHTML = c.testi.items
    .map(
      (t) => `
    <figure class="testimonial">
      <span class="quote-mark">"</span>
      <p class="stars">${"★".repeat(t.stars)}${"☆".repeat(5 - t.stars)}</p>
      <blockquote>${t.text}</blockquote>
      <figcaption>
        <div class="avatar">${t.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
        <div class="testi-who">
          <strong>${t.name}</strong>
          <span>${t.role}</span>
        </div>
        <span class="result-chip">${t.chip}</span>
      </figcaption>
    </figure>`
    )
    .join("");
}

function buildPlans() {
  const grid = document.getElementById("plansGrid");
  if (!grid) return;
  const c = getSiteContent();
  grid.innerHTML = c.plans.items
    .map(
      (p) => `
    <div class="plan ${p.featured ? "plan-featured" : ""}">
      ${p.featured ? '<span class="plan-flag">⭐ Most Popular</span>' : ""}
      <span class="plan-goal">${p.goal}</span>
      <p class="plan-name">${p.name}</p>
      <p class="plan-price">₹${Number(p.price).toLocaleString("en-IN")}<small>/kit</small></p>
      <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      <a href="#membership" class="btn ${p.featured ? "" : "btn-outline"} plan-btn">Get Started</a>
    </div>`
    )
    .join("");
}

function applySocialLinks() {
  const c = getSiteContent();
  const social = (c.footer && c.footer.social) || {};
  const map = {
    socialInstagram: social.instagram,
    socialFacebook: social.facebook,
    socialYoutube: social.youtube,
    socialWhatsapp: social.whatsapp,
    socialTwitter: social.twitter,
  };
  Object.keys(map).forEach((id) => {
    const el = document.getElementById(id);
    if (el && map[id]) el.setAttribute("href", map[id]);
  });
}

function applySiteContent() {
  applyContentText();
  applySocialLinks();
  buildHeroStats();
  buildWhyCards();
  buildTestimonials();
  buildPlans();
}

// ===== Logo apply (admin Settings se upload hua logo) =====
function applyLogo() {
  let logo = "";
  try {
    logo = (JSON.parse(localStorage.getItem("lakshyaim_settings")) || {}).logo || "";
  } catch {
    logo = "";
  }
  document.querySelectorAll(".logo-mark").forEach((el) => {
    if (logo) {
      el.innerHTML = '<img src="' + logo + '" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:inherit;display:block;" />';
      el.style.background = "transparent";
      el.style.boxShadow = "none";
    } else {
      el.innerHTML = "L";
      el.style.background = "";
      el.style.boxShadow = "";
    }
  });
}
applyLogo();
window.addEventListener("storage", applyLogo);

// ===== Gallery config (admin Gallery Manager ke liye) =====
function getGalleryConfig() {
  try {
    return JSON.parse(localStorage.getItem("lakshyaim_gallery")) || { hidden: [], extra: [] };
  } catch {
    return { hidden: [], extra: [] };
  }
}

function saveGalleryConfig(cfg) {
  localStorage.setItem(
    "lakshyaim_gallery",
    JSON.stringify({ hidden: cfg.hidden || [], extra: cfg.extra || [] })
  );
}

// manifest + uploaded photos merge → hidden hata ke final list
async function getGalleryList() {
  let base = [];
  try {
    base = await fetch("gallery/manifest.json").then((r) => r.json());
  } catch {
    base = [];
  }
  const cfg = getGalleryConfig();
  const extra = Array.isArray(cfg.extra) ? cfg.extra : [];
  const hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];
  const all = base.concat(extra);
  const visible = all.filter((src) => !hidden.includes(src));
  return { all, visible, hidden, extra };
}

// Page ke hisaab se: index par sections build honge
if (document.querySelector(".hero") || document.getElementById("whyTrack")) {
  applySiteContent();
}
