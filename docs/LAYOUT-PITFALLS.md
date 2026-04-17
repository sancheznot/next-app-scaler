# Layout pitfalls with `next-app-scaler` (AppScaler)

This package wraps the app in a **transformed**, often **fixed-position** root on **Windows/Linux** when `devicePixelRatio > 1`. Mac and mobile skip the transform (`isActive === false`).

## Resize sources (v1.1.1+)

The same layout logic runs on **`window.resize`** and **`visualViewport.resize`** (when available). That catches page zoom / viewport changes that do not always fire `window.resize`. **`visualViewport`** does not run per animation frame by itself — only when the visual viewport size changes. State updates skip if `scale` / `isActive` are unchanged (e.g. duplicate events). **`will-change: transform`** is applied only while scaling is active (compositor hint; no layout change).

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

## Mac & mobile (scaler inactive)

On **macOS** and **mobile**, the package **turns scaling off** on purpose: Retina Macs usually report `devicePixelRatio === 2` without Windows-style “125% display zoom”. Treating that like Windows would apply `scale(0.5)` and shrink the whole UI—so Mac is excluded from the transform path.

If the app still looks **wrong on a Mac**, it is usually **not** fixed by “enabling the same scaler as Windows”. Check instead:

1. **Portals** — Run **`npx next-app-scaler`** so dialogs/tooltips mount inside the scaler root. Unpatched Radix portals to `body` + your layout often look “off” on Safari too.
2. **Dynamic viewport** — Safari’s toolbar makes **`100dvh`** jump or leave bands. The root uses **`min-h-svh`** plus **`h-dvh`** to reduce the worst cases; you can pass **`className`** on **`AppScaler`** (v1.1.4+) to tune (e.g. your own `min-h-*`, safe-area, or `pb-[env(safe-area-inset-bottom)]`).
3. **Flex** — Use **`min-h-0`** on flex children so nested scroll areas don’t explode on iOS.

## `useScaler()` extras (v1.1+)

- **`isActive`**: whether the HiDPI sandbox is on.
- **`data-app-scaler-active` / `data-app-scaler-scale`** on the root div for CSS hooks.

```css
[data-app-scaler-active="true"] .your-shell {
  /* optional overrides */
}
```
