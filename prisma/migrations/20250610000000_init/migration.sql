-- CreateTable
CREATE TABLE "Novel" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" TEXT NOT NULL DEFAULT 'fiction',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "views" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Novel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "novelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayStory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverUrl" TEXT NOT NULL DEFAULT '',
    "language" TEXT NOT NULL DEFAULT 'en',
    "genre" TEXT NOT NULL DEFAULT 'adventure',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleplayStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleplayScene" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "choices" TEXT NOT NULL DEFAULT '[]',
    "isStart" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleplayScene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Novel_language_idx" ON "Novel"("language");

-- CreateIndex
CREATE INDEX "Novel_category_idx" ON "Novel"("category");

-- CreateIndex
CREATE INDEX "Novel_status_idx" ON "Novel"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_novelId_number_key" ON "Chapter"("novelId", "number");

-- CreateIndex
CREATE INDEX "Chapter_novelId_idx" ON "Chapter"("novelId");

-- CreateIndex
CREATE INDEX "RoleplayStory_language_idx" ON "RoleplayStory"("language");

-- CreateIndex
CREATE INDEX "RoleplayStory_genre_idx" ON "RoleplayStory"("genre");

-- CreateIndex
CREATE INDEX "RoleplayScene_storyId_idx" ON "RoleplayScene"("storyId");

-- CreateIndex
CREATE INDEX "RoleplayScene_isStart_idx" ON "RoleplayScene"("isStart");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_novelId_fkey" FOREIGN KEY ("novelId") REFERENCES "Novel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleplayScene" ADD CONSTRAINT "RoleplayScene_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "RoleplayStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;