FROM node:18-alpine AS builder

WORKDIR /build

# Copy server
COPY server/ ./server/
COPY client/ ./client/

# Build client
WORKDIR /build/client
RUN npm install --legacy-peer-deps
RUN npm run build

# Setup server
WORKDIR /build/server
RUN npm install

# Final stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /build/server ./server
COPY --from=builder /build/client/dist ./client/dist

WORKDIR /app/server

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
