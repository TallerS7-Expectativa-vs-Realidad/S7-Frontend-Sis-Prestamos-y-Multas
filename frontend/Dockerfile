### Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Allow the Vite build to embed the API URL at build-time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

### Production stage: serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy entrypoint script for dynamic API URL configuration
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

LABEL org.opencontainers.image.source=https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Frontend-Sis-Prestamos-y-Multas

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
