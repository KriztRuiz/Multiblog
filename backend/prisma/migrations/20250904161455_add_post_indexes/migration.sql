-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_likes_idx" ON "Post"("likes");

-- CreateIndex
CREATE INDEX "Post_title_idx" ON "Post"("title");
