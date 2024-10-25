FROM node:18-alpine as base
WORKDIR /app

RUN npm install -g npm@latest

COPY angular/package.json ./angular/
COPY package.json package-lock.json ./

RUN npm run install:ci

COPY . .

FROM base as builder
RUN npm run build


FROM nginx AS runtime-image
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh /opt/docker-entrypoint.sh
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf.static /etc/nginx/conf.d/default.conf.template
EXPOSE 8000 8000
ENTRYPOINT ["/opt/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
