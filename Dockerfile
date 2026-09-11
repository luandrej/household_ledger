# syntax=docker/dockerfile:1

# ---- deps: install dependencies (with build tools for better-sqlite3's native binding) ----
FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js app ----
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

# ---- runner: minimal image that actually runs, with the SQLite file on a volume ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Where the SQLite database file lives - mount this as a volume so data survives rebuilds.
ENV DATABASE_PATH=/app/data/budget.db

# Next.js standalone output already bundles only the production node_modules it traced,
# including better-sqlite3's compiled binding - no need to reinstall or recompile here.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3000
CMD ["node", "server.js"]
