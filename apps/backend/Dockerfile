FROM node:22.12.0 AS builder

WORKDIR /app/builder

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install Python and other dependencies required by node-gyp
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
COPY --from=builder /app/builder/apps/backend/src/i18n ./dist/apps/backend/i18n
COPY --from=builder /app/builder/node_modules ./node_modules

CMD ["node", "dist/main.js"]