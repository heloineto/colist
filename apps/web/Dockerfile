# NOTE: Per the doc: "a build should not require --build-arg to be valid"
# See: https://docs.docker.com/reference/build-checks/invalid-default-arg-in-from/
ARG BUN_VERSION=1.3.14

# NOTE: Full install (no prune) so bun's isolated linker hoists the same tree as local dev,
# avoiding non-determinism in bun 1.3 isolated installs (oven-sh/bun#25336, #23548)
FROM oven/bun:${BUN_VERSION}-alpine AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
ARG APP_VERSION=dev
ENV VITE_APP_VERSION=$APP_VERSION
RUN bun run build --filter=web

FROM caddy:2-alpine AS release
COPY --from=builder /app/apps/web/dist /srv
COPY apps/web/Caddyfile /etc/caddy/Caddyfile
