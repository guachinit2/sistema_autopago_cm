# apps/backend/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage: development (con volúmenes para hot-reload)
FROM base AS development
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Stage: production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=base /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main.js"]
