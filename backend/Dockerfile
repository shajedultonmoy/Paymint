FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci
COPY tsconfig.json ./
COPY src ./src

FROM deps AS development
ENV NODE_ENV=development
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM deps AS build
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
