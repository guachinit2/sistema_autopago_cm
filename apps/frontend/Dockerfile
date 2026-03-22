# apps/frontend/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

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
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
