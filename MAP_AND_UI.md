# Map Feature & Mobile-Friendly UI

## ✅ What's New

### Interactive Map
- **Leaflet.js integration** - OpenStreetMap-based interactive map of all 8 properties
- **Property markers** - Yellow pins for each property in Riverview Gardens
- **Click interactions** - Click markers to open property detail drawer
- **Highlight selected** - Selected properties show in green
- **Popups** - Quick preview: address, beds/baths, market value, AVM
- **Legend** - Visual guide showing marker colors
- **Property info card** - Below map shows detailed info for selected property

### Mobile Responsive Design
- **Breakpoints**: 768px (tablet) and 480px (phone)
- **Responsive layout**: Single-column on mobile, multi-column on desktop
- **Touch-friendly**: Larger buttons and form fields on mobile (16px min)
- **Flexible tables**: Horizontal scroll on mobile with touch support
- **Adaptive map**: Reduced height (280px) on small screens for better UX
- **Hamburger-friendly navigation**: Tab navigation reflows on mobile

### UI Improvements
- **Better typography**: Scaled font sizes across devices
- **Improved spacing**: Reduced padding on mobile for dense layouts
- **Optimized cards**: Grid adjusts from 4-col to 2-col to 1-col
- **Accessibility**: Reduced motion support for accessibility users
- **Performance**: Lazy-loads map only when Map tab clicked
- **Visual polish**: Consistent styling across all screen sizes

## 🗺️ Map Features

### API Endpoint
```bash
GET /api/properties-map
```

Returns all properties with coordinates:
```json
{
  "property_id": 1,
  "address": "10037 Dorothy Ave",
  "beds": 2,
  "full_baths": 1,
  "living_sqft": 720,
  "market_value_2025": 66000,
  "realavm": null,
  "latitude": 38.5245,
  "longitude": -90.2895
}
```

### Map Interactions
1. **Click marker** → Opens property detail drawer
2. **Click property row** → Highlights on map + shows detail
3. **Map legend** → Explains marker colors
4. **Property info card** → Shows selected property details below map

## 📱 Mobile Breakpoints

| Screen | Main Changes | Map Height | Grid | Font |
|--------|-------------|-----------|------|------|
| Desktop (1000+) | Full layout | 500px | 4 col | 100% |
| Tablet (768) | Flexible | 400px | 2 col | 95% |
| Phone (480) | Single col | 280px | 1 col | 85% |

## 🎨 Responsive Components

### Cards
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

### Tables
- Desktop: Full scroll with sticky header
- Mobile: Horizontal scroll with touch support

### Forms & Inputs
- Desktop: 280px search, 220px select
- Tablet: 100% width in single-col layout
- Mobile: 100% width with 16px font for zoom prevention

### Navigation
- Desktop: Horizontal tabs, flex-wrap
- Mobile: Tabs with overflow-x scroll for touch

## 📍 Coordinates

All 8 properties in Riverview Gardens, St. Louis, MO 63137:

```
10037 Dorothy Ave    → 38.5245, -90.2895
10062 Dorothy Ave    → 38.5247, -90.2893
10326 Ashbrook Dr    → 38.5235, -90.2760
1229 Kilgore Dr      → 38.5142, -90.2845
651 Gleason Dr       → 38.5185, -90.2720
839 Font Ln          → 38.5155, -90.2950
9266 Waldorf Dr      → 38.5080, -90.2925
9464 Adler Ave       → 38.5095, -90.2845
```

## 🚀 Usage

1. **View map**: Click "Map" tab in navigation
2. **Click property**: Selects it and shows info
3. **Open details**: Click marker or table row
4. **See responsive**: Resize browser to test mobile layout

## 📱 Test on Mobile

```bash
# On desktop, press F12 → Device Toolbar
# Select iPhone 12 or your device
# Refresh page to see mobile layout

# Or access from phone:
http://localhost:4321
```

## Files Modified

- `web/public/index.html` - Added Map tab with Leaflet container
- `web/public/styles.css` - Added map styles + mobile breakpoints
- `web/public/app.js` - Added initMap() and highlighting logic
- `web/server.js` - Added /api/properties-map endpoint
- `db/add-coordinates.sql` - Added property_coordinates table

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

Works great on phones, tablets, and desktops!
