FROM node:18-alpine AS builder
WORKDIR /workspace/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY src ./src

# Build-time variables for the React app
ARG REACT_APP_API_URL=http://localhost:8080/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

RUN npm run build

# ------------------------------------------------------------

FROM nginx:alpine
COPY --from=builder /workspace/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime configuration - can be overridden at runtime
ENV PORT=80
ENV HOSTNAME=localhost
EXPOSE ${PORT}

RUN sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf
RUN sed -i -e 's/$HOSTNAME/'"$HOSTNAME"'/g' /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]