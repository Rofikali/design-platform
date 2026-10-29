FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY web/ ./
RUN pnpm run build

FROM node:22.14.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
