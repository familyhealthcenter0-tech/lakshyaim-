// ============================================================
// theme.js — Dark / Light mode toggle (shared across all pages)
// Apply early (head inline script) to avoid FOUC; this file
// binds the toggle button and persists the preference.
// ============================================================

(function () {
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("lakshyaim_theme", theme); } catch {}
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = theme === "dark" ? "☀️" : "🌙";
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }

  function bind() {
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.addEventListener("click", toggleTheme);
    });
    applyTheme(currentTheme()); // sync icon with persisted state
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }

  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === "lakshyaim_theme" && e.newValue) {
      applyTheme(e.newValue);
    }
  });

  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;
})();
