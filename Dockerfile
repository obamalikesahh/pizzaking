FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install --engine-strict=false

# Install server dependencies
RUN cd server && npm install --engine-strict=false

# Copy all source files
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./server/prisma/schema.prisma || true

# Build Vite frontend
RUN npm run build

# Install serve for static frontend serving
RUN npm install -g serve

EXPOSE 3000
EXPOSE 3002

CMD ["sh", "-c", "node server/server.js & serve -s dist -l 3000 -single"]

