/*
  Warnings:

  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(30);

-- CreateTable
CREATE TABLE "ai_generated_posts" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(80),
    "content" VARCHAR(250) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_generated_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AiGeneratedPostToPost" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AiGeneratedPostToPost_AB_unique" ON "_AiGeneratedPostToPost"("A", "B");

-- CreateIndex
CREATE INDEX "_AiGeneratedPostToPost_B_index" ON "_AiGeneratedPostToPost"("B");

-- AddForeignKey
ALTER TABLE "_AiGeneratedPostToPost" ADD CONSTRAINT "_AiGeneratedPostToPost_A_fkey" FOREIGN KEY ("A") REFERENCES "ai_generated_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AiGeneratedPostToPost" ADD CONSTRAINT "_AiGeneratedPostToPost_B_fkey" FOREIGN KEY ("B") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
