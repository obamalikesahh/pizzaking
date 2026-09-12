# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY server/package*.json ./server/
RUN npm install
RUN cd server && npm install

# Copy all source files
COPY . .

# Build frontend
RUN npm run build

# Expose ports
EXPOSE 3000
EXPOSE 3002

# Start script: Run server and static server
CMD ["sh", "-c", "node server/server.js & npx serve -s dist -l 3000"]
