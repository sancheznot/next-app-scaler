# next-app-scaler

A **scaled sandbox** for Next.js apps (especially with **shadcn/ui**) so layouts stay coherent on **Windows / Linux** with **system zoom** (125%, 150%, etc.) where `devicePixelRatio > 1`.

Published on npm as [`next-app-scaler`](https://www.npmjs.com/package/next-app-scaler).

## Source repository (local development)

If you cloned the monorepo or workspace where this package was developed, the **source** usually lives in a folder named **`scaler-kit`** (this repo), **not** inside each Next app. Consumer apps (`fiscalapp`, `cms-IA`, etc.) only list it as a **dependency**; they do not contain the package source.

```text
programming/scaler-kit/     ← this package (src, bin, docs)
typetwojobs/fiscalapp/      ← npm dependency "next-app-scaler": "^1.0.0"
programming/cms-IA/         ← same
```

To work on the library: edit `src/index.tsx` here, run `npm run build`, then bump version / `npm publish` or `npm pack` and install from tarball in apps.

## Install

```bash
npm install next-app-scaler
```

## Usage

### 1. Patch shadcn primitives (portals)

From the **root of your Next.js app**:

```bash
npx next-app-scaler
```

This patches `src/components/ui/*` so `Dialog`, `Sheet`, `Select`, `Tooltip`, etc. use `container={scalerRef.current}` from `useScaler()`. Re-run after adding new Radix-based components.

### 2. Wrap the app

In `src/app/layout.tsx`, inside `<body>`:

```tsx
import { AppScaler } from "next-app-scaler";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppScaler>{children}</AppScaler>
      </body>
    </html>
  );
}
```

### 3. Optional: `useScaler()` in your code

```tsx
import { useScaler } from "next-app-scaler";

const { scalerRef, scale, isActive } = useScaler();
```

- **`scale`**: CSS scale factor applied when active (e.g. `0.8` at 125% zoom).
- **`isActive`**: `true` when the HiDPI sandbox is enabled (Windows/Linux, not Mac/mobile by default).

The root element also sets:

- `data-app-scaler-active="true"|"false"`
- `data-app-scaler-scale` (number as string)

for CSS or tests.

## How it works (short)

| Environment | Behavior |
|-------------|----------|
| **Mobile** | Scaling **off** (`position: relative`, no transform). |
| **macOS** | Scaling **off** — Retina is handled differently; we avoid double scaling. |
| **Windows / Linux desktop** with `devicePixelRatio > 1` | **On**: root gets `position: fixed`, `transform: scale(1/DPR)`, and width/height **> 100%** so that after scaling the visual size matches the viewport. `document.body` overflow is hidden; scroll happens inside the scaler root. |

> **Note:** The previous README claimed a special “100dvh Mac shell”; the implementation simply **disables** the scaler on Mac. Layout still uses `h-dvh` on the root class for a full-height column when needed.

## Documentation for integrators

| Doc | Purpose |
|-----|---------|
| [docs/LAYOUT-PITFALLS.md](./docs/LAYOUT-PITFALLS.md) | `dvh` vs `%`, portals, z-index, full-screen pages |
| [docs/AI-ASSISTANT-PROMPT.md](./docs/AI-ASSISTANT-PROMPT.md) | Copy-paste prompts for AI-assisted debugging |

## Author

**sancheznotdev** · [GitHub](https://github.com/sancheznot/)

MIT License.
