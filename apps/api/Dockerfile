# NOTE: Per the doc: "a build should not require --build-arg to be valid"
# See: https://docs.docker.com/reference/build-checks/invalid-default-arg-in-from/
ARG BUN_VERSION=1.3.14
ARG TURBO_VERSION=2.9.6

# NOTE: Full install (no prune) so bun's isolated linker hoists the same tree as local dev,
# avoiding non-determinism in bun 1.3 isolated installs (oven-sh/bun#25336, #23548)
# and turbo prune lockfile drift (vercel/turborepo#11007, #12262).
FROM oven/bun:${BUN_VERSION}-alpine AS installer
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

FROM installer AS builder
RUN bun run build --filter=api

FROM oven/bun:${BUN_VERSION}-alpine AS pruner
ARG TURBO_VERSION
WORKDIR /app
RUN bun add -g turbo@${TURBO_VERSION}
COPY . .
RUN turbo prune api --docker

FROM oven/bun:${BUN_VERSION}-alpine AS release
WORKDIR /app
ENV NODE_ENV=production
COPY --from=pruner /app/out/json/ .
RUN bun install --frozen-lockfile --production --ignore-scripts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/migrations ./apps/api/migrations

WORKDIR /app/apps/api
USER bun
EXPOSE 5100/tcp
CMD ["bun", "run", "dist/src/main.js"]
