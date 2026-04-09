### Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build


FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

LABEL org.opencontainers.image.source=https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Frontend-Sis-Prestamos-y-Multas

CMD ["nginx", "-g", "daemon off;"]
