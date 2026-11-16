# Research: better-auth as MCP authorization server + MCP in NestJS

Ticket: `issues/04-research-better-auth-oauth-and-nest-mcp.md`. Researched 2026-11-15.
Sources: better-auth docs and package source at tag `v1.7.25`, npm registry, published tarballs of `@better-auth/mcp`, `@better-auth/oauth-provider`, `@better-auth/cimd`, `better-call`, `@modelcontextprotocol/{server,node,express}`, `@rekog/mcp-nest`, and Claude's connector auth docs.

Repo today: `better-auth` 1.7.2 installed (`apps/api/node_modules/better-auth/package.json`), lockfile has `better-call@1.4.0`, `@better-fetch/fetch@1.3.1`.

## 1. Which plugin: `mcp` vs `oauthProvider` vs `oidcProvider`

| Plugin | Status in 1.7.x | Package |
| --- | --- | --- |
| `oidcProvider` | **Removed** in 1.7.0 ("Move OIDC authorization-server integrations to `@better-auth/oauth-provider`") | none |
| old `mcp` (`better-auth/plugins`, `withMcpAuth`, `getMcpSession`, `oauthApplication` table) | **Moved out** in 1.7.0. Not exported from `better-auth` 1.7.x any more | none |
| `oauthProvider()` | Current generic OAuth 2.1 / OIDC provider | `@better-auth/oauth-provider` |
| `mcp()` | **Current, recommended for MCP.** It *is* `oauthProvider()` preconfigured for MCP (resource binding + RFC 9728 metadata). Do not register both | `@better-auth/mcp` (+ `@better-auth/cimd`) |

