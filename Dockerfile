FROM node:22-alpine as base
RUN corepack enable
WORKDIR /app
COPY . .
#RUN yarn install --immutable --refresh-lockfile --check-cache

FROM base AS dev
ENTRYPOINT ["yarn", "dev"]
CMD ["--host"]

FROM base AS build
RUN yarn build

FROM nginx:1.27.2-alpine
COPY --from=build /app/dist /usr/share/nginx/html
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]
