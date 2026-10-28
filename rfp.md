# 📄 RFP — Request for Proposal

**Lakshyaim Private Limited — Nutrition & Weight Management Website with Product Catalog Management**

| | |
|---|---|
| **Doc name** | rfp.md |
| **Prepared for** | Lakshyaim Private Limited |
| **Prepared by** | Project team (OpenCode workspace, folder `25-10-2026`) |
| **Version / Date** | v1.1 — 28 Oct 2026 (addendum A1: header dropdown menu) |
| **Live reference** | https://future-academy-80ae5.web.app |

---

## 1. Background & Context
Lakshyaim Private Limited operates in the nutrition & weight management domain. A working demo website (Herbalife-style clone) already exists and is hosted on Firebase Hosting. The current site demonstrates the target look and functional direction. Based on the results of the internal case test (`casetest.md`), the client intends to commission a production-grade platform.

## 2. Objective
Build a secure, scalable e-commerce platform with self-service product management so the internal team can publish/update/delete products without engineering help.

## 3. Current state (already delivered — v1 demo)
- Landing page: hero, best-seller grid, journey kits, testimonials, science strip, membership CTA, footer
- Admin login page + username/password screen (demo credentials)
- Admin dashboard: stats cards, recent orders table
- Product add / delete / reset-to-default, rendered dynamically from `product/products.json`
- Firebase Hosting deployment pipeline (`future-academy-80ae5`)
- Firebase Storage configured with rules (public read, auth-only write)
- Test artifacts: `casetest.md` + `evidence/` screenshots

## 4. Scope of work (What the RFP asks vendors to build)

### 4.1 Product management (server-backed)
- Move catalog from `product/products.json` + localStorage to **Cloud Firestore**
- Admin CRUD: create/edit/delete products — name, price, MRP, rating, reviews, tag, colors, emoji or image
- Product images uploaded to **Firebase Storage**, URLs saved in Firestore
- Cover versions of the current admin product form; audit log for changes

### 4.2 Authentication & roles
- Firebase Authentication — email/password + identity; role separation:
  - **Admin** (full catalog access) · **Member** (shop + membership pricing)
- Password reset flow; no hard-coded credentials (remove `admin/admin123`)

### 4.3 Storefront
- Product detail pages, category filters, search, cart computation
- Checkout stub → integrate a payment gateway (Razorpay/PhonePe; vendor proposal recommended)
- Membership flow (email capture today → real accounts + 25% pricing)

### 4.4 Orders & tracking
- Order creation with order IDs ( walkthrough `#LA-2XXX`), status workflow (Pending → Shipped → Delivered)
- Admin orders table per current dashboard design

### 4.5 Content & compliance
- FSSAI/food-product declarations, disclaimers, refund/shipping policy pages
- Performance: Lighthouse ≥ 90 (current live verifiable), mobile-first responsive
- SEO foundations: meta, sitemap, structured data

## 5. Technical requirements
| Area | Requirement |
|---|---|
| Architecture | Jamstack — Firebase Hosting + Firebase SDK (client) + Firestore/Storage |
| Current stack | HTML5, CSS3, vanilla JS |
| Backend | Firebase (project `future-academy-80ae5`) |
| Security | Rules review; secrets never in client code; HTTPS only |
| Browser support | Latest Chrome/Edge/Firefox; responsive to 320 px |
| Deliverables | Source code in the `25-10-2026` workspace, deployed URL, updated case-test report with fresh evidence |

## 6. Vendor responsibilities
1. Proposal with milestones, pricing and timelines
2. Implementation + reusable code comments (project is Hinglish-documented so touch-points stay explainable)
3. Regression run of `casetest.md` after each phase with new evidence screenshots
4. Deployment via `firebase deploy --only hosting` (and storage/firestore rules when applicable)
5. Handover: README, credential vault (no obvious client-side secrets), runbook

## 7. Acceptance criteria
- [ ] Products added in admin appear for **all visitors** (server-backed, not per-browser)
- [ ] Case test suite (TC-01 … TC-10) passes after modifications, with renewed evidence
- [ ] Admin auth uses Firebase Authentication with roles
- [ ] Lighthouse performance + LCP/CLS within threshold
- [ ] Current URLs remain live during the transition window

## 8. Timeline & budget (client-tentative)
| Phase | Items | Duration (indicative) |
|---|---|---|
| P1 | Firestore catalog + admin CRUD | 3 weeks |
| P2 | Firebase Auth + roles | 2 weeks |
| P3 | Cart/checkout + payments | 6 weeks |
| P4 | Orders + tracking | 3 weeks |
| P5 | Hardening, SEO, final case-test | 2 weeks |

Payment/contract terms: to be agreed on vendor selection.

## 9. Submission
- Email: *(client to fill)*
- Documents required: company profile, portfolio, team CVs, pricing, support SLA
- Reference material for bidders: `index.html`, `admin.html`, `product/products.json`, `casetest.md`, `evidence/`

---

## 10. Addendum A1 — Header Products dropdown (delivered 28 Oct 2026)
- **Requirement:** Navbar ke "Products" link par click karne se dropdown menu khule jisme se products/categories choose ho sakein.
- **Delivered:** Click-toggle dropdown with product photo/emoji thumb, name, price — catalog (`product/products.json`) se **dynamic**; admin-added products automatically aate hain. Escape/outside-click close, mobile accordion mode, ARIA attributes (`aria-haspopup`, `aria-expanded`).
- **Files touched:** `index.html`, `script.js`, `styles.css`
- **Test report:** `testcase.md` (TC-11…TC-16, 6/6 PASS, BUG-02 fixed) — evidence in `evidence/`
- **Deployed:** `firebase deploy --only hosting` → future-academy-80ae5, 28 Oct 2026

---

*Yeh document Lakshyaim Private Limited v1 demo website ke basis par prepared hai — changes in scope will be handled via addendum.*
