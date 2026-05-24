FROM node:22.22.2-alpine3.23@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f AS base
ARG SOURCE_DATE_EPOCH

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . ./app
WORKDIR /app

FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store CI=true pnpm install --prod --frozen-lockfile

FROM base AS build

ARG COMMIT_TAG
ENV COMMIT_TAG=${COMMIT_TAG}

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

RUN pnpm build

FROM node:22.22.2-alpine3.23@sha256:8ea2348b068a9544dae7317b4f3aafcdc032df1647bb7d768a05a5cad1a7683f
ARG SOURCE_DATE_EPOCH
ARG COMMIT_TAG
ARG VERSION
ENV NODE_ENV=production
ENV COMMIT_TAG=${COMMIT_TAG}
ENV VERSION=${VERSION}

RUN apk add --no-cache tzdata

USER node:node

WORKDIR /app

COPY --chown=node:node . .
COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

RUN mkdir -p config && touch config/DOCKER && \
  echo "{\"version\": \"${VERSION}\", \"commitTag\": \"${COMMIT_TAG}\"}" > committag.json

EXPOSE 5056

CMD ["node", "dist/index.js"]
