/**
 * Regenerate a language file from ja.ts structure + a translations JSON.
 *
 * Usage:
 *   npx tsx batch/regen_lang.ts <langCode> <translationsJsonPath>
 *
 * Example:
 *   npx tsx batch/regen_lang.ts ko batch/ko_translations.json > src/lang/ko.ts
 *
 * Behavior:
 *   - Uses ja.ts structure as the canonical schema
 *   - For each leaf path:
 *     1. If the existing language file has a non-empty translation that
 *        differs from en.ts, keep it (preserve manual translations)
 *     2. Otherwise, use the translations JSON if it has the path
 *     3. Otherwise, fall back to en.ts
 *     4. Otherwise, fall back to ja.ts value
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ja from "../src/lang/ja";
import en from "../src/lang/en";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: npx tsx batch/regen_lang.ts <langCode> <translationsJsonPath>");
  process.exit(1);
}
const [langCode, translationsJsonPath] = args;

const translations = JSON.parse(
  fs.readFileSync(translationsJsonPath, "utf-8"),
) as Record<string, unknown>;

// Optional existing language file
const existingLangPath = path.join(
  __dirname,
  "..",
  "src",
  "lang",
  `${langCode}.ts`,
);
let existingLang: Record<string, unknown> = {};
if (fs.existsSync(existingLangPath)) {
  try {
    const mod = (await import(existingLangPath)) as {
      default: Record<string, unknown>;
    };
    existingLang = mod.default;
  } catch {
    existingLang = {};
  }
}

const getPath = (obj: unknown, pathStr: string): unknown => {
  const parts = pathStr.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return cur;
};

const escapeString = (s: string): string => {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
};

const serialize = (obj: unknown, indent = 0): string => {
  if (obj === null) return "null";
  if (typeof obj === "string") return `"${escapeString(obj)}"`;
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "boolean") return String(obj);
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    const items = obj.map((v) => serialize(v, indent + 1));
    const pad = "  ".repeat(indent + 1);
    const padClose = "  ".repeat(indent);
    return `[\n${items.map((i) => pad + i).join(",\n")},\n${padClose}]`;
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    const pad = "  ".repeat(indent + 1);
    const padClose = "  ".repeat(indent);
    const lines = entries.map(([k, v]) => {
      const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)
        ? k
        : `"${escapeString(k)}"`;
      return `${pad}${keyStr}: ${serialize(v, indent + 1)}`;
    });
    return `{\n${lines.join(",\n")},\n${padClose}}`;
  }
  return "undefined";
};

const build = (jaObj: unknown, prefix = ""): unknown => {
  if (jaObj === null) return null;
  if (typeof jaObj !== "object") {
    const existingVal = getPath(existingLang, prefix);
    const enVal = getPath(en, prefix);
    const addVal = translations[prefix];

    // If existing translation exists and differs from en, preserve it
    if (
      existingVal !== undefined &&
      existingVal !== "" &&
      existingVal !== enVal
    ) {
      return existingVal;
    }
    // Use translations JSON
    if (addVal !== undefined) return addVal;
    // Keep existing even if == en (covers brand names, universal words)
    if (existingVal !== undefined) return existingVal;
    // Fall back to en
    if (enVal !== undefined) return enVal;
    // Last resort: ja value
    return jaObj;
  }
  if (Array.isArray(jaObj)) {
    return jaObj.map((v, i) => build(v, `${prefix}[${i}]`));
  }
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(jaObj as Record<string, unknown>)) {
    const subPath = prefix ? `${prefix}.${key}` : key;
    result[key] = build((jaObj as Record<string, unknown>)[key], subPath);
  }
  return result;
};

const built = build(ja);
const code = `const data = ${serialize(built, 0)};\n\nexport default data;\n`;
process.stdout.write(code);
