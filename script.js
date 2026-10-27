// Mobile menu toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));

// Close mobile menu after clicking a link
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

// Navbar shadow on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 8);
});

// Add-to-cart clicks -> update cart badge (delegated, works for dynamic products too)
const cartBtn = document.querySelector(".icon-btn[aria-label='Cart']");
let cartCount = 2;
codeClicks();
function codeClicks() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".card .btn");
    if (!btn) return;
    cartCount++;
    const badge = cartBtn.querySelector(".cart-count");
    badge.textContent = cartCount;
    badge.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.5)" }, { transform: "scale(1)" }],
      { duration: 250 }
    );
    btn.textContent = "Added ✓";
    setTimeout(() => (btn.textContent = "Add to Cart"), 1200);
  });
}

// Shop grid render (products.js ke saath)
const productGrid = document.getElementById("productGrid");
if (productGrid) {
  getProducts().then((list) => {
    productGrid.innerHTML = list.map(productCardHTML).join("");
  });
}

// Join form
const joinForm = document.getElementById("joinForm");
const formMsg = document.getElementById("formMsg");
joinForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  formMsg.textContent = `✅ Thanks! Member invite sent to ${email}`;
  formMsg.style.color = "#bff0c8";
  joinForm.reset();
});
