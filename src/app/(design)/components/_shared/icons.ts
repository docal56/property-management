import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type IconFile = { name: string; svg: string };

export function loadIcons(): IconFile[] {
  const iconsDir = path.join(process.cwd(), "src/components/icons");
  const iconFiles = readdirSync(iconsDir)
    .filter((f) => f.endsWith(".svg"))
    .sort();
  return iconFiles.map((f) => ({
    name: f.replace(/\.svg$/, ""),
    svg: readFileSync(path.join(iconsDir, f), "utf-8"),
  }));
}

export function loadDemoIconSvg(): string {
  const iconsDir = path.join(process.cwd(), "src/components/icons");
  return readFileSync(path.join(iconsDir, "activity.svg"), "utf-8");
}

export function sizedIcon(demoSvg: string, px: number): string {
  return demoSvg
    .replace(/width="\d+(\.\d+)?"/, `width="${px}"`)
    .replace(/height="\d+(\.\d+)?"/, `height="${px}"`);
}

export function strokedIcon(demoSvg: string, width: string): string {
  return demoSvg.replace(/stroke-width="[^"]+"/g, `stroke-width="${width}"`);
}
