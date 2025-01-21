-- CreateTable
CREATE TABLE "CommentMetrics" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "likesCount" INTEGER DEFAULT 0,

    CONSTRAINT "CommentMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentMetrics_commentId_key" ON "CommentMetrics"("commentId");

-- AddForeignKey
ALTER TABLE "CommentMetrics" ADD CONSTRAINT "CommentMetrics_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
