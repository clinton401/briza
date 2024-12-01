-- AlterTable
ALTER TABLE "PostMetrics" ALTER COLUMN "likesCount" DROP NOT NULL,
ALTER COLUMN "commentsCount" DROP NOT NULL,
ALTER COLUMN "bookmarksCount" DROP NOT NULL,
ALTER COLUMN "viewsCount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserMetrics" ALTER COLUMN "followersCount" DROP NOT NULL,
ALTER COLUMN "followingCount" DROP NOT NULL,
ALTER COLUMN "postCount" DROP NOT NULL;
