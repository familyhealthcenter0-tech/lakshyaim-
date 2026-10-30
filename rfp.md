# RFP — Request for Proposal

**Lakshyaim Private Limited — Nutrition & Weight Management Website with Product Catalog Management**

| | |
|---|---|
| **Doc name** | rfp.md |
| **Prepared for** | Lakshyaim Private Limited |
| **Prepared by** | Project team (OpenCode workspace) |
| **Version / Date** | v2.0 — 30 Oct 2026 |
| **Live reference** | https://future-academy-80ae5.web.app |
| **GitHub** | https://github.com/familyhealthcenter0-tech/lakshyaim- |

---

## 1. Background & Context

Lakshyaim Private Limited operates in the nutrition & weight management domain. The project started as a demo website and evolved into a full-featured e-commerce platform with admin CMS, payment gateway, PWA support, and professional invoicing.

## 2. Objective

Build a secure, scalable e-commerce platform with self-service product management so the internal team can publish/update/delete products without engineering help. Include payment gateway, user authentication, order management, analytics, and PWA support.

## 3. Scope of Work

### 3.1 Frontend (Storefront)
- **Homepage**: Hero section, product grid (5 products + View All), gallery (6 images + View All), Why Choose Us (auto-slide), Choose Your Journey (plans), Testimonials (auto-slide), FAQ, Membership CTA, My Account panel, Footer with social links and credit
- **Product Pages**: Dedicated products page (all products), product detail page (description, benefits, ingredients, usage, images)
- **Gallery Page**: Full gallery with lightbox
- **Cart Page**: Add/remove items, qty steppers, free shipping progress, order summary
- **Checkout Page**: Google Auth required, address form, saved addresses, Razorpay payment gateway
- **My Orders Page**: Google-gated order history with status tracking
- **Dark/Light Mode**: Toggle on all pages with FOUC prevention

### 3.2 Admin Panel (CMS)
- **Dashboard**: 4 KPI cards, quick action cards, welcome banner
- **Products**: CRUD (add/edit/delete/search), photo picker, preview, download products.json
- **Orders**: Status dropdown (Pending/Paid/Shipped/Delivered), delete, expandable full-details panel
- **Analytics**: 12 KPIs, 7 charts (revenue trend, revenue bars, status donut, payment split, top products, category, members growth), GST report
- **Gallery Manager**: Hide/show/upload/delete photos
- **Database**: Records overview, size, export, clear, backup
- **Members**: Join-form capture, CSV export
- **Content CMS**: 95+ fields for topbar/hero/why/testimonials/plans/footer
- **Activity Log**: Audit trail
- **Settings**: Logo upload, shipping, GST, payment gateway (Razorpay), social media links, company details, admin credentials

### 3.3 Payment Gateway
- Razorpay integration (Key ID + Key Secret)
- Direct payment on "Place Order" click
- Order saved only after successful payment
- Payment ID stored with order

### 3.4 Authentication
- Google Sign-In (Firebase Auth)
- Required for checkout
- User dropdown in header (My Orders, My Account, Sign Out)
- My Orders page gated behind Google auth

### 3.5 PWA Support
- Web App Manifest with icons
- Service Worker with cache-first strategy
- Install prompt (banner + popup + FAB + footer button)
- Offline support for cached pages
- Device-friendly responsive design

### 3.6 Invoice System
- Professional invoice with company logo, address, phone, email, GSTIN
- GST breakdown (Subtotal, GST, Shipping, Total)
- Terms & Conditions, signature areas
- Single-page print optimization
- Auto-open in new tab from admin order details

### 3.7 Chatbot
- Bilingual (Hindi/English) product expert
- Knowledge base from products.json
- Answers: prices, benefits, ingredients, usage, shipping, payment, orders, admin, GST, contact
- Quick suggestion chips
- Floating widget + footer link

## 4. Technical Specifications

### 4.1 Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth (Google Sign-In)
- **Data Storage**: localStorage (demo), Firebase (production-ready)
- **Payment**: Razorpay Checkout SDK
- **Fonts**: Manrope (display) + Inter (UI)
- **Icons**: SVG (inline)
- **PWA**: Service Worker + Web App Manifest

