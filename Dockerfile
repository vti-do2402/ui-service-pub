FROM node:18-alpine AS builder
WORKDIR /workspace/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY src ./src

ARG REACT_APP_API_URL=/api
RUN npm run build

# ------------------------------------------------------------

FROM nginx:alpine

COPY --from=builder /workspace/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Runtime configuration - can be overridden at runtime
ENV PORT=80 \
    HOSTNAME=localhost \
    API_URL=http://api-gateway:8080

EXPOSE ${PORT}

# Use envsubst for safer environment variable substitution
CMD ["/bin/sh", "-c", "envsubst '${PORT} ${HOSTNAME} ${API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]