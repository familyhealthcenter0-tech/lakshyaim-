# 🧪 Case Test Report — Header Products Dropdown Menu (Lakshyaim Private Limited)

| Field | Value |
|---|---|
| Project | Lakshyaim Private Limited — Nutrition & Weight Management website |
| Module under test | Header navbar — "Products" click-dropdown menu (`index.html`, `script.js`, `styles.css`) |
| Requirement | "Header ke naam se folder — usme product click kare to dropdown menu dikhna chahiye" |
| Environment | Windows 10/11, Chromium (Review-pane browser), localhost:3000 + Firebase Hosting |
| Local URL | http://localhost:3000 |
| Hosted URL | https://future-academy-80ae5.web.app |
| Test date | 28 Oct 2026 |
| Tested by | Automated browser test (OpenCode agent) + user verification |
| Related docs | `casetest.md` (TC-01…TC-10, 27 Oct) · `rfp.md` v1.1 addendum |

---

## Test executables

**Data used**
- Catalog: `product/products.json` — 4 products (Formula 1 Shake – Vanilla, Formula 1 – Berry Burst, Herbal Tea Concentrate – Peach, Protein Drink Mix – Vanilla)
- Dropdown source: same JSON via `getProducts()` — dynamic, admin-added products automatically included
- Dropdown structure: 1 × "🛍️ All Products" header link + 1 item per product (photo/emoji thumb + name + price)

---

## 📋 Test cases & results

| # | Test case | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| TC-11 | Dropdown opens on "Products" click | Click navbar "Products ▾" | Dropdown panel opens; "All Products" + 4 catalog items with photo thumbs & prices; caret rotates; `aria-expanded="true"` | 5 items rendered (1 + 4), panel open, caret rotated, `aria-expanded="true"` | ✅ PASS | `evidence/TC11-products-dropdown-open.png` |
| TC-12 | Item click navigates + closes | Open dropdown → click item (Herbal Tea) | Smooth-scroll to `#products` section; dropdown closes | scrollY 944 ≈ products top − navbar offset; dropdown closed | ✅ PASS | `evidence/TC12-dropdown-click-goto-products.png` |
| TC-13 | Outside click + Escape closes | Open dropdown → click page body → reopen → press `Esc` | Dropdown closes in both cases; `aria-expanded="false"` | Toggle opens ✅ · outside click closes ✅ · Escape closes ✅ | ✅ PASS | values in run log: `openAfterToggle: true, closedAfterOutside: true, closedAfterEscape: true` |
| TC-14 | Data accuracy vs catalog | Compare dropdown items with `product/products.json` | Names & formatted prices match catalog exactly | 4/4 names match, prices `₹2,349 / ₹2,349 / ₹1,699 / ₹2,799` match — `match: true` | ✅ PASS | run output (programmatic diff) |
| TC-15 | Dropdown on live deployed site | Open https://future-academy-80ae5.web.app → click "Products ▾" | Same dropdown renders on production URL | Identical dropdown, 5 items, photos + prices live | ✅ PASS | `evidence/TC15-live-site-dropdown.png` |
| TC-16 | Regression — shop & gallery intact | Scroll to Best Sellers & Gallery after dropdown tests | Product cards with photos render; gallery grid intact; 0 console errors | 4 cards with photos ✅ · 69 gallery items ✅ · console errors = 0 | ✅ PASS | `evidence/TC12-dropdown-click-goto-products.png` (shop) + `evidence/TC15-live-site-dropdown.png` |

---

## 🐞 Issues found & fixed during this module

| Bug ID | Description | Root cause | Fix | Retest |
|---|---|---|---|---|
| BUG-02 | Mobile menu closed when user clicked "Products" toggle (dropdown open karte hi poora hamburger menu band ho jata tha) | Navbar link-close handler sab `<a>` par bound tha, dropdown toggle bhi usme tha | `script.js` → toggle link (`#dropToggle`) ko close-handler se exclude kiya; dropdown item clicks se hi menu band hota hai | Mobile inline dropdown retest — menu open rehta hai, dropdown toggle hota hai ✅ |

---

## 📌 Notes / pending items
1. Dropdown `products.json` se **dynamically** banta hai — admin panel se naya product add hote hi dropdown me bhi dikhega (page reload par).
2. Mobile (<720 px) me dropdown hamburger menu ke andar inline khulta hai (accordion style).
3. Accessibility: `aria-haspopup`, `aria-expanded`, Escape-key close, outside-click close implemented.

---

## 🗂 Evidence copies
Screenshots saved in **`evidence/`**:
- `TC11-products-dropdown-open.png` — dropdown open state (All Products + 4 items, photos, prices)
- `TC12-dropdown-click-goto-products.png` — item click → Best Sellers section par pahuncha, dropdown band
- `TC15-live-site-dropdown.png` — deployed Firebase URL par dropdown

**Overall result: 🟢 CASE TEST SUCCESSFUL — 6/6 PASSED (after in-flight fix BUG-02)**
