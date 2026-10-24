FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

COPY web/package.json ./package.json
RUN npm install --no-audit --no-fund

COPY web/ ./
RUN npm run build

FROM node:22.14.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
