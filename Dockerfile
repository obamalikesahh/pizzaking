FROM node:20-alpine

WORKDIR /app

# Copy package.json and install all dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=./server/prisma/schema.prisma

# Build the Vite frontend
RUN npm run build

# Install serve globally to serve frontend static files
RUN npm install -g serve

EXPOSE 3000
EXPOSE 3002

# Run backend server AND static frontend concurrently
CMD node server/server.js & serve -s dist -l 3000
