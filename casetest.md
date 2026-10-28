# 🧪 Case Test Report — Product Folder Module (Lakshyaim Private Limited)

| Field | Value |
|---|---|
| Project | Lakshyaim Private Limited — Nutrition & Weight Management website |
| Module under test | Product catalog (`product/products.json`, admin add/delete/reset, shop render) |
| Environment | Windows 10, Chromium (Review-pane browser), Firebase Hosting |
| Hosted URL | https://future-academy-80ae5.web.app |
| Admin URL | https://future-academy-80ae5.web.app/admin |
| Test date | 27 Oct 2026 |
| Tested by | Automated browser test (OpenCode agent) + user verification |

---

## Test executables

**Credentials / data used**
- Username: `admin` (case-insensitive) · Password: `admin123` (space-tolerant)
- Test product: `Test Shake – Mango Blast`, emoji `🥭`, tag `Test Category`, price ₹999, MRP ₹1,299

---

## 📋 Test cases & results

| # | Test case | Steps | Expected | Actual | Status | Evidence |
|---|---|---|---|---|---|---|
| TC-01 | Website live | GET https://future-academy-80ae5.web.app | HTTP 200, title "Lakshyaim Private Limited – Nutrition & Weight Management" | HTTP 200, exact title | ✅ PASS | — |
| TC-02 | Admin page live | GET https://future-academy-80ae5.web.app/admin | HTTP 200, login screen renders | HTTP 200, login card renders | ✅ PASS | — |
| TC-03 | Invalid login | Username `admin`, password `wrongpass` → Login | Red error shown, dashboard stays hidden | Error: "❌ Password galat hai. Sahi password: admin123" | ✅ PASS | `evidence/TC3-wrong-password-error.png` |
| TC-04 | Valid login (fuzzy input) | Username `ADMIN`, password ` Admin123 ` (caps + spaces) | Dashboard opens, welcome message | Dash open; "Welcome back, admin!" | ✅ PASS | Annexed to TC-05 screenshot |
| TC-05 | Add new product | Fill form fields → Save Product | Success message; catalog count 4→5; localStorage updated | "✅ Test Shake – Mango Blast save ho gaya"; count = 5; storage = 5 items | ✅ PASS | `evidence/TC5-admin-product-added-catalog.png` |
| TC-06 | Shop renders catalog from JSON | Open index.html, wait 600 ms | 5 cards rendered incl. new product | 5 cards: 4 defaults + Test Shake – Mango Blast | ✅ PASS | `evidence/TC6-shop-products-grid.png` |
| TC-07 | New product visible on shop | Scroll to Best Sellers | Test product card with ₹999 / ~~₹1,299~~ | Card visible with correct price & MRP strike | ✅ PASS | `evidence/TC7-test-product-on-shop.png` |
| TC-08 | Reset catalog | Click Reset to Default | localStorage cleared; count back to 4 | count = 4, storage = null, cache clean | ✅ PASS | `evidence/TC8-reset-original-catalog.png` |
| TC-09 | products.json integrity | `ConvertFrom-Json` validation | Valid JSON, 4 default products | Valid, 4 products | ✅ PASS | terminal output (validated before deploy) |
| TC-10 | Storage rules deploy | `firebase deploy --only storage` | Rules compiled & released | "rules file compiled successfully → released" | ✅ PASS | Firebase CLI output |

---

## 🐞 Bug found & fixed during testing

| Bug ID | Description | Root cause | Fix | Retest |
|---|---|---|---|---|
| BUG-01 | After "Reset to Default", stale items reappeared / cached defaults got polluted with newly added product | `getProducts()` returned the cached `defaultProducts` array **by reference**; admin submit handler pushed new product into that same array, mutating the default cache permanently | `products.js` → always `JSON.parse(JSON.stringify(defaults))` (deep copy); `admin.js` add handler also copies incoming list | Retested full cycle (add → reset): count 4→5→4 — clean ✅ |

**BUG-01 evidence chain:** add showed `afterAdd = 6` with reset `afterReset = 6` (stale) → fix applied → retest `before 4 / afterAdd 5 / afterReset 4` (values from latest run displayed as 4/5/4 — see TC-05/06/07/08 evidence).

---

## 📌 Observations / pending items
1. Products live on each visitor's browser via localStorage; `product/products.json` is the permanent catalog (deploy-time). For cross-visitor sync, migrate to Firestore (next phase).
2. Admin credentials are demo client-side values — production requires server-side auth.
3. Saturn emoji fallback works if emoji field left blank (`📦`).

---

## 🗂 Evidence copies
Evidence screenshots are saved in **`evidence/`** folder:
- `TC3-wrong-password-error.png` — login rejection
- `TC5-admin-product-added-catalog.png` — Add-product success + catalog table (5 items)
- `TC6-shop-products-grid.png` — shop grid rendering
- `TC7-test-product-on-shop.png` — new product card on shop (₹999)
- `TC8-reset-original-catalog.png` — reset restored original 4 products

**Overall result: 🟢 CASE TEST SUCCESSFUL — 10/10 PASSED (after in-flight fix BUG-01)**
