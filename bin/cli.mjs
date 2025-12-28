#!/usr/bin/env node

import fs from "fs";
import path from "path";

// Configuration
const TARGET_COMPONENTS_DIR = path.join(
  process.cwd(),
  "src",
  "components",
  "ui"
);

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
  `${colors.cyan}🚀 Starting Scaled Sandbox Patcher...${colors.reset}\n`
);

// Check if src/components/ui exists
if (!fs.existsSync(TARGET_COMPONENTS_DIR)) {
  console.error(
    `${colors.red}❌ Could not find 'src/components/ui'. Are you in the root of your Next.js project?${colors.reset}`
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
  // Command typically doesn't need direct patching if it lives in a Dialog
];

console.log(`${colors.blue}🔧 Patching UI Components...${colors.reset}`);

componentsToPatch.forEach(({ name, portalRegex, portalReplacement }) => {
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

    // 1. Add Import (FROM NPM PACKAGE)
    if (!content.includes("useScaler")) {
      const lastImportIndex = content.lastIndexOf("import ");
      const endOfLastImportLine = content.indexOf("\n", lastImportIndex);

      // Import from the library name defined in package.json
      const importStatement = `import { useScaler } from "next-app-scaler"\n`;

      if (endOfLastImportLine !== -1) {
        content =
          content.slice(0, endOfLastImportLine + 1) +
          importStatement +
          content.slice(endOfLastImportLine + 1);
      } else {
        content = importStatement + content;
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
});

console.log(`\n${colors.cyan}✨ Setup Complete!${colors.reset}`);
console.log(`\n${colors.yellow}👉 Manual Step Required:${colors.reset}`);
console.log(`1. Open ${colors.blue}src/app/layout.tsx${colors.reset}`);
console.log(
  `2. Import AppScaler: ${colors.blue}import { AppScaler } from "next-app-scaler"${colors.reset}`
);
console.log(`3. Wrap your children with it as the first child of <body>.`);
console.log(`\nHappy coding! 🚀`);
