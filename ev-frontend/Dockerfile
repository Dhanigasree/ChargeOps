FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

USER root
RUN mkdir -p /tmp/nginx /var/cache/nginx /usr/share/nginx/html \
  && chown -R 101:0 /tmp/nginx /var/cache/nginx /usr/share/nginx/html /etc/nginx/conf.d
COPY --chown=101:0 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:0 /app/dist /usr/share/nginx/html
USER 101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
