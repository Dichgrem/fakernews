import { db } from "@/db";
import { items } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function getTopStories(
  { query: { limit = 30, offset = 0 } }: { query: { limit?: number; offset?: number } }
) {
  const stories = await db.query.items.findMany({
    where: and(
      eq(items.type, "story"),
      eq(items.deleted, false),
      eq(items.dead, false)
    ),
    orderBy: [desc(items.score), desc(items.time)],
    limit,
    offset,
  });

  return stories.map(story => story.id);
}

export async function getTopComments(
  { query: { limit = 30, offset = 0 } }: { query: { limit?: number; offset?: number } }
) {
  const comments = await db.query.items.findMany({
    where: and(
      eq(items.type, "comment"),
      eq(items.deleted, false),
      eq(items.dead, false)
    ),
    orderBy: [desc(items.score), desc(items.time)],
    limit,
    offset,
  });

  return comments.map(comment => comment.id);
}

export async function getTopJobs(
  { query: { limit = 30, offset = 0 } }: { query: { limit?: number; offset?: number } }
) {
  const jobs = await db.query.items.findMany({
    where: and(
      eq(items.type, "job"),
      eq(items.deleted, false),
      eq(items.dead, false)
    ),
    orderBy: [desc(items.time)],
    limit,
    offset,
  });

  return jobs.map(job => job.id);
}