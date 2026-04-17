# Screenshots in the main README

| File | What it shows |
|------|----------------|
| `windows-175-with-app-scaler.png` | **With** `<AppScaler>` — reference at **175%** Windows display zoom (fiscalapp). Web UI is scaled to stay coherent; **OS cursor** is not scaled (can look large next to the UI). |
| `windows-150-zoom-without-scaler.png` | **Without** the package — **150%** OS zoom only. |
| `windows-175-zoom-without-scaler.png` | **Without** the package — **175%** OS zoom only (more “inflated” UI than 150%). |

**Without** = only Windows/Linux **display scaling**; no `AppScaler` in the app.

## Capturing your own A/B (e.g. **fiscalapp**)

1. `NEXT_PUBLIC_APP_SCALER=false` in `.env.local` → restart `next dev` → capture **without**.
2. Remove that line (or `true`) → restart → capture **with** `<AppScaler>`.
3. Same browser width and URL; only toggles should be scaler + intended OS zoom.

Never deploy with `NEXT_PUBLIC_APP_SCALER=false`.

## Integrity

Different PNGs must have **different** `md5sum` / file sizes — do not copy the same file under two names.
