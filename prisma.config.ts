import { defineConfig, env } from "prisma/config";

// Build a DATABASE_URL from parts if DATABASE_URL is not set.
function buildDatabaseUrl(): string {
  // First try to get DATABASE_URL using Prisma's env helper (may throw if missing),
  // so prefer reading from process.env to avoid throwing when running tools.
  const {
    DATABASE_URL: directDBUrl,
    DATABASE_USER: user,
    DATABASE_PASSWORD: password,
    DATABASE_HOST: host,
    DATABASE_PORT: port,
    DATABASE_NAME: name
  } = process.env;
  
  if (directDBUrl && directDBUrl.length > 0) return directDBUrl;

  return `postgresql://${user}:${password}@${host}:${port}/${name}`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use the explicit DATABASE_URL if present, otherwise build it from parts.
    url: buildDatabaseUrl(),
  },
});