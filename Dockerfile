# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files & install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source files
COPY . .

# Generate Prisma (ignore DB connection during build)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN npx prisma generate --schema=./server/prisma/schema.prisma || true

# Build Vite frontend
RUN npm run build

# Install lightweight static server
RUN npm install -g serve

EXPOSE 3000
EXPOSE 3002

# Clean start command
CMD ["sh", "-c", "node server/server.js & serve -s dist -l 3000 -single"]
