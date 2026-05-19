# Build context: repo root (so workspace packages and lockfile are available)
# Glibc base required: pnpm-workspace.yaml strips linux-x64-musl from esbuild deps,
# so musl/Alpine images won't resolve a runnable esbuild binary.

FROM node:24-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Pin pnpm to a version that both (a) accepts this repo's lockfile overrides
# and (b) sets npm_config_user_agent in the form the root preinstall guard
# expects. pnpm 11.x changes the user-agent format (preinstall fails);
# pnpm 9.x serializes overrides differently than the lockfile records them
# (ERR_PNPM_LOCKFILE_CONFIG_MISMATCH). 10.33.x sits in the sweet spot.
RUN corepack enable && corepack prepare pnpm@10.33.4 --activate
WORKDIR /repo

# ---- deps: install all workspace dependencies (cached on package.json changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY artifacts/api-server/package.json ./artifacts/api-server/
COPY artifacts/vibeops/package.json ./artifacts/vibeops/
COPY artifacts/mockup-sandbox/package.json ./artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json ./lib/api-client-react/
COPY lib/api-spec/package.json ./lib/api-spec/
COPY lib/api-zod/package.json ./lib/api-zod/
COPY lib/db/package.json ./lib/db/
COPY scripts/package.json ./scripts/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- builder: bundle the api-server with esbuild ----
FROM deps AS builder
COPY tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY scripts ./scripts
COPY artifacts/api-server ./artifacts/api-server
RUN pnpm --filter @workspace/api-server run build

# ---- runtime: minimal image with the bundled output ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/artifacts/api-server/dist ./dist
EXPOSE 5000
CMD ["node", "--enable-source-maps", "/app/dist/index.mjs"]
