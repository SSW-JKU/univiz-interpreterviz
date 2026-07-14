# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN yarn build

# Stage 2: Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN yarn install --frozen-lockfile --production

# Expose Vite preview default port
EXPOSE 4173

# Run preview server
CMD ["yarn", "preview", "--host", "0.0.0.0", "--port", "3000"]
