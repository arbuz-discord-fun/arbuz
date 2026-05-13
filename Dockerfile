# ── Stage 1: сборка TypeScript ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# ── Stage 2: runtime (только production зависимости) ─────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Скомпилированный код
COPY --from=builder /app/dist ./dist

# SQL-миграции читаются из файла при старте (src/db/migrate.ts)
COPY migrations/ ./migrations/

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
