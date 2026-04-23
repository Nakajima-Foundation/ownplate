/**
 * Translate ja.ts entries to a target language via DeepL or Google Translate API
 * and output a translations JSON consumable by batch/regen_lang.ts.
 *
 * Usage:
 *   DEEPL_API_KEY=... npx tsx batch/translate_lang.ts <targetLang> > batch/<lang>_translations.json
 *   GOOGLE_TRANSLATE_API_KEY=... TRANSLATE_PROVIDER=google npx tsx batch/translate_lang.ts <targetLang> > batch/<lang>_translations.json
 *
 * Examples:
 *   DEEPL_API_KEY=xxx npx tsx batch/translate_lang.ts ko > batch/ko_translations.json
 *   DEEPL_API_KEY=xxx npx tsx batch/translate_lang.ts zh > batch/zh-CN_translations.json
 *   GOOGLE_TRANSLATE_API_KEY=xxx TRANSLATE_PROVIDER=google npx tsx batch/translate_lang.ts vi > batch/vi_translations.json
 *
 * Supported targets (deepl): ko, zh (simplified), zh-HANT (traditional), th, id
 * DeepL does not support Vietnamese — use Google Translate for vi.
 *
 * Tips:
 *   - Placeholders like {count}, {price} are preserved (tags are not translated).
 *   - Brand identifiers (OwnPlate, uid, etc.) are skipped.
 *   - Output is a flat JSON like { "some.path": "translated" }.
 *   - Run regen_lang.ts after to produce src/lang/<lang>.ts.
 */
import ja from "../src/lang/ja";

type Entry = { path: string; value: string };

const flattenJa = (obj: unknown, prefix = ""): Entry[] => {
  const result: Entry[] = [];
  if (obj === null || typeof obj !== "object") return result;
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === "string") {
      result.push({ path, value: val });
    } else if (val !== null && typeof val === "object") {
      result.push(...flattenJa(val, path));
    }
  }
  return result;
};

// Heuristics for things we don't want to send to a translator
const shouldSkip = (entry: Entry): boolean => {
  const { value } = entry;
  // Empty values
  if (!value) return true;
  // No Japanese characters → brand names, URLs, identifiers, placeholders;
  // safer to keep as-is than to round-trip through a translator.
  const hasJa = /[぀-ヿ㐀-鿿]/.test(value);
  if (!hasJa) return true;
  return false;
};

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error(
    "Usage: npx tsx batch/translate_lang.ts <targetLang> > batch/<lang>_translations.json",
  );
  process.exit(1);
}
const targetLang = args[0];
const provider = (process.env.TRANSLATE_PROVIDER || "deepl").toLowerCase();

// Map our locale codes to provider-specific codes
const deeplLangMap: Record<string, string> = {
  ko: "KO",
  "zh-CN": "ZH",
  zh: "ZH",
  "zh-TW": "ZH-HANT",
  "zh-HANT": "ZH-HANT",
  th: "TH",
  id: "ID",
  vi: "VI", // DeepL added VI later; check current availability
};

const googleLangMap: Record<string, string> = {
  ko: "ko",
  "zh-CN": "zh-CN",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  "zh-HANT": "zh-TW",
  th: "th",
  id: "id",
  vi: "vi",
};

// -------------------- DeepL --------------------
const deeplTranslate = async (
  texts: string[],
  target: string,
): Promise<string[]> => {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY is not set");
  const targetCode = deeplLangMap[target];
  if (!targetCode) throw new Error(`Unsupported target lang for DeepL: ${target}`);

  // DeepL allows batching via repeated "text" params.
  const url = apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const form = new URLSearchParams();
  form.append("auth_key", apiKey);
  form.append("source_lang", "JA");
  form.append("target_lang", targetCode);
  form.append("tag_handling", "xml");
  form.append("ignore_tags", "x");
  for (const t of texts) form.append("text", t);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) {
    throw new Error(`DeepL request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { translations: { text: string }[] };
  return json.translations.map((t) => t.text);
};

// -------------------- Google Translate --------------------
const googleTranslate = async (
  texts: string[],
  target: string,
): Promise<string[]> => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_TRANSLATE_API_KEY is not set");
  const targetCode = googleLangMap[target];
  if (!targetCode)
    throw new Error(`Unsupported target lang for Google: ${target}`);

  // Google Translate v2 supports up to 128 q params per request.
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "ja",
      target: targetCode,
      format: "text",
      q: texts,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as {
    data: { translations: { translatedText: string }[] };
  };
  return json.data.translations.map((t) => t.translatedText);
};

// Protect placeholders like {count}, {price} by wrapping with tags.
// DeepL respects XML tags with ignore_tags=x.
// When tag_handling=xml is on, DeepL parses the input as XML so any literal
// <, >, & in the source must be entity-escaped; otherwise the request fails
// with "Tag handling parsing failed".
const escapeXml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unescapeXml = (s: string): string =>
  s.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
const protectPlaceholders = (s: string): string =>
  escapeXml(s).replace(/\{([^}]+)\}/g, "<x>{$1}</x>");
const unprotectPlaceholders = (s: string): string =>
  unescapeXml(s.replace(/<\/?x>/g, ""));

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

(async () => {
  const entries = flattenJa(ja);
  const toTranslate = entries.filter((e) => !shouldSkip(e));
  console.error(
    `Translating ${toTranslate.length}/${entries.length} entries to ${targetLang} via ${provider}...`,
  );

  const texts = toTranslate.map((e) =>
    provider === "deepl" ? protectPlaceholders(e.value) : e.value,
  );

  const batchSize = provider === "deepl" ? 50 : 100;
  const translated: string[] = [];
  for (const group of chunk(texts, batchSize)) {
    const fn = provider === "deepl" ? deeplTranslate : googleTranslate;
    const res = await fn(group, targetLang);
    if (res.length !== group.length) {
      throw new Error(
        `${provider} returned ${res.length} translations for a batch of ${group.length} (target=${targetLang}, batch starting at index ${translated.length}). Aborting to avoid misaligned output.`,
      );
    }
    translated.push(...res);
    console.error(`  ${translated.length}/${texts.length}`);
  }

  const out: Record<string, string> = {};
  toTranslate.forEach((e, i) => {
    let t = translated[i];
    if (provider === "deepl") t = unprotectPlaceholders(t);
    out[e.path] = t;
  });

  process.stdout.write(JSON.stringify(out, null, 2) + "\n");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
