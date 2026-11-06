# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_NAME=@FindMe
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates lsof procps \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --uid 1001 --create-home --home-dir /app atfindme

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_SITE_NAME=@FindMe
ENV SPACED_ENABLED=false
ENV SPACED_CHAIN=mainnet

COPY --from=build --chown=atfindme:atfindme /app/package.json /app/package-lock.json /app/next.config.ts /app/tsconfig.json ./
COPY --from=build --chown=atfindme:atfindme /app/node_modules ./node_modules
COPY --from=build --chown=atfindme:atfindme /app/.next ./.next
COPY --from=build --chown=atfindme:atfindme /app/scripts ./scripts
COPY --from=build --chown=atfindme:atfindme /app/app ./app

USER atfindme
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=8s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "scripts/listen.mjs", "start"]
