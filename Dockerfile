FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the project
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built artifacts
COPY --from=builder /app/packages/frontend/next.config.js ./packages/frontend/
COPY --from=builder /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/frontend/public ./packages/frontend/public
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy necessary package.json files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/frontend/package.json ./packages/frontend/
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN npm install --production

# Copy start script
COPY --from=builder /app/scripts/start.sh ./
RUN chmod +x ./start.sh

# Run the app
CMD ["./start.sh"]
