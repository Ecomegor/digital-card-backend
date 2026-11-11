ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npm run build \
  && npm prune --omit=dev --no-audit --no-fund

FROM node:${NODE_VERSION} AS runtime
ENV NODE_ENV=production \
    PRISMA_HIDE_UPDATE_MESSAGE=1
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/
COPY prisma/migrations ./prisma/migrations
COPY docker-entrypoint.sh ./
USER node
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
