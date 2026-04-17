# Prompt for AI assistants (copy-paste)

Use this when debugging layout with **`next-app-scaler`** / **`AppScaler`** in a Next.js + shadcn app.

---

**Prompt (English — paste into your AI tool):**

> Our Next.js app wraps the tree in `AppScaler` from `next-app-scaler` (Windows HiDPI: `transform: scale()` + fixed root; portals use `container={scalerRef.current}`). We see: [describe: black band at bottom / tooltip only shows arrow / dialog clipped / etc.].
>
> Constraints:
> 1. Avoid anchoring full-height shells only to `100dvh`, `100vh`, or `min-h-screen` inside the scaled tree—prefer `h-full`, `min-h-0`, flex `flex-1`, or `calc(100%-…)` relative to the scaler parent.
> 2. Radix portaled content must stay inside `scalerRef`; check z-index vs sticky headers (e.g. z-100) vs overlays (tooltips often z-50).
> 3. Do not remove AppScaler; fix consuming components.
>
> Relevant files: `src/app/layout.tsx`, dashboard `layout.tsx`, shadcn `dialog.tsx` / `tooltip.tsx` with `useScaler`. Suggest minimal diffs.

---

**Prompt (Spanish):**

> La app usa `AppScaler` de `next-app-scaler` (Windows con zoom: `transform: scale` + raíz `fixed`; portales con `container={scalerRef.current}`). El problema es: [describe].
>
> Reglas: no depender solo de `100dvh`/`min-h-screen` para altura en el árbol escalado; usar cadena `h-full`/`flex-1`/`min-h-0` o `calc(100%-…)`. Revisar z-index (stickies vs tooltips/dialogs). No quitar el scaler. Cambios mínimos en componentes.

---

## Symptoms → quick checks

| Symptom | Likely cause |
|--------|----------------|
| Black/empty band under UI | `h-dvh` vs scaler box height mismatch |
| Tooltip arrow only | `z-index` under sticky header |
| Dialog/popover offset wrong | Portal not using `scalerRef` |
| Double scroll / body locked | Expected when scaler active (`overflow: hidden` on `body`) |

See **LAYOUT-PITFALLS.md** for detail.
