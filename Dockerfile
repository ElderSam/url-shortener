FROM node:22-alpine

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Add node user and set ownership
RUN chown -R node:node /usr/src/app

# Switch to node user
USER node

COPY --chown=node:node package*.json ./

RUN pnpm install

COPY --chown=node:node . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]