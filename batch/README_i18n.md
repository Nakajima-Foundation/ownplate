# i18n Language File Management

This directory contains tooling for managing `src/lang/*.ts` files.

## Files

- `regen_lang.ts` — regenerate a language file from `ja.ts` structure + a translations JSON
- `translate_lang.ts` — machine-translate ja.ts entries to a target language using DeepL or Google Translate API
- `fr_translations.json` — French translation dictionary (reference)
- `{ko,zh-CN,zh-TW,th,vi,id}_translations.json` — placeholder slots (created by translate_lang.ts)

## Source of truth

`src/lang/ja.ts` is the canonical schema. All other language files mirror its structure.

## Typical workflow

### 1. Add a new language

Pick a locale code (e.g. `ko`) and decide on a translator API.

```bash
# Using DeepL (Free plan supports ko, zh, zh-HANT, th, id up to 500k chars/month)
export DEEPL_API_KEY='xxxxx:fx'
npx tsx batch/translate_lang.ts ko > batch/ko_translations.json

# Using Google Translate (covers vi too)
export GOOGLE_TRANSLATE_API_KEY='xxxxx'
TRANSLATE_PROVIDER=google npx tsx batch/translate_lang.ts vi > batch/vi_translations.json

# Then generate the .ts file
npx tsx batch/regen_lang.ts ko batch/ko_translations.json > src/lang/ko.ts
```

### 2. Update an existing language after ja.ts changes

```bash
# Re-run machine translation for new/missing entries
npx tsx batch/translate_lang.ts ko > batch/ko_translations.json.new
# Merge with existing (preserving human-reviewed translations)
# ... manual merge or scripted ...
# Regenerate
npx tsx batch/regen_lang.ts ko batch/ko_translations.json > src/lang/ko.ts
```

`regen_lang.ts` preserves existing translations (when they differ from `en.ts`) — so human-reviewed wordings aren't overwritten.

### 3. Register in vue-i18n

Add to `src/lib/vue-i18n.ts`:
- Import the lang module
- Add to `messages`, `numberFormats`, `datetimeFormats`

Note: `fallbackLocale` is set to `"en"`, so any keys missing in a new locale
(or temporarily left untranslated) fall through to English rather than Japanese.
Verify that any new locale has a complete-enough translation before exposing it
in the language selector.

## API providers and supported languages

| Locale | DeepL | Google Translate |
|--------|-------|------------------|
| ko     | ✅    | ✅               |
| zh-CN  | ✅    | ✅               |
| zh-TW  | ✅    | ✅               |
| th     | ✅    | ✅               |
| id     | ✅    | ✅               |
| vi     | ⚠️*   | ✅               |

*DeepL added Vietnamese in late 2025; check current availability.

Quality-wise, DeepL usually outperforms Google Translate for Asian languages. For production,
**human review by native speakers is strongly recommended** — the machine-translated baseline
should only be considered a starting point.

## Translation protection

`translate_lang.ts` automatically:
- Protects `{placeholder}` tokens so translators don't mangle them
- Skips entries without Japanese characters (brand names, `OwnPlate`, URL patterns, etc.)
- Keeps API-specific HTML tag handling (`tag_handling=xml` for DeepL)

## Cost estimate

Rough character counts:
- 1145 entries × avg 30 chars/entry = ~35,000 chars per language
- DeepL Free: 500,000 chars/month → covers ~14 languages per month, or re-translating all 6
  current inbound locales ~2x per month
- Google Translate: $20 per 1M chars → ~$0.70 per language
