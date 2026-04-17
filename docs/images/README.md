# Screenshots for the main README

## Current files

| File | Role |
|------|------|
| `windows-125-without.png` | Real capture: app **without** `AppScaler` (Windows display zoom). |
| `windows-125-with.png` | **Placeholder** — replace with a real capture **with** `<AppScaler>` at the **same** OS zoom and **same** browser width as `windows-125-without.png`, or the comparison is meaningless. |

## If you use **fiscalapp** (this monorepo)

1. In `typetwojobs/fiscalapp/.env.local` add: `NEXT_PUBLIC_APP_SCALER=false`
2. **Restart** `next dev` (required for `NEXT_PUBLIC_*` changes).
3. Same Windows zoom (125% / 150%), same browser **window width**, same URL → **screenshot “sin”**.
4. **Remove** that line from `.env.local` (or set `NEXT_PUBLIC_APP_SCALER=true`), **restart** dev → **screenshot “con”**.
5. `md5sum` / `sha256sum` on both PNGs → hashes **must differ**.

Never deploy with `NEXT_PUBLIC_APP_SCALER=false`.

## Integrity check (why this doc exists)

PNG files are **opaque**: if you copy the same screenshot three times under different names, **Git and the readme cannot tell**. Use **different** exports:

1. Set OS zoom (e.g. 125% or 150%) and **window width**.
2. Capture **without** the scaler (or temporarily unmount `<AppScaler>` in dev).
3. **Without closing the browser**, turn the scaler **on**, same URL, same zoom — capture again.
4. Compare file size or `md5sum` on Linux — hashes must **differ** if the pixels differ.

## Tips

- Capture the **viewport**, not the whole monitor.
- Optional: label the image (e.g. “125% · con AppScaler”) so you don’t mix files later.
