# Layout pitfalls with `next-app-scaler` (AppScaler)

This package wraps the app in a **transformed**, often **fixed-position** root on **Windows/Linux** when `devicePixelRatio > 1`. Mac and mobile skip the transform (`isActive === false`).

## Why `100dvh` / `100vh` / `min-h-screen` can look “short”

When scaling is **active**, the root node gets **inline width/height** like `125%` (for 125% OS zoom) and `transform: scale(0.8)`. The **layout box** is larger than **one viewport unit** in CSS pixels.

If a child uses **`h-dvh`**, **`min-h-screen`**, or **`100vh`** as its **only** height source, it often matches the **browser viewport**, not the **pre-transform layout size** of the scaler wrapper. You can get a **gap** (e.g. black band) under the UI while floating widgets (portaled to `body` or fixed outside the scaler) still look correct.

**Mitigation:** Prefer **`height: 100%` / `min-height: 0` / flex `flex-1`** chained from the scaler root, or **`max-h-[calc(100%-…)]`** relative to the scaler container—not raw `dvh` for **full-bleed** shells.

## Portals must target the scaler root

Radix overlays (Dialog, Sheet, Select, Tooltip, etc.) default to `document.body`. With a transformed ancestor, **`position: fixed`** is resolved against that ancestor. Portals should render **inside** the same container as the app.

Run **`npx next-app-scaler`** so UI files use:

- `useScaler()` → `scalerRef`
- `<XPrimitive.Portal container={scalerRef.current}>`

If `scalerRef.current` is `null` on first paint, Radix may fall back; ensure portals re-render after mount.

## Z-index stacking

After portaling **into** the scaler, UI layers compete in **one** subtree. Page chrome with **`z-[100]`** (sticky headers) can paint **over** tooltips/dialog chrome that still use **`z-50`**. Raise overlay z-index or lower sticky headers as needed.

## Full-screen error / offline pages

For centered full-screen pages, **`min-h-screen`** can mis-match the scaler box. Patterns that work: **`fixed inset-0`** inside the scaler (covers the scaled viewport) or **`h-full`** flex chain from the root layout.

## `useScaler()` extras (v1.1+)

- **`isActive`**: whether the HiDPI sandbox is on.
- **`data-app-scaler-active` / `data-app-scaler-scale`** on the root div for CSS hooks.

```css
[data-app-scaler-active="true"] .your-shell {
  /* optional overrides */
}
```
