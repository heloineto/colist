# Feature-parity checklist — current colist (enumerated 2026-08-30)

Raw inventory of the current Next.js/Supabase app, grouped by area. Lines marked (WIP)/(stub)/(bug) are half-finished today. Each ticket 18 phase pulls its slice from here; decisions on what is dropped live in the map/tickets (presence, push, Sentry, Tiptap, dayjs, email reset, TUS/Uppy).

## Routes & shell
- [ ] `/` → `/app` redirect (app/page.tsx:3-5)
- [ ] `/app` main list screen (app/app/page.tsx:5-12)
- [ ] `/auth` sign-in/sign-up (app/auth/page.tsx:13-38)
- [ ] `/auth/callback` code exchange (app/auth/callback/route.ts:5-19)
- [ ] `/~offline` SW fallback, untranslated (WIP) (app/~offline/page.tsx:7-14)
- [ ] `/test` scratch page (stub) (app/test/page.tsx)
- [ ] Responsive AppShell: header + list tabs, desktop navbar, mobile footer bar (app-sell.tsx:24-53)
- [ ] Desktop hover-expanding navbar (navbar.tsx:36-50)
- [ ] "Alpha" badge + version label (header.tsx:33-35, more-options-button.tsx:188-190)

## Auth
- [ ] Email+password sign-in, error toast (deprecated/packages/supabase/sign-in.ts:19-55)
- [ ] Email+password sign-up with name; email confirmation (sign-up.ts:28-81) — v2: no email
- [ ] Sliding sign-in/sign-up panel switch (forms-wrapper.tsx:19-143)
- [ ] Password-strength popover on sign-up (sign-up-form.tsx:94-113)
- [ ] "Remember me" rendered, unimplemented (WIP) (sign-in-form.tsx:56-64)
- [ ] Password reset form disabled (sign-in-form.tsx:65-79) — v2: manual via WhatsApp
- [ ] No Google login today — v2 adds it (ticket 08)
- [ ] Dev-only prefilled creds (sign-in-form.tsx:28-29)
- [ ] Sign-out from user menu → `/auth` (sign-out-button.tsx:16-21)
- [ ] Route protection: unauth → `/auth`, auth on public → `/app` (lib/supabase/proxy.ts:46-99)
- [ ] Auth screen: copyright, color-scheme toggle, language picker (copyright-notice.tsx:16-35)

## Lists
- [ ] Create list (creator = owner) (use-create-list-mutation.ts:28-33)
- [ ] Rename list (more-options-button.tsx:66-84)
- [ ] Delete list w/ confirm; menu shown to non-owners (bug) (more-options-button.tsx:105-114)
- [ ] List form = Drawer desktop / fullscreen Modal mobile (list-form.tsx:68-99)
- [ ] Name required min 1, localized (list-form-context.ts:14-21)
- [ ] Unsaved-changes discard confirm on forms (create-disclosure-db-form-context.tsx:93-120)
- [ ] Scrollable alphabetical list tabs + "+ Nova lista" (list-tabs.tsx:30-91)
- [ ] Selected list persisted (cookie 365d) (list-context.tsx:38-42)
- [ ] Auto-select first / auto-deselect vanished list (list-tabs.tsx:16-27)
- [ ] Per-tab unchecked count badge (unchecked-items-indicator.tsx:11-29)
- [ ] Slide animation between lists (lists.tsx:24-105)
- [ ] Empty states: no list / none selected (lists.tsx:35-83)
- [ ] No "leave list" UI today — v2 adds it (ticket 10 owner exit → auto-promote)

## Sharing & members
- [ ] Header avatar group ≤4 + "+N" tooltip (share.tsx:28,91-157)
- [ ] "Convidar" button when single member (share-button.tsx:22-30)
- [ ] Members modal: avatar, name, email, role badge (share-modal.tsx:29-68)
- [ ] Owner crown badge (role-badge.tsx:10-39)
- [ ] Add member by email: lookup, duplicate guard, not-found toast (share-form.tsx:23-93)
- [ ] Profile preview modal before confirm (profile-modal-content.tsx:21-95)
- [ ] Remove member w/ confirm, disabled for owner (member.tsx:86-148)
- [ ] Add/remove UI only for owner (share-modal.tsx:22-27)
- [ ] Deterministic initials + color avatars (share/utils/get-initials.ts, get-color.ts)
- [ ] No ownership transfer UI — v2: auto-promote only

