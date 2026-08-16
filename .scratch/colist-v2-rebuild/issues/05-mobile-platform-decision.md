# Mobile platform decision

Type: grilling
Status: open
Blocked by: 02, 04

## Question

React Native (Expo) vs staying a Next.js PWA vs both — the fork everything client-side hangs on.

Weigh with the user (`/grilling`):
- Colist is phone-first (bottom footer, drawers, portrait manifest) but currently reaches users with zero install friction via URL.
- RN unlocks push notifications, real offline, app-store presence; costs: new UI layer (Mantine doesn't port), store accounts/review, EAS or self-managed builds.
- PWA keeps the Mantine+Tailwind investment and Vercel simplicity; iOS PWA limits are the recurring pain.
- If RN: does a web client survive at all (landing page only? react-native-web?), and what happens to the current Vercel deployment?

Downstream: offline strategy (Realtime and offline strategy), UI kit, i18n, distribution, CI (EAS), Vercel fate.
