FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies (skipping strict engine check)
RUN npm install --engine-strict=false

# Copy all source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./server/prisma/schema.prisma || true

# Build Vite frontend
RUN npm run build

# Install serve
RUN npm install -g serve

EXPOSE 3000
EXPOSE 3002

CMD ["sh", "-c", "node server/server.js & serve -s dist -l 3000 -single"]
