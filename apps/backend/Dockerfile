FROM node:22.12.0 AS builder

WORKDIR /app/builder

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Python and other dependencies required by node-gyp
# RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*
RUN apt-get update && \
apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2

# RUN apk add --update python3 py3-pip build-base g++ && rm -rf /var/cache/apk/*

# Install dependencies, including Nx
RUN npm ci

# Copy the rest of the application code
COPY apps/backend/src/i18n ./src/i18n
COPY . .

# Install Nx globally
RUN npm install -g nx

# Build the application without using cache
RUN npm run backend:build:prod --configuration=production --skip-nx-cache

FROM node:22.12.0

WORKDIR /app
COPY --from=builder /app/builder/dist/apps/backend ./dist
COPY --from=builder /app/builder/node_modules ./node_modules

CMD ["node", "dist/main.js"]