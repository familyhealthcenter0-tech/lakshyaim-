# product/ — Lakshyaim product catalog

Is folder me website ke saare products ka data rakha jata hai.

## Files
- `products.json` — master product list (name, price, MRP, rating, emoji, tag, image)
- `images/` — product SVG placeholders

**Note:** `image` field me photo ka path do (jaise `"gallery/img-27.jpg"`) — shop cards aur admin table me photo dikhegi. Na do to emoji fallback dikhega. Saari product photos `gallery/` folder me hain (`gallery/manifest.json` unki list hai, homepage gallery isi se banti hai).

## Products add karne ka tarika
`products.json` me naya object add karo (comma theek rakhna):

```json
{
  "emoji": "🥭",
  "bg": "#eef5ec",
  "image": "gallery/img-63.jpg",
  "tag": "Digestive Health",
  "tagClass": "tag-green",
  "name": "Aloevera Concentrate – Mango",
  "rating": 5,
  "reviews": 0,
  "price": 1949,
  "mrp": 2249
}
```

Save karne ke baad ye chalao — site update ho jayegi:

```
firebase deploy --only hosting
```
