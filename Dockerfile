# /Dockerfile

# --- Stage 1: Install Dependencies ---
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- Stage 2: Build the Application ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client for Database Access
RUN npx prisma generate

# Build the Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a secure non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy over the built artifacts from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Run the application securely
USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]