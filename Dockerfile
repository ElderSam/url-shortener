FROM node:22-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Add node user and set ownership
RUN chown -R node:node /usr/src/app

# Switch to node user
USER node

# Copy package files first
COPY --chown=node:node package*.json pnpm-lock.yaml ./

# Copy prisma schema and configuration
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node .env.example .env

# Install dependencies
RUN pnpm install

# Generate Prisma client
RUN pnpm prisma generate

# Copy remaining source files
COPY --chown=node:node . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 3000

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]