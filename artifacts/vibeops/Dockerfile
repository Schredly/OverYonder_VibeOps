# Build context: repo root.
# Glibc base required for esbuild (used transitively by vite). See api-server/Dockerfile.

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

# ---- deps ----
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

# ---- builder: vite build ----
FROM deps AS builder
ARG BASE_PATH=/
ENV BASE_PATH=$BASE_PATH
ENV PORT=4173
COPY tsconfig.base.json tsconfig.json ./
COPY lib ./lib
COPY scripts ./scripts
COPY attached_assets ./attached_assets
COPY artifacts/vibeops ./artifacts/vibeops
RUN pnpm --filter @workspace/vibeops run build

# ---- runtime: serve the static build with vite preview ----
FROM base AS runtime
WORKDIR /repo
ENV NODE_ENV=production
ENV PORT=4173
ENV BASE_PATH=/
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/artifacts/vibeops/node_modules ./artifacts/vibeops/node_modules
COPY --from=builder /repo/artifacts/vibeops/dist ./artifacts/vibeops/dist
COPY artifacts/vibeops/package.json artifacts/vibeops/vite.config.ts artifacts/vibeops/index.html ./artifacts/vibeops/
EXPOSE 4173
WORKDIR /repo/artifacts/vibeops
CMD ["pnpm", "run", "serve"]