### 4.2 Color Theme
- **Primary**: Deep Blue (#1e40af)
- **Primary Light**: #dbeafe
- **Primary Dark**: #1e3a8a
- **Accent**: Orange (#f97316)
- **Accent Strong**: #ea580c
- **Accent Soft**: #fff7ed
- **Background**: White (#ffffff)
- **Alt Background**: #f8fafc
- **Text**: Deep Slate (#0f172a)
- **Muted**: Slate (#64748b)
- **Border**: #e2e8f0
- **Dark**: #0f172a (footer/dark sections)

### 4.3 Responsive Design
- Desktop: 1024px+
- Tablet: 641px-1024px
- Mobile: 620px and below
- Small mobile: 420px and below
- Extra small: 360px and below

### 4.4 Browser Support
- Chrome/Edge (full PWA support)
- Firefox (limited PWA)
- Safari (iOS PWA via "Add to Home Screen")
- Mobile browsers (responsive)

## 5. Data Models

### 5.1 Product
```json
{
  "emoji": "",
  "bg": "#fdeee2",
  "image": "gallery/img-27.jpg",
  "imgPos": "50% 55%",
  "imgZoom": 1.6,
  "tag": "Vegan",
  "tagClass": "tag-green",
  "name": "Formula 1 Shake - Vanilla",
  "rating": 5,
  "reviews": 2140,
  "price": 2349,
  "mrp": 2899,
  "description": "...",
  "benefits": ["18g Protein", "Low sugar"],
  "ingredients": "Soy Protein, Vitamins...",
  "usage": "Mix 2 scoops with 250ml water",
  "weight": "550g",
  "servings": 21
}
```

### 5.2 Order
```json
{
  "id": "#LA-20261030-4821",
  "date": "30 Oct 2026, 2:30 PM",
  "customer": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com",
    "address": "Flat 402, Green Residency",
    "city": "Indore",
    "state": "Madhya Pradesh",
    "pin": "452001",
    "uid": "firebase_uid"
  },
  "pay": "Razorpay",
  "paymentId": "pay_xxxxx",
  "items": [...],
  "total": 2349,
  "status": "Paid"
}
```

### 5.3 Settings
```json
{
  "logo": "data:image/...",
  "freeShipOver": 2999,
  "shipFee": 99,
  "gstin": "23ABCDE1234F1Z5",
  "gstRate": 18,
  "companyName": "Lakshyaim Private Limited",
  "companyPhone": "+91 9999999999",
  "companyEmail": "info@lakshyaim.com",
  "companyAddress": "Street, City, State - PIN",
  "razorpay": true,
  "razorpayKey": "rzp_test_xxx",
  "razorpaySecret": "xxx",
  "apiKeyId": "",
  "apiKeySecret": "",
  "note": "Secure payment via Razorpay",
  "social": {
    "instagram": "#",
    "facebook": "#",
    "youtube": "#",
    "whatsapp": "#",
    "twitter": "#"
  }
}
```

## 6. Security Considerations

- Admin credentials stored in localStorage (demo - should be server-side in production)
- Razorpay Key Secret stored client-side (should be server-side in production)
- User authentication via Firebase Auth (Google Sign-In)
- Order data in localStorage (should be Firestore in production)

## 7. Deployment

- **Hosting**: Firebase Hosting (https://future-academy-80ae5.web.app)
- **Repository**: GitHub (https://github.com/familyhealthcenter0-tech/lakshyaim-)
- **Branch**: main
- **CI/CD**: Manual deploy via `firebase deploy --only hosting`

## 8. Future Enhancements (Phase 2)

- Migrate localStorage to Firestore for multi-user persistence
- Server-side payment verification with Razorpay
- Firebase Auth for admin (replace demo credentials)
- Product search/filter on products page
- SEO optimization (meta tags, sitemap, Lighthouse)
- Push notifications for order updates
- Multi-language support (beyond Hindi/English chatbot)
- Inventory management
- Coupon/discount system

## 9. Acceptance Criteria

- [x] Homepage loads in < 3 seconds
- [x] Admin panel accessible with login
- [x] Products can be added/edited/deleted via admin
- [x] Cart and checkout flow works end-to-end
- [x] Razorpay payment gateway opens on Place Order
- [x] Order saved only after successful payment
- [x] Invoice generated with GST breakdown
- [x] PWA installable on mobile and desktop
- [x] Dark/light mode toggle works
- [x] Chatbot responds to product queries in Hindi/English
- [x] All pages responsive on mobile/tablet/desktop
- [x] Firebase deployed and GitHub pushed

---

**End of RFP**
PY