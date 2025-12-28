# 🚀 Next App Scaler

A "Scaled Sandbox" solution for Next.js applications using Shadcn UI. It fixes layout and whitespace issues on Windows devices with high-DPI scaling (e.g., 125%, 150%) by creating a fixed, scaled app container.

## 📦 Installation

```bash
npm install next-app-scaler
# or
yarn add next-app-scaler
# or
pnpm add next-app-scaler
```

## 🛠️ Usage

### 1. Patch your Shadcn Components

Run the CLI tool to automatically patch your Shadcn UI components (`Select`, `Dialog`, `Sheet`, etc.) so they work correctly inside the scaled container.

```bash
npx next-app-scaler
```

_Note: You should run this command again if you add new Shadcn components in the future._

### 2. Wrap your App

Open `src/app/layout.tsx` and wrap your application with `<AppScaler>`. It should be the immedate child of `<body>`.

```tsx
import { AppScaler } from "next-app-scaler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppScaler>{children}</AppScaler>
      </body>
    </html>
  );
}
```

## 🔍 How it Works

- **Windows/Linux (High DPI)**: Detects `devicePixelRatio > 1` and applies `transform: scale(1/ratio)`. Creates a fixed-position sandbox to handle layout stability.
- **Mac/Mobile**: Disables scaling (using native resolution) but enforces a `100dvh` dynamic viewport height layout ("App Shell") to ensure consistent scrolling behavior.

## ❤️ Author

Created with love by **sancheznotdev**.

- GitHub: [https://github.com/sancheznot/](https://github.com/sancheznot/)
