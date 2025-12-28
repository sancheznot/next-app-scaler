import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_COMPONENTS_DIR = path.join(
  process.cwd(),
  "src",
  "components",
  "ui"
);
const TARGET_SCALER_PATH = path.join(
  process.cwd(),
  "src",
  "components",
  "app-scaler.tsx"
);
const SOURCE_SCALER_PATH = path.join(__dirname, "AppScaler.tsx");

// ANSI Colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.cyan}🚀 Starting Scaled Sandbox Installer...${colors.reset}\n`
);

// 1. Install AppScaler Component
try {
  console.log(
    `${colors.blue}📦 Installing AppScaler component...${colors.reset}`
  );
  if (!fs.existsSync(path.dirname(TARGET_SCALER_PATH))) {
    fs.mkdirSync(path.dirname(TARGET_SCALER_PATH), { recursive: true });
  }
  fs.copyFileSync(SOURCE_SCALER_PATH, TARGET_SCALER_PATH);
  console.log(`${colors.green}✅ Created ${TARGET_SCALER_PATH}${colors.reset}`);
} catch (error) {
  console.error(
    `${colors.red}❌ Failed to copy AppScaler.tsx: ${error.message}${colors.reset}`
  );
  process.exit(1);
}

// 2. Patch Shadcn Components
const componentsToPatch = [
  {
    name: "select.tsx",
    portalRegex: /<SelectPrimitive\.Portal/g,
    portalReplacement: "<SelectPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "dialog.tsx",
    portalRegex: /<DialogPrimitive\.Portal/g,
    portalReplacement: "<DialogPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "sheet.tsx",
    portalRegex: /<SheetPrimitive\.Portal/g,
    portalReplacement: "<SheetPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "dropdown-menu.tsx",
    portalRegex: /<DropdownMenuPrimitive\.Portal/g,
    portalReplacement:
      "<DropdownMenuPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "popover.tsx",
    portalRegex: /<PopoverPrimitive\.Portal/g,
    portalReplacement: "<PopoverPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "tooltip.tsx",
    portalRegex: /<TooltipPrimitive\.Portal/g,
    portalReplacement: "<TooltipPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "context-menu.tsx",
    portalRegex: /<ContextMenuPrimitive\.Portal/g,
    portalReplacement:
      "<ContextMenuPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "menubar.tsx",
    portalRegex: /<MenubarPrimitive\.Portal/g,
    portalReplacement: "<MenubarPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "hover-card.tsx",
    portalRegex: /<HoverCardPrimitive\.Portal/g,
    portalReplacement:
      "<HoverCardPrimitive.Portal container={scalerRef.current}",
  },
  {
    name: "command.tsx",
    skip: true,
  },
];

console.log(`\n${colors.blue}🔧 Patching UI Components...${colors.reset}`);

if (!fs.existsSync(TARGET_COMPONENTS_DIR)) {
  console.warn(
    `${colors.yellow}⚠️  UI components directory not found at ${TARGET_COMPONENTS_DIR}. Skipping patches.${colors.reset}`
  );
} else {
  componentsToPatch.forEach(
    ({ name, portalRegex, portalReplacement, skip }) => {
      if (skip) return;

      const filePath = path.join(TARGET_COMPONENTS_DIR, name);
      if (!fs.existsSync(filePath)) {
        return;
      }

      try {
        let content = fs.readFileSync(filePath, "utf8");

        // Check if already patched
        if (content.includes("container={scalerRef.current}")) {
          console.log(
            `${colors.green}✓ ${name} is already patched.${colors.reset}`
          );
          return;
        }

        // Check if file uses Portals that need patching
        if (!portalRegex.test(content)) {
          return;
        }

        // 1. Add Import
        if (!content.includes("useScaler")) {
          const lastImportIndex = content.lastIndexOf("import ");
          const endOfLastImportLine = content.indexOf("\n", lastImportIndex);

          if (endOfLastImportLine !== -1) {
            const importStatement = `import { useScaler } from "@/components/app-scaler"\n`;
            content =
              content.slice(0, endOfLastImportLine + 1) +
              importStatement +
              content.slice(endOfLastImportLine + 1);
          } else {
            content =
              `import { useScaler } from "@/components/app-scaler"\n` + content;
          }
        }

        // 2. Add Hook Call
        const contentName =
          name
            .split(".")[0]
            .split("-")
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join("") + "Content";

        const definitionRegex = new RegExp(
          `const\\s+${contentName}\\s*=\\s*React\\.forwardRef<[^>]+>\\s*\\(\\s*\\({[^}]*},?\\s*ref\\)\\s*=>\\s*{`
        );

        let patched = false;
        if (definitionRegex.test(content)) {
          content = content.replace(definitionRegex, (match) => {
            patched = true;
            return `${match}\n  const { scalerRef } = useScaler()`;
          });
        } else {
          const funcRegex = new RegExp(
            `function\\s+${contentName}\\s*\\({[^}]*}\\)\\s*{`
          );
          if (funcRegex.test(content)) {
            content = content.replace(funcRegex, (match) => {
              patched = true;
              return `${match}\n  const { scalerRef } = useScaler()`;
            });
          } else {
            console.warn(
              `${colors.yellow}- ${name}: Could not locate ${contentName} definition to inject hook.${colors.reset}`
            );
          }
        }

        if (patched) {
          // 3. Patch Portal
          content = content.replace(portalRegex, portalReplacement);
          fs.writeFileSync(filePath, content);
          console.log(`${colors.green}✓ Patched ${name}${colors.reset}`);
        }
      } catch (err) {
        console.error(
          `${colors.red}❌ Error patching ${name}: ${err.message}${colors.reset}`
        );
      }
    }
  );
}

console.log(`\n${colors.cyan}✨ Installation Complete!${colors.reset}`);
console.log(`\n${colors.yellow}👉 Manual Step Required:${colors.reset}`);
console.log(`1. Open ${colors.blue}src/app/layout.tsx${colors.reset}`);
console.log(
  `2. Import AppScaler: ${colors.blue}import { AppScaler } from "@/components/app-scaler"${colors.reset}`
);
console.log(`3. Wrap your children with it:`);
console.log(`${colors.blue}
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppScaler>
          {children}
        </AppScaler>
      </body>
    </html>
  );
}
${colors.reset}\n`);
