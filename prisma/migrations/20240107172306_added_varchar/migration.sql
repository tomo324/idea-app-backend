/*
  Warnings:

  - You are about to alter the column `title` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(80)`.
  - You are about to alter the column `content` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.

*/
-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "title" SET DATA TYPE VARCHAR(80),
ALTER COLUMN "content" SET DATA TYPE VARCHAR(250);
