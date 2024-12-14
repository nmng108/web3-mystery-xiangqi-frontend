ARG NODE_VERSION=22
ARG NGINX_VERSION=1.27.2

ARG CONTRACT_ADDRESS=""
ARG CHAIN_ID=""
ARG PEER_SERVER_HOST=""
ARG PEER_SERVER_PORT=""
ARG PEER_SERVER_PATH=""
ARG PEER_SERVER_SECURE=""
ARG PEER_SERVER_KEY=""
ARG PEER_SERVER_PING_INTERVAL=""
ARG PEER_SERVER_DEBUG=3

FROM node:${NODE_VERSION}-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml .pnp.* ./
COPY .yarn/ .yarn/
RUN yarn install --immutable --check-cache
COPY vite.config.ts tsconfig.* postcss.config.js tailwind.config.ts index.html ./
COPY src/ src/
COPY public/ public/

FROM base AS dev
ARG CONTRACT_ADDRESS
ARG CHAIN_ID
ARG PEER_SERVER_HOST
ARG PEER_SERVER_PORT
ARG PEER_SERVER_PATH
ARG PEER_SERVER_SECURE
ARG PEER_SERVER_KEY
ARG PEER_SERVER_PING_INTERVAL
ARG PEER_SERVER_DEBUG
ENTRYPOINT ["yarn", "dev"]
CMD ["--host"]

FROM base AS build
RUN yarn build

FROM nginx:${NGINX_VERSION}-alpine AS production
ARG CONTRACT_ADDRESS
ARG CHAIN_ID
ARG PEER_SERVER_HOST
ARG PEER_SERVER_PORT
ARG PEER_SERVER_PATH
ARG PEER_SERVER_SECURE
ARG PEER_SERVER_KEY
ARG PEER_SERVER_PING_INTERVAL
ARG PEER_SERVER_DEBUG
COPY --from=build /app/dist /usr/share/nginx/html
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
