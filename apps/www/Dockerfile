# syntax=docker/dockerfile:1
# Production image for the website. Build from the repo root:
#   docker compose up --build --detach www
# Values that are baked into the static pages at build time are build args, not runtime env.

ARG NODE_VERSION=26.13.1

FROM node:${NODE_VERSION}-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    TURBO_TELEMETRY_DISABLED=1
# Same pnpm version as "packageManager" in package.json.
RUN npm install --global pnpm@12.21.0
WORKDIR /repo

# Install dependencies from the manifests only, so this layer is reused until they change.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/www/package.json apps/www/
COPY packages/config/package.json packages/config/
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

FROM deps AS build
COPY . .
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG SITE_INDEXABLE=false
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    SITE_INDEXABLE=${SITE_INDEXABLE} \
    NEXT_OUTPUT_STANDALONE=true
RUN mkdir -p apps/www/public && pnpm --filter @creatoros/www build

# Runtime: only the traced server files, no package manager, no source, non-root user.
FROM node:${NODE_VERSION}-slim AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/www/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/www/.next/static ./apps/www/.next/static
COPY --from=build --chown=node:node /repo/apps/www/public ./apps/www/public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/robots.txt').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
CMD ["node", "apps/www/server.js"]
