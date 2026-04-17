# Screenshots for the main README

## Current files

| File | Role |
|------|------|
| `windows-125-without.png` | Real capture: app **without** `AppScaler` (Windows display zoom). |
| `windows-125-with.png` | **Placeholder** — replace with a real capture **with** `<AppScaler>` at the **same** OS zoom and **same** browser width as `windows-125-without.png`, or the comparison is meaningless. |

## Integrity check (why this doc exists)

PNG files are **opaque**: if you copy the same screenshot three times under different names, **Git and the readme cannot tell**. Use **different** exports:

1. Set OS zoom (e.g. 125% or 150%) and **window width**.
2. Capture **without** the scaler (or temporarily unmount `<AppScaler>` in dev).
3. **Without closing the browser**, turn the scaler **on**, same URL, same zoom — capture again.
4. Compare file size or `md5sum` on Linux — hashes must **differ** if the pixels differ.

## Tips

- Capture the **viewport**, not the whole monitor.
- Optional: label the image (e.g. “125% · con AppScaler”) so you don’t mix files later.
