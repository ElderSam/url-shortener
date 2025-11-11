FROM node:22-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first
COPY package*.json pnpm-lock.yaml ./

# Copy prisma schema and configuration
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for build)
RUN pnpm install

# Generate Prisma client
RUN pnpm prisma generate

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Verify dist folder exists
RUN ls -la dist/

# Note: We keep all dependencies (including dev) to ensure Prisma Client works
# The image size is acceptable for deployment

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", "dist/src/main"]