# product/ — Lakshyaim product catalog

Is folder me website ke saare products ka data rakha jata hai.

## Files
- `products.json` — master product list (name, price, MRP, rating, emoji, tag)

## Products add karne ka tarika
`products.json` me naya object add karo (comma theek rakhna):

```json
{
  "emoji": "🥭",
  "bg": "#eef5ec",
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