- 1.7.0 release (2026-08-18): "Moved the MCP plugin into its own `@better-auth/mcp` package built on the OAuth provider ... Rename `withMcpAuth` to `requireMcpAuth` and `mcpHandler` to `createMcpProtectedRequestHandler`" and "Removed the deprecated `oidcProvider` plugin". Also "`mcp()` no longer enables unauthenticated DCR: compose it with `cimd()` or enable both DCR flags explicitly". [release v1.7.0](https://github.com/better-auth/better-auth/releases/tag/v1.7.0)
- Versions (npm, 2026-11-15): `better-auth`, `@better-auth/mcp`, `@better-auth/oauth-provider`, `@better-auth/cimd` all `latest = 1.7.25` (published in lockstep; `beta = 1.8.0-beta.10`).
- **Peer deps are lockstep**: `@better-auth/mcp@1.7.25` peers `better-auth ^1.7.25`, `@better-auth/core ^1.7.25`, `better-call ~1.4.5`; oauth-provider also peers `@better-fetch/fetch 1.3.3` (exact). So Colist must bump `better-auth` 1.7.2 to 1.7.25 together with these. (`npm view @better-auth/mcp@1.7.25 peerDependencies`)
- `jwt()` plugin is **required** (signs access/ID tokens, serves `/jwks`). Docs say disable its `/token` route and header: `disabledPaths: ["/token"]`, `jwt({ disableSettingJwtHeader: true })`. [docs/plugins/mcp](https://www.better-auth.com/docs/plugins/mcp)
- All better-auth packages are ESM-only (`.mjs` exports). Already works in this CJS Nest build (Node 24 `require(esm)`), same as `better-auth` itself.

## 2. `mcp()` capabilities

Config ([docs/plugins/mcp](https://www.better-auth.com/docs/plugins/mcp), [source](https://github.com/better-auth/better-auth/tree/v1.7.25/packages/mcp/src)):

```ts
import { jwt } from 'better-auth/plugins';
import { mcp } from '@better-auth/mcp';
import { cimd } from '@better-auth/cimd';
import { fetchClientMetadataResource } from '@better-auth/cimd/node';

betterAuth({
  disabledPaths: ['/token'],
  plugins: [
    jwt({ disableSettingJwtHeader: true }),
    mcp({ loginPage: '/auth', consentPage: '/oauth/consent', resource: 'https://colist.heloineto.com/api/mcp' }),
    cimd({ fetchClientMetadataResource, metadataProfile: 'mcp-2026-07-28' }),
  ],
});
```

| Concern | Fact |
| --- | --- |
| Endpoints | `/oauth2/authorize`, `/oauth2/token`, `/oauth2/userinfo`, `/oauth2/register` (only if DCR enabled), plus `/oauth2/consent`, `/oauth2/continue`, `/oauth2/revoke`, `/oauth2/introspect`, all under `basePath` (`/api/auth`) |
| Client registration | **CIMD** via `cimd()` (recommended; MCP 2026-07-28 "deprecates DCR"). **DCR** opt-in: `allowDynamicClientRegistration: true` + `allowUnauthenticatedClientRegistration: true` (+ `clientRegistrationDefaultApplicationType: 'infer'` for loopback/custom-scheme clients). `@better-auth/cimd/node` ships an SSRF-safe fetch (DNS pin, no redirects, rejects private IPs) [docs/plugins/cimd](https://www.better-auth.com/docs/plugins/cimd) |
| CIMD and Claude | With `cimd()` installed, AS metadata advertises `client_id_metadata_document_supported: true` and adds `none` to `token_endpoint_auth_methods_supported` (`buildAuthServerMetadata`: `publicClientSupported = allowUnauthenticatedClientRegistration \|\| clientDiscoveries.length > 0`). Those are exactly the two values Claude needs to pick CIMD over DCR [claude.com connector auth](https://claude.com/docs/connectors/building/authentication.md) |
| PKCE | Required, `S256` only |
| Resource / audience | RFC 8707. `resource` must be HTTPS, no query/fragment. Issued JWT `aud` = resource. `mcp()` auto-links every registered/CIMD client to the resource (`clientRegistrationDefaultResources`) |
| Token format | **JWT** (RFC 9068, `typ: at+jwt`, has `azp`) when the request names a `resource` and `jwt()` is on; otherwise opaque. MCP clients send `resource`, so JWT. [resource-server](https://www.better-auth.com/docs/plugins/oauth-provider/resource-server#jwt-or-opaque-tokens) |
| Lifetimes | access 3600s, refresh 30d, code 600s (tunable; per-resource `accessTokenTtl`) |
| Refresh tokens | Issued with `offline_access`. Rotating; replay revokes family. `mcp()` defaults `refreshTokenReuseInterval: 30` (retry window). Docs advise `0` unless clients lose refresh responses [tokens](https://www.better-auth.com/docs/plugins/oauth-provider/tokens#refresh-tokens) |
| Scopes | Default `["openid","profile","email","offline_access"]`. PRM `scopes_supported` lists only non-OIDC scopes (filters `openid/profile/email/phone/address/offline_access`). `requireMcpAuth({ requiredScopes })` returns 403 `insufficient_scope`; `createInsufficientScopeError` for per-tool step-up |
| DPoP | Supported, optional; enforced only for DPoP-bound tokens |
| Body parsing | `/oauth2/token` and `/oauth2/authorize` accept `application/x-www-form-urlencoded` (route `allowedMediaTypes`), which Claude requires. Works because better-auth reads the raw body before Nest's JSON parser |

### Login + consent with an SPA

[sign-in-flow](https://www.better-auth.com/docs/plugins/oauth-provider/sign-in-flow)

- `/oauth2/authorize` redirects to `loginPage` (no session) then `consentPage` (no stored consent covering scopes/resources), each with the original params as a **signed query** (`sig`, expires after `codeExpiresIn`). Paths are relative, so same-origin `/auth` and `/oauth/consent` land on the SPA via Caddy's `try_files`.
- SPA adds `oauthProviderClient()` from `@better-auth/oauth-provider/client` to `createAuthClient`. It appends `oauth_query` (from `window.location.search`) to every non-GET auth call. After `signIn.email` creates a session, the server's after-hook runs authorize again and returns `{ redirect: true, url }`; the client follows it. **Google works too**: `/sign-in/social` stores the query in OAuth state and resumes after the callback (`addOAuthServerContext`, oauth-provider source).
- Consent page: read `client_id`, `scope` from the URL, show client via `GET /oauth2/public-client?client_id=` (`getOAuthClientPublic`, session required; `allowPublicClientPrelogin` enables a pre-login variant), show the `redirect_uri` host, then `authClient.oauth2.consent({ accept, scope? })` which redirects. Docs suggest verifying the signed query server-side (`verifyOAuthQueryParams`) before rendering; an SPA can skip that since `/oauth2/consent` re-verifies the signature.

### Well-known metadata

- Issuer = `baseURL` incl. basePath = `https://colist.heloineto.com/api/auth`.
- AS metadata (RFC 8414) path = `/.well-known/oauth-authorization-server/api/auth` (root, issuer-path-inserted) and `/api/auth/.well-known/oauth-authorization-server`. OIDC: `/api/auth/.well-known/openid-configuration`. Helper: `oauthProviderAuthServerMetadata(auth)` (fetch-shaped `GET`). [oauth-provider index](https://www.better-auth.com/docs/plugins/oauth-provider)
- PRM (RFC 9728): `mcp()`'s `onRequest` serves `/.well-known/oauth-protected-resource` and `/.well-known/oauth-protected-resource/api/mcp` with `resource`, `authorization_servers: [issuer]`, `scopes_supported`.
- **Both are served by the auth handler's `onRequest` hooks, which run before better-call's basePath 404** (`better-call/dist/router.mjs`: `handler` calls `config.onRequest` first, then `processRequest` 404s paths outside basePath). So routing root `/.well-known/*` into `toNodeHandler(auth)` is enough; no extra helpers needed. better-call's node adapter rebuilds the URL as `req.baseUrl + req.url` when that equals `originalUrl`, so `app.use('/.well-known', toNodeHandler(auth))` passes the full path.

### Validating the bearer token

- `requireMcpAuth(auth, handler, { resource, requiredScopes? })` (`@better-auth/mcp`): fetch-shaped `(Request) => Promise<Response>`. Verifies signature (keys read **in-process** from the auth instance, cached 5 min), `iss`, `aud`, `exp`, requires `azp`, DPoP if bound. On failure returns JSON-RPC 401 with `WWW-Authenticate: Bearer resource_metadata=...` (what Claude needs to start OAuth). Passes verified `JWTPayload` (`sub` = user id) to `handler(request, claims)`. Pass `resource` explicitly: the default is the auth baseURL. [docs/plugins/mcp#protecting-an-mcp-route](https://www.better-auth.com/docs/plugins/mcp)
- Lower level: `verifyAccessTokenRequest` (`better-auth/oauth2`) + `createResourceServerChallenge` (`@better-auth/oauth-provider`), or `oauthProviderResourceClient(auth)`. Use `typ: 'at+jwt'`, `requiredClaims: ['azp']`, explicit `audience`, otherwise a session JWT from `jwt()` could pass. [resource-server](https://www.better-auth.com/docs/plugins/oauth-provider/resource-server)
- JWT access tokens are not revocable; they live until `exp`. A JWT with `sid` dies when that session ends, but `offline_access` refresh tokens survive session deletion.

### DB tables

`mcp()` uses the oauth-provider schema: `oauthClient`, `oauthAccessToken`, `oauthRefreshToken`, `oauthConsent`, `oauthClientAssertion`, `oauthResource`, `oauthClientResource`; plus `jwks` from `jwt()`. Generate with `npx auth generate` (CLI package `auth@1.7.25`; `@better-auth/cli` is deprecated on npm), then merge into `iam.schema.ts`, pass the tables in `drizzleAdapter(db, { schema })`, and `bun run gen:migration`. [reference#schema](https://www.better-auth.com/docs/plugins/oauth-provider/reference#schema). `oauthClient.clientId` holds CIMD URLs, so it must be text (not uuid); `id` stays uuid with `generateId: 'uuid'`. Resources in config are seeded into `oauthResource` at startup (`resourceSeedMode: insertOnly`).

### User lists / revokes connected apps

- `auth.api.getOAuthConsents` / `GET /oauth2/get-consents` (current user's consents, with `clientId`, `scopes`, `resources`), `updateOAuthConsent`, `deleteOAuthConsent` (`POST /oauth2/delete-consent { id }`). [sign-in-flow#manage-consents](https://www.better-auth.com/docs/plugins/oauth-provider/sign-in-flow#manage-consents)
- **Gotcha**: `deleteConsentEndpoint` only deletes the `oauthConsent` row ([source](https://github.com/better-auth/better-auth/blob/v1.7.25/packages/oauth-provider/src/oauthConsent/endpoints.ts)); the refresh grant does not re-check consent. A real "disconnect" must also delete/revoke that user's `oauthRefreshToken` rows for the client (and accept that the current JWT lives until `exp`, so keep access TTL short).

## 3. MCP transport in NestJS

### Official SDK: v2 is out and renamed

- `@modelcontextprotocol/server` **2.4.0** (2.0.0 on 2026-07-27): "v2 of the MCP TypeScript SDK, the stable release line, implementing the 2026-07-28 MCP spec. It replaces the single `@modelcontextprotocol/sdk` package". Split packages: `server`, `client`, `core`, `node` (2.1.2), `express` (2.0.2), `hono`, `fastify`, `server-legacy`, `codemod`. [npm](https://www.npmjs.com/package/@modelcontextprotocol/server), [migration](https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2)
- v1 `@modelcontextprotocol/sdk` still maintained (1.32.2, 2026-10-23, not deprecated) but is the old line with a heavy dep tree (express, hono, ajv, cors, express-rate-limit...).
- Deps: `server` = `zod ^4.2.0` + `core` only. `node` = `hono` + `@hono/node-server`. `express` = `cors` (only needed for its `requireBearerAuth`/`mcpAuthMetadataRouter`, which better-auth already covers: skip it).
- `createMcpHandler(factory, opts)` returns `{ fetch }`. Per request it builds a fresh server from `factory(ctx)`; `ctx.authInfo` is what you pass to `fetch(request, { authInfo })`. `legacy: 'stateless'` (**default**) serves 2026-07-28 *and* 2025-era clients statelessly (GET/DELETE get 405); `legacy: 'reject'` is 2026-07-28 only. `responseMode: 'auto'` (JSON, upgrades to SSE when needed). Body cap 4 MiB. No token verification of its own. (`createMcpHandler` d.ts)
- Express mounting: `toNodeHandler(handler)` from `@modelcontextprotocol/node` gives `(req, res, parsedBody?)`. It re-serializes `parsedBody` into the web `Request`, so it works after `express.json()`. URL is built as `http://${host}${req.url}`.
- TS 6 note from the README: add `"types": ["node"]` (published d.ts references `Buffer`).

Sketch (Nest controller, stateless):

```ts
const mcpHandler = createMcpHandler(({ authInfo }) => buildColistServer(authInfo!.extra!.userId as string));
const handle = toNodeHandler({
  fetch: requireMcpAuth(auth, (request, claims) =>
    mcpHandler.fetch(request, { authInfo: { token: '', clientId: String(claims.azp), scopes: String(claims.scope ?? '').split(' '), extra: { userId: claims.sub } } }),
    { resource: MCP_RESOURCE }),
});

@Public() // global SessionGuard would 401 without WWW-Authenticate
@Controller('mcp')
export class McpController {
  @Post() post(@Req() req: Request, @Res() res: Response) { return handle(req, res, req.body); }
}
```

### `@rekog/mcp-nest`

- 2.0.10 (2026-11-13), 733 stars, active, MIT. Peers on SDK v2 (`@modelcontextprotocol/{server,node,core}`), `zod ^4.3.5`, `express >=4`, **`@nestjs/microservices` (required)**, deps `multer`, `path-to-regexp`. [repo](https://github.com/rekog-labs/MCP-Nest)
- 2.x runs MCP as a Nest microservice `CustomTransportStrategy` (`McpStrategy` + `@McpController` + `@Tool({ name, parameters: z.object(...) })`, `@Payload()`, `@Ctx()`), so Nest guards/pipes/filters apply per tool. Dual-era (2025 + 2026-07-28), stateless per request. Auth: guards, or extend `StreamableHttpController` to mount the route as a real controller; optional built-in AS (`@rekog/mcp-nest-auth`, beta). No better-auth integration: you would write a guard that calls `verifyAccessTokenRequest` and emits the RFC 9728 challenge yourself.
- README still says `npm install @modelcontextprotocol/sdk`, contradicting its v2 peer deps (docs lag the code).

### Recommendation

Use the **official SDK v2 directly** (`@modelcontextprotocol/server` + `@modelcontextprotocol/node`) in one Nest controller wrapped by `requireMcpAuth`. It is the path better-auth documents, adds 2 packages (plus hono), needs no microservice strategy, and tool handlers are plain closures that call existing use-cases from Nest DI. mcp-nest's per-tool guard model only pays off with many tools or per-tool guards; it adds `@nestjs/microservices` and its own bootstrap (`connectMicroservice`, `startAllMicroservices`).

## 4. Gotchas

1. **Version bump first**: `better-auth` 1.7.2 to 1.7.25 (peer lockstep, `better-call ~1.4.5`, `@better-fetch/fetch 1.3.3`).
2. **`legacy: 'reject'` in the better-auth docs would lock out 2025-era clients.** Keep the SDK default `'stateless'` unless ticket 03 confirms every Claude surface speaks 2026-07-28.
3. **Caddy only proxies `/api/*`.** Add `handle /.well-known/oauth-* { reverse_proxy localhost:5100 }` and `app.use('/.well-known', toNodeHandler(auth))` (outside the `api` global prefix), or Claude can't discover PRM/AS metadata. Claude also needs a 401 with `resource_metadata` (requireMcpAuth does this) and uses only the first `authorization_servers` entry.
4. **Global `SessionGuard`** throws a plain 401 with no `WWW-Authenticate`; mark the MCP route `@Public()` and let `requireMcpAuth` answer.
5. **Body parsing**: `bodyParser: false` + `useBodyParser('json')` after better-auth is fine. better-auth reads its own raw body (form-urlencoded token requests OK). The MCP controller gets `req.body` parsed; pass it as `parsedBody`.
6. **DPoP behind Caddy**: `toWebRequest` builds `http://host/...`, so a DPoP proof (`htu` = https URL) would fail. Claude doesn't use DPoP today; if needed, rewrite the URL scheme from `X-Forwarded-Proto`.
7. **SPA**: `use-auth-submit.ts` does `navigate({ to: '/app' })` after sign-in, which can race the oauth redirect; skip it when the URL carries `sig`. `/auth` route `beforeLoad` redirect to `/app` is fine (authorize only sends users there without a session). Consent route needs a session but must keep the query string.
8. **Disconnect != delete consent** (see section 2). Also `offline_access` refresh tokens survive sign-out.
9. **CORS**: Claude calls from Anthropic servers (`160.79.104.0/21`), not browsers; current `enableCors({ origin: webUrl })` is irrelevant to it. Browser MCP clients would need CORS on `/api/mcp` and `/.well-known/*` exposing `WWW-Authenticate`.
10. **Express 5**: SDK `express`/`node` adapters peer `express ^4.18 || ^5`; mcp-nest `>=4`. The `*splat` caveat in `mount-better-auth.ts` applies to any new mount: use plain prefix mounts.
11. **zod 4**: SDK v2 needs `zod ^4.2.0`, mcp-nest `^4.3.5`; repo has `^4.4.3`. `registerTool({ inputSchema: z.object(...) })` takes Standard Schema directly (no zod-to-json-schema).
12. Claude rules worth honoring: token/discovery endpoints answer within 10 s, return `invalid_grant` on dead refresh tokens, register `https://claude.ai/api/mcp/auth_callback` (CIMD doc carries it), Claude Code uses its own CIMD with port-agnostic loopback redirects (better-auth accepts any loopback port for `native` clients).

## Implications for Colist

- Auth server: `jwt()` + `mcp({ resource: 'https://colist.heloineto.com/api/mcp', loginPage: '/auth', consentPage: '/oauth/consent' })` + `cimd()`. Leave DCR off at first (Claude picks CIMD when `cimd()` is installed); keep the DCR flags as a one-line fallback if a client fails.
- Define at least one resource scope (else PRM has no `scopes_supported`); Claude appends `offline_access` automatically. Consider `accessTokenExpiresIn` around 15 min so revocation bites quickly.
- New infra: Caddy `/.well-known/oauth-*` route, `app.use('/.well-known', toNodeHandler(auth))`, drizzle schema for 8 new tables + migration.
- Web: add `oauthProviderClient()` to `authClient`, a `/oauth/consent` route (client name, redirect host, scopes, Allow/Deny), guard the post-sign-in navigate, and a "Connected apps" list in settings (`getOAuthConsents` + a custom API endpoint that deletes consent and refresh tokens).
- API: one `@Public()` `McpController` (`POST /api/mcp`) using SDK v2 `createMcpHandler` (default stateless legacy mode) + `@modelcontextprotocol/node` `toNodeHandler` + `requireMcpAuth`. Map `claims.sub` to the active user and call existing use-cases from the tool closures. MCP tools bypass `MembershipGuard`, so membership checks must live in the tool layer or the use-cases (ticket 05). The `TokenValidator` port is not needed for MCP; `requireMcpAuth` is the adapter at that edge.
- Skip `@rekog/mcp-nest` and `@modelcontextprotocol/express`.
