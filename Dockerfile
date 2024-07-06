# syntax=docker/dockerfile:1


ARG NODE_VERSION=20.15.0

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

FROM base as build

COPY . .

RUN --mount=type=cache,target=/usr/src/app/node_modules \
  npm install && \
  npm run build

FROM base as final

ENV NODE_ENV production

COPY --from=build /usr/src/app/.next/standalone/ .
COPY --from=build /usr/src/app/.next/static/ .next/static/
COPY public/ public/

EXPOSE 3000

# Run the application.
CMD node server.js
