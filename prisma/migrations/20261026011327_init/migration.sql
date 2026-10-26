-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "title" TEXT,
    "specialty" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT,
    "state" TEXT,
    "profileImage" TEXT,
    "facebook" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "tiktok" TEXT,
    "threads" TEXT,
    "youtube" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agent_agencyName_idx" ON "Agent"("agencyName");

-- CreateIndex
CREATE INDEX "Agent_verified_idx" ON "Agent"("verified");

-- CreateIndex
CREATE INDEX "Agent_featured_idx" ON "Agent"("featured");
