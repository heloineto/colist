# E2E convention

One `test/<resource>.e2e-spec.ts` per resource, one top-level `describe` per route named `METHOD /api/path`. Order inside a route: auth → validation → happy path → variants.

```ts
describe('POST /api/lists/:listId/items', () => {
  it('returns 404 for non-members', ...); // 1. guards (member / owner / non-member matrix)
  it('returns 400 on negative amount', ...); // 2. validation
  it('creates with defaults', ...); // 3. happy path
  it('is idempotent on clientId', ...); // 4. variants
});
```

## Own your data

No truncation, no sequential project. Every test signs up its own users (`signUp(app)` → real better-auth sign-up, cookie'd `supertest.agent`) and creates its own lists (`createSharedList(app)` → owner + member + outsider). Memberships scope everything, so parallel files never see each other.

## Authorization matrix

Every list-scoped route asserts **non-member → 404**, and **member → 403** where the route is owner-only. Non-members can't tell "no such list" from "not yours".

## Own-app specs

Global-state behavior boots its own app: `errors-throttle.e2e-spec.ts` (`createTestApp({ throttle })`), `events.e2e-spec.ts` (listens on a real port for SSE).

## Factories

Request bodies come from fishery factories in `src/<ctx>/test/<ctx>.mock.ts` (`createItemDtoFactory`, …). Domain-object factories only when a unit test needs one.
