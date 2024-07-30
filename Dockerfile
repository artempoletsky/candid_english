# syntax=docker/dockerfile:1


ARG NODE_VERSION=20.15.0

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /usr/src/app

FROM base as build

COPY docker/old.json ./package.json

RUN npm install 

COPY docker/new.json ./package.json

RUN npm install

COPY app app
COPY lib lib
# COPY grab grab
COPY socket socket
COPY data data

COPY middleware.ts .
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY postcss.config.js .
COPY tailwind.config.ts .
COPY next.config.js .
COPY jsconfig.json .
COPY next-env.d.ts .
COPY .eslintrc.json .
COPY .env.local .

# COPY grab_data/words.json grab_data/
# COPY grab_data/words_dict.json grab_data/
# COPY grab_data/words_level.json grab_data/
# COPY grab_data/words_light.json grab_data/

RUN npm run build

FROM base as final

ENV NODE_ENV production

RUN npm i aes-js
COPY --from=build /usr/src/app/.next/standalone/ .
COPY --from=build /usr/src/app/.next/static/ .next/static/
COPY public/ public/
COPY data/ data/

EXPOSE 3000

# Run the application.
CMD node server.js
