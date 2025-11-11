-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "alias" TEXT,
    "ownerId" TEXT,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_slug_key" ON "ShortUrl"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_alias_key" ON "ShortUrl"("alias");

-- AddForeignKey
ALTER TABLE "ShortUrl" ADD CONSTRAINT "ShortUrl_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
