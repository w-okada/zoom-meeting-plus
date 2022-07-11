# syntax=docker/dockerfile:1
#### base ####
# cache our node version for installing later
FROM node:18.3.0-slim as node
FROM ubuntu:focal-20220531 as base

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get -qq install -y --no-install-recommends \
    tini \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node /usr/local/include/ /usr/local/include/
COPY --from=node /usr/local/lib/ /usr/local/lib/
COPY --from=node /usr/local/bin/ /usr/local/bin/

RUN corepack disable && corepack enable

FROM base as dev

RUN apt-get -yq update && apt-get -yqq install ssh git

ADD dummy /
RUN mkdir ~/.ssh && ssh-keyscan github.com >> ~/.ssh/known_hosts
RUN --mount=type=ssh git clone git@github.com:w-okada/zoom-meeting-plus.git app

WORKDIR /app
RUN npm ci
RUN npm run build

FROM base as prod
COPY --from=dev /app/backend /app/backend
COPY --from=dev /app/dist /app/dist
#COPY --from=dev /app/node_modules /app/node_modules
COPY --from=dev /app/package.json /app/package.json
COPY --from=dev /app/package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm ci --omit=dev

EXPOSE 8888

CMD [ "npm", "run", "start:backend" ]
