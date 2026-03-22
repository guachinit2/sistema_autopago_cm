# apps/frontend/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Stage: development (con volúmenes para hot-reload)
FROM base AS development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage: production (build + nginx)
FROM base AS builder
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
