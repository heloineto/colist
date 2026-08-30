# i18n mechanism for the Vite SPA client

Type: grilling
Status: resolved

## Question

Current app: inline `t({pt: ..., en: ..., es: ...})` objects, pt-BR default. Platform is now locked ([Mobile platform decision](05-mobile-platform-decision.md)): Vite + TanStack Router SPA, with i18n living in a framework-agnostic `packages/` module so a future Expo app reuses it.

Decide:

- Keep the inline-object pattern (zero deps, typo-safe by construction, but strings scattered through components) vs a library (i18next, Lingui, Paraglide/inlang — compile-time, tree-shaken, TS-safe).
- Locale detection and persistence (browser default vs profile setting; where it's stored).
- Whether translations live in the shared package (Expo-readiness requirement) and what shape keeps them type-safe.
- Do all three locales survive v2, or is pt-BR-only acceptable for the friends-and-family phase with the mechanism ready for more?

## Answer

Grilled 2026-08-29, two rounds. The "shared `packages/` for Expo" premise is dead — superseded by [Tooling and conventions port](14-tooling-conventions-port.md) (no cross-app sharing); i18n lives entirely in `apps/web`.

### Decisions

- **Library: i18next + react-i18next** (replaces inline `t({pt,en,es})` objects). Resources bundled in the SPA — no `i18next-http-backend`, no `public/locales` fetch (tiny, offline-safe).
- **Locales: `pt` (default) + `en` + `es` all survive.** `supportedLngs: ['pt','en','es']`, `fallbackLng: 'pt'`, `load: 'languageOnly'`.
- **Detection/persistence: `i18next-browser-languagedetector`**, `order: ['localStorage','navigator']`, `caches: ['localStorage']`. Switcher = `i18n.changeLanguage`. No locale on the `user` row, no cookie, **router untouched** — TanStack's URL-prefix pattern (`/{-$locale}/…`) rejected: auth-gated app, no SEO, no shareable localized URLs.
- **API returns codes, never localized text** (zod issue codes, domain error codes, better-auth error `code`); client maps code → key.
- **Type safety**: `locales/pt.ts` is the source of truth (`as const`); `en.ts`/`es.ts` typed against it so a missing key fails `check-types`; `i18next.d.ts` declares `CustomTypeOptions { defaultNS: 'translation'; resources: { translation: typeof pt } }`. TS files, not JSON (JSON doesn't infer literal types).
- **Structure (FSD)**: `src/shared/i18n/{index.ts, i18next.d.ts, locales/{pt,en,es}.ts}`. Single namespace. Keys nested by slice (`lists.create.title`, `activity.itemAdded`). Components use `useTranslation()`; `Trans` only for strings embedding JSX.
- **Activities**: `activity: { itemAdded: '{{actorName}} adicionou {{targetName}}', … } satisfies Record<ActivityAction, string>` — new enum value without a sentence = type error. Render `t(\`activity.${action}\`, { actorName, targetName })`. No grouping. Relative time via native `Intl.RelativeTimeFormat(i18n.language)`. i18next `context` feature not used.
- **Dates**: v2 has no date inputs → **drop `@mantine/dates` and dayjs** (dayjs is only a peer dep of `@mantine/dates`, not core). Display via `Intl.DateTimeFormat` with `pt→pt-BR`, `en→en-US`, `es→es` map; same map feeds `<html lang>`.

### Port notes

- ~236 inline `t({…})` sites across 70 files migrate to keys — mechanical, done per screen during implementation.
- Current `get-language-cookie.ts` (Negotiator + Accept-Language) has no v2 equivalent; the detector's `navigator` step replaces it.
