# i18n mechanism for the Vite SPA client

Type: grilling
Status: open

## Question

Current app: inline `t({pt: ..., en: ..., es: ...})` objects, pt-BR default. Platform is now locked ([Mobile platform decision](05-mobile-platform-decision.md)): Vite + TanStack Router SPA, with i18n living in a framework-agnostic `packages/` module so a future Expo app reuses it.

Decide:

- Keep the inline-object pattern (zero deps, typo-safe by construction, but strings scattered through components) vs a library (i18next, Lingui, Paraglide/inlang — compile-time, tree-shaken, TS-safe).
- Locale detection and persistence (browser default vs profile setting; where it's stored).
- Whether translations live in the shared package (Expo-readiness requirement) and what shape keeps them type-safe.
- Do all three locales survive v2, or is pt-BR-only acceptable for the friends-and-family phase with the mechanism ready for more?
