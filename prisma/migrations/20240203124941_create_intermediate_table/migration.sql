/*
  Warnings:

  - You are about to drop the `_AiGeneratedPostToPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ai_generated_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AiGeneratedPostToPost" DROP CONSTRAINT "_AiGeneratedPostToPost_A_fkey";

-- DropForeignKey
ALTER TABLE "_AiGeneratedPostToPost" DROP CONSTRAINT "_AiGeneratedPostToPost_B_fkey";

-- DropTable
DROP TABLE "_AiGeneratedPostToPost";

-- DropTable
DROP TABLE "ai_generated_posts";

-- CreateTable
CREATE TABLE "aiposts" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(250) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aiposts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_to_aiposts" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "aipostId" INTEGER NOT NULL,

    CONSTRAINT "post_to_aiposts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post_to_aiposts" ADD CONSTRAINT "post_to_aiposts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_to_aiposts" ADD CONSTRAINT "post_to_aiposts_aipostId_fkey" FOREIGN KEY ("aipostId") REFERENCES "aiposts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
