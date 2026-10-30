FROM rust:1.91-bookworm AS wasm
RUN rustup target add wasm32-unknown-unknown \
    && cargo install wasm-pack --version 0.15.0 --locked
WORKDIR /workspace
COPY Cargo.toml Cargo.lock ./
COPY crates ./crates
RUN mkdir -p /workspace/web/generated/design-wasm
RUN cargo metadata --locked --format-version 1 > /dev/null
WORKDIR /workspace/crates/design-wasm
RUN cargo check --locked --target wasm32-unknown-unknown \
    && wasm-pack build --target web --out-dir ../../web/generated/design-wasm --out-name design_wasm --release

FROM node:22.14.0-bookworm-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.11.0 --activate
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY web/ ./
# Tests are included in Nuxt's TypeScript build, and import shared fixtures
# using paths relative to the repository root (../../fixtures).
COPY fixtures/ /fixtures/
COPY --from=wasm /workspace/web/generated/design-wasm ./generated/design-wasm
RUN pnpm exec nuxt build

FROM node:22.14.0-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