## Items
- [ ] Add item bottom Drawer: name, details, amount, category (item-form.tsx:36-118)
- [ ] Edit item by tapping row (item.tsx:32-35)
- [ ] Check/uncheck, no toast (item.tsx:22-26, items.tsx:34-39)
- [ ] Amount badge → quantity modal, saves on close (item.tsx:60-69, item-amount-modal.tsx:12-30)
- [ ] Quantity modal −/+ min 1 integers (amount-modal.tsx:39-67)
- [ ] Details textarea toggle, clears when collapsed (details-button.tsx:33-41)
- [ ] Details second line, taller row (item.tsx:49-56, get-item-height.ts:3-8)
- [ ] Delete item w/ confirm (delete-item-button.tsx:22-49)
- [ ] Submit Add/Save, disabled on empty name (submit-item-button.tsx:20-35)
- [ ] "No list selected" guard; footer AddButton condition inverted (bug) (add-button.tsx:37-48)
- [ ] "Completados (N)" accordion, auto-open rules (items.tsx:48-97)
- [ ] Row enter/exit animation (normal-items.tsx:12-26)
- [ ] Search name+details, 300ms debounce, highlight (list.tsx:31-49, item.tsx:39-56)
- [ ] Search affix slide-down, focus trap, clear on close (search-affix.tsx:17-50)
- [ ] Sort Name/Modified × asc/desc; Modified broken today (bug) — v2 `updated_at` fixes (sort-button.tsx:43-78)
- [ ] Group None/Category, "Sem categoria" last (grouped-items.tsx:17-118)
- [ ] Sort/group persisted (cookie 365d) (providers.tsx:73-82)
- [ ] Skeletons + localized error state (list.tsx:65-92)
- [ ] Empty states: no items vs no search results (list.tsx:93-123)
- [ ] No drag reorder (not in scope)

## Categories
- [ ] Picker modal, searchable, alphabetical (category-modal-content.tsx:30-89)
- [ ] Create inline from search text, auto-assign (category-create-button.tsx:50-73)
- [ ] Radio select closes modal (category-radio-group.tsx:49-56)
- [ ] Delete category w/ confirm (category-radio-group.tsx:42-46)
- [ ] Selected name next to tag icon (category-button.tsx:60-64)
- [ ] Empty states none/no-match (category-radio-group.tsx:87-135)
- [ ] Category rename — missing (WIP) — v2 adds (ticket 10)
- [ ] Accented sort broken (WIP) — v2 ICU collation fixes (ticket 10)

## History / activities
- [ ] History drawer/modal, permanent empty state, hidden (WIP) (history-button.tsx:11-78) — v2 implements (ticket 10)

## Feedback & error reporting
- [ ] Feedback modal from footer/navbar/more-options (feedback-button.tsx:25-37)
- [ ] Two-tab Feedback/Report error, sliding, preselectable (feedback-modal-content.tsx:50-115)
- [ ] Feedback: required 1-5 stars w/ labels + optional message (feedback-form.tsx:45-110)
- [ ] Error: required description, serialized error, contact consent (error-form.tsx:51-129)
- [ ] Rich-text Tiptap editor (simple-rich-text-input.tsx:56-80) — v2: plain textarea (ticket 10)
- [ ] `files` attachments, no upload UI (WIP) — v2: S3 presigned PUT (ticket 10)
- [ ] Auto-capture uncaught errors (FUTURE comment) — v2 implements (ticket 16)
- [ ] NPS 0-10 form unused (stub) — drop

## Profile & settings
- [ ] User menu modal from header avatar (user-menu.tsx:19-55)
- [ ] User card avatar/name/email (user-card.tsx:93-99)
- [ ] Quick avatar change from card (user-card.tsx:70-91)
- [ ] "Editar perfil": name + avatar (profile-form.tsx:35-99)
- [ ] Avatar upload Uppy/TUS w/ webcam + editor (uploader.tsx:55) — v2: plain file input + presigned PUT (ticket 06)
- [ ] Avatar add/update/remove menu (avatar-input.tsx:68-90)
- [ ] Light/dark toggle (color-theme-toggle.tsx:14-48)
- [ ] Primary color picker, cookie, no-flash (primary-color-select.tsx:8-17, providers.tsx:84-111)
- [ ] Avatar loading/error placeholders (user-menu.tsx:26-27)

## i18n
- [ ] pt/en/es (translate.tsx) — v2 i18next (ticket 15)
- [ ] Language select in user menu + auth screen (language-select.tsx:10-33)
- [ ] Language persisted (cookie) — v2 localStorage
- [ ] Accept-Language negotiation, pt fallback (get-language-cookie.ts:5-20) — v2 navigator detection
- [ ] dayjs/Mantine dates locale — v2 dropped, `Intl`

## PWA & offline
- [ ] Serwist SW precache/skipWaiting/clientsClaim (app/sw.ts:15-33) — v2 vite-plugin-pwa
- [ ] Navigation fallback `/~offline` (app/sw.ts:23-31)
- [ ] Manifest standalone/portrait/icons/`#2b8a3e` (public/manifest.json)
- [ ] Full icon set + browserconfig (public/)
- [ ] Apple web-app meta, OG, Twitter, theme color, no user-scalable (app/layout.tsx:23-69)
- [ ] No install prompt handling
- [ ] No offline write queue — v2 adds (ticket 09)

## Realtime, notifications, data layer
- [ ] Realtime on items/lists/members → refetch (list.tsx:51-61, list-context.tsx:56-70, share.tsx:46-59) — v2 SSE (ticket 09)
- [ ] Global mutation toasts loading→success→error, per-mutation opt-out (create-query-client.tsx:32-101)
- [ ] Global query-error toasts (create-query-client.tsx:19-31)
- [ ] Notifications bottom-center mobile (notifications.tsx:8-18)
- [ ] Reusable delete-confirm context modal (providers.tsx:36-39)
- [ ] `QueryBoundary` loading/error/empty wrapper (query-boundary.tsx)
