
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /usr/src/app


COPY package*.json ./
RUN npm ci --omit=dev

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main"]
