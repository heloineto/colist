# Mobile platform landscape: Expo/RN vs PWA (researched 2026-08-16)

Context: Colist v2 — pt-BR collaborative shopping list, phone-first, today a Next.js 16 + Mantine 8 + Tailwind 4 PWA (no offline writes), being rebuilt as a bun + turborepo monorepo with its own API on AWS.

---

## 1. React Native / Expo state of the art (mid-2026)

- **Current SDK**: Expo SDK 57 (June 30, 2026) on React Native 0.86 + React 19.2. SDK 56 (May 2026) on RN 0.85; SDK 55 (Feb 2026). Expo is exploring shipping non-breaking RN updates as optional upgrades between major SDKs. ([changelog](https://expo.dev/changelog), [SDK 57](https://expo.dev/changelog/sdk-57))
- **New Architecture**: default since SDK 52 / RN 0.76 (Fabric, TurboModules, bridgeless). In 2026 it is simply "the architecture" — the legacy bridge is effectively frozen/deprecated; new libraries target New Arch only. ([expo.dev/sdk/56](https://expo.dev/sdk/56))
- **expo-router**: mature, file-based routing (Next.js-style) for native + web, treated as the default Expo app framework. In SDK 56 Expo **forked React Navigation** into router itself for tighter native primitives (new `Stack.Toolbar` APIs etc. in 57) — a notable architectural shift, so expect some churn in navigation edge cases. ([docs](https://docs.expo.dev/router/introduction/), [SDK 56 notes](https://www.buildmvpfast.com/blog/expo-sdk-56-inline-native-modules-router-fork-new-features-2026))
- **SDK 56 perf work**: precompiled XCFrameworks (much faster iOS builds), ~40% faster Android cold starts, Expo UI (SwiftUI/Jetpack-backed components) declared production-ready.
- **EAS pricing** ([expo.dev/pricing](https://expo.dev/pricing), [billing docs](https://docs.expo.dev/billing/plans/)):
  - Free: ~15 iOS + 15 Android builds/mo, EAS Update to 1,000 MAU, 100 GiB edge bandwidth, 20 GiB storage.
  - Starter $19/mo: 3,000 MAU + usage. Production $199/mo: 50,000 MAU, 1 TiB.
  - On-demand builds ~$1–4/build past quota; bandwidth $0.10/GiB, update storage $0.05/GiB.
  - Build caching (Jan 2026) speeds repeat builds ~30% at no cost. Local builds (`eas build --local`) and bare `expo run` remain free escape hatches; self-hosted OTA servers exist ([example](https://jmensah.hashnode.dev/how-i-built-a-multi-app-ota-update-system-and-cut-costs-from-199-month-to-0)).
- **OTA policy**: JS/asset OTA updates (EAS Update) remain allowed by both stores for bug fixes, perf, and minor UI — as long as the app's core purpose doesn't change outside review and the native layer is untouched. Early-2026 Apple enforcement hit apps that *generate and execute arbitrary code at runtime* (Replit, Vibecode) — not standard EAS Update usage. For a shopping-list app this is a non-issue. ([Bitrise policy explainer](https://bitrise.io/blog/post/what-app-stores-allow-with-ota-updates-apple-and-google-policy-explained), [OtaKit](https://www.otakit.app/blog/ota-policies-for-app-store-and-google-play))

## 2. Expo inside a bun + turborepo monorepo

- **Officially supported.** Expo has a first-party monorepo guide; `expo/metro-config` auto-detects workspaces for **bun, npm, pnpm, yarn** — no manual Metro monorepo config needed. ([docs.expo.dev/guides/monorepos](https://docs.expo.dev/guides/monorepos/))
- **Bun officially supported** by Expo CLI and EAS since Sep 2023; EAS picks the package manager from the lockfile (`bun.lock`), bun is preinstalled on EAS builders, version pinnable in `eas.json`. ([Using Bun guide](https://docs.expo.dev/guides/using-bun/), [changelog](https://expo.dev/changelog/2023-09-25-eas-bun-support))
- **Bun gotchas**:
  - Bun skips lifecycle/postinstall scripts by default — add packages that need them to `trustedDependencies`.
  - Node LTS still required for `bun create expo` / `expo prebuild` (uses `npm pack`).
  - Known EAS edge case detecting bun in monorepos ([eas-cli #2658](https://github.com/expo/eas-cli/issues/2658)); local EAS builds with bun had issues ([#3118](https://github.com/expo/eas-cli/issues/3118)).
- **Monorepo gotchas**: pin `react`/`react-native` once at the workspace root (duplicate copies → Hermes crashes on EAS); forbid reverse deps (shared pkg importing from app) via lint rule; Metro cache + env-inlining Babel plugins can serve stale env values; Jest ignores Metro's resolver (point `moduleDirectories` at the root). ([RN monorepo guide 2026](https://reactnativerelay.com/article/react-native-monorepo-turborepo-expo-2026), [byCedric/expo-monorepo-example](https://github.com/byCedric/expo-monorepo-example), [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo))

## 3. Stack carry-over

**Carries over cleanly (shareable packages in the monorepo):**
- **TanStack Query** — first-class RN support; wire `onlineManager` to NetInfo and `focusManager` to AppState; `persistQueryClient` + AsyncStorage/MMKV gives offline cache, and the mutation-pausing model gives offline writes. (tanstack.com/query docs, React Native page)
- **zod** — platform-agnostic; schemas become a shared package used by API, web, and app.
- **react-hook-form** — works on RN via `<Controller>` (native inputs are controlled); same resolver + zod schemas as web.

**Styling:**
- **NativeWind** — Tailwind for RN. v4 is the stable line; **v5 (Tailwind v4 alignment, CSS variables, `@theme`) is still pre-release as of early 2026** — plan on v4 semantics or accept churn. Best fit for you since Colist web is already Tailwind 4. ([nativewind.dev/v5](https://www.nativewind.dev/v5), [comparison](https://www.pkgpulse.com/guides/nativewind-vs-tamagui-vs-twrnc-react-native-styling-2026))
- **Tamagui** — most powerful universal (native+web) system with optimizing compiler and a full UI kit; steeper learning curve, its own component model replaces Tailwind. ([tamagui.dev](https://tamagui.dev/))
- **RN StyleSheet** — always fine for a small app; zero deps, no Tailwind ergonomics.

**Mantine replacement** (no direct RN equivalent; realistic options):
- **react-native-reusables** — shadcn/ui ported to RN on NativeWind; copy-paste ownership model, actively maintained, the 2026 consensus "shadcn for mobile". Closest to a Mantine-like breadth of polished primitives while staying on Tailwind. ([reactnativereusables.com](https://reactnativereusables.com/), [repo](https://github.com/founded-labs/react-native-reusables))
- **gluestack-ui** (ex-NativeBase) — modular, New-Arch-ready component kit.
- **Tamagui UI kit** — if adopting Tamagui wholesale.
- **react-native-paper** — Material Design look.
- **Expo UI** — real SwiftUI/Jetpack components, production-ready since SDK 56; native-feeling but iOS/Android-divergent by design. ([LogRocket roundup](https://blog.logrocket.com/best-react-native-ui-component-libraries/))

**Icons:** official **`phosphor-react-native`** exists, v3.0.6 (~Apr 2026), maintained. ([npm](https://www.npmjs.com/package/phosphor-react-native), [repo](https://github.com/phosphor-icons/react-native))

## 4. PWA counterpoint in 2026

**iOS:**
- Web Push works since iOS 16.4 (2023) but **only for home-screen-installed apps**; permission must be user-gesture-triggered. >95% of iPhones run iOS 16+. ([MagicBell guide](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide))
- **Install UX is still the weak point**: no `beforeinstallprompt`, no automatic prompt — users must find Share → Add to Home Screen. One improvement: **iOS 26 opens any home-screen-added site as a web app by default**. ([Mobiloud iOS PWA guide](https://www.mobiloud.com/blog/progressive-web-apps-ios))
- **Storage**: since Safari 17, home-screen web apps can use up to ~60% of disk; the 7-day script-writable-storage eviction applies to sites browsed in Safari, and Apple documents home-screen apps as exempt from ITP's 7-day cap — but developers still report edge cases; the Persistent Storage API (tied to notification permission) protects against eviction. Cache API ~50 MB; IndexedDB much larger. Treat client storage as a cache, not a database. ([WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/), [Apple forums](https://developer.apple.com/forums/thread/710157))

**Android:** full PWA support — real install prompts, WebPush, background sync, generous storage. **TWA via Bubblewrap/PWABuilder gets the PWA into Google Play** and works well; this path is mature. ([Mobiloud store-publishing guide](https://www.mobiloud.com/blog/publishing-pwa-app-store))

**App Store:** Apple has no TWA equivalent. PWABuilder's iOS output is a WebView wrapper that frequently fails **Guideline 4.2** ("more than a repackaged website") review; rejection cycles are common. No reliable PWA → App Store path. ([PWABuilder blog](https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/), [Apple forums](https://developer.apple.com/forums/thread/758454))

## 5. The "both" option

- **Expo + react-native-web (one universal codebase)**: Expo Router does file-based web routes with static rendering and RNW is production-usable, but the web output is RN primitives mapped to divs — you will not reach Mantine-grade web polish, SEO, or a11y without significant extra work. Tamagui narrows the gap most (compiles to real CSS) at the cost of adopting its whole system. General 2026 consensus: for a web app that must feel like a first-class web app, Next.js still wins. ([RNW + Expo guide](https://reactnativerelay.com/article/react-native-web-expo-cross-platform-2026))
- **Expo app + thin Next.js web app in one turborepo**: the well-trodden pattern (create-t3-turbo and descendants). Share `packages/` for API client, zod schemas, TanStack Query hooks, domain logic; duplicate only the view layer. NativeWind + react-native-reusables on native and Tailwind + shadcn/Mantine on web keeps the two UI layers stylistically parallel (same tokens/classes). ([create-t3-turbo](https://github.com/t3-oss/create-t3-turbo), [turbo-expo-next-starter](https://github.com/juliusmarminge/turbo-expo-next-starter))
- **Realistic solo-dev cost of "both"**: every feature ships twice at the UI layer (~1.3–1.6x feature cost when logic is shared, more if the web app stays full-featured). Sustainable only if the web app is deliberately thin (landing + read-mostly views + account management) or frozen while the app becomes primary.

## 6. Rough effort comparison (~7-table CRUD app, solo dev)

**Modernize the PWA** (offline writes, push, install UX, TWA):
- Offline writes: TanStack Query persist + mutation queue, or a sync layer — the hardest single piece (~1–2 wks).
- Web Push (already have iOS 16.4+ support): service worker + your API sending pushes (~2–4 days).
- Install UX polish (iOS instructions modal, Android prompt), manifest/icons (~1–2 days).
- TWA → Google Play via Bubblewrap/PWABuilder (~1–2 days + $25 one-time).
- **Total: roughly 2–4 weeks**, staying on the current stack. No App Store presence; iOS install friction remains.

**Rewrite to Expo**:
- Scaffold in monorepo, expo-router nav, auth flow (~1 wk).
- Rebuild ~10–15 screens with a new component vocabulary (Mantine → reusables/gluestack) (~2–4 wks).
- Offline: same TanStack Query work as above, but AsyncStorage/MMKV persistence is more robust than browser storage (~1–2 wks).
- Native push via expo-notifications (easier + more reliable than web push) (~2–3 days).
- EAS setup, store accounts (Apple $99/yr, Google $25), store listings, review cycles (~1 wk, elapsed time longer).
- Decide fate of web (thin Next.js vs Expo web vs none).
- **Total: roughly 6–10 weeks** to store-published parity, plus ongoing dual-platform + store-release overhead (mitigated by OTA updates for JS changes).

Net: the Expo path costs roughly 2–3x the PWA path up front, and buys reliable push, real offline storage, App Store + Play Store presence, and native install/home-screen UX.

---

## Implications for the decision

- Everything below the view layer (zod schemas, TanStack Query, react-hook-form patterns, the new API client) is platform-neutral — build it as shared packages **now** and the platform choice stops being load-bearing for the backend rebuild.
- The bun + turborepo monorepo choice is compatible with either path; Expo supports it officially with minor bun caveats (trustedDependencies, lockfile detection edge cases).
- The real deltas are: iOS install friction + App Store absence (PWA weaknesses) vs 2–3x upfront effort + store/release overhead (Expo costs). Android is a wash — PWA/TWA is excellent there, and Brazil's phone market is heavily Android.
- OTA updates keep an Expo app's iteration speed close to web for JS-only changes; EAS free tier covers a small app's MAU comfortably.
- Mantine does not carry over; the closest continuity path is Tailwind → NativeWind (v4) + react-native-reusables. NativeWind v5 (Tailwind v4 parity) is still pre-release — a mild timing argument against betting on exact Tailwind-4 parity today.

**Recommendation lean (mine, not a decision):** For a phone-first collaborative app in a heavily-Android market, modernize the PWA first (offline writes + push + TWA on Play Store) as part of the v2 rebuild — it's the 2–4 week path and validates the new API. Structure the monorepo so an Expo app can be added later against the same shared packages; go Expo when App Store presence or iOS install/push reliability proves to be an actual user problem rather than a hypothetical one. If App Store presence is already a hard requirement, skip straight to Expo + thin Next.js web and accept the ~1.5x ongoing UI cost.

## Sources

- https://expo.dev/changelog — SDK 55/56/57 release dates, EAS caching
- https://expo.dev/changelog/sdk-57 — RN 0.86, React 19.2, router/toolbar
- https://expo.dev/sdk/56 · https://www.buildmvpfast.com/blog/expo-sdk-56-inline-native-modules-router-fork-new-features-2026 — SDK 56, router fork, Expo UI
- https://docs.expo.dev/router/introduction/
- https://expo.dev/pricing · https://docs.expo.dev/billing/plans/ · https://stalliontech.io/expo-eas-update-pricing
- https://bitrise.io/blog/post/what-app-stores-allow-with-ota-updates-apple-and-google-policy-explained · https://www.otakit.app/blog/ota-policies-for-app-store-and-google-play
- https://docs.expo.dev/guides/monorepos/ · https://docs.expo.dev/guides/using-bun/ · https://expo.dev/changelog/2023-09-25-eas-bun-support
- https://github.com/expo/eas-cli/issues/2658 · https://github.com/expo/eas-cli/issues/3118
- https://github.com/byCedric/expo-monorepo-example · https://github.com/t3-oss/create-t3-turbo · https://github.com/juliusmarminge/turbo-expo-next-starter
- https://reactnativerelay.com/article/react-native-monorepo-turborepo-expo-2026
- https://www.nativewind.dev/v5 · https://tamagui.dev/ · https://www.pkgpulse.com/guides/nativewind-vs-tamagui-vs-twrnc-react-native-styling-2026
- https://reactnativereusables.com/ · https://github.com/founded-labs/react-native-reusables
- https://blog.logrocket.com/best-react-native-ui-component-libraries/
- https://www.npmjs.com/package/phosphor-react-native · https://github.com/phosphor-icons/react-native
- https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide · https://www.mobiloud.com/blog/progressive-web-apps-ios
- https://webkit.org/blog/14403/updates-to-storage-policy/ · https://developer.apple.com/forums/thread/710157
- https://www.mobiloud.com/blog/publishing-pwa-app-store · https://blog.pwabuilder.com/posts/publish-your-pwa-to-the-ios-app-store/ · https://developer.apple.com/forums/thread/758454
- https://reactnativerelay.com/article/react-native-web-expo-cross-platform-2026
