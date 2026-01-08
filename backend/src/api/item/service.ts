import { status } from "elysia";
import { db } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { items, users, upvotes } from "@/db/schema";
import { InsertItem } from "./schema";

export const getItemById = async ({ params }: { params: { id: number } }) => {
  const item = await db.query.items.findFirst({
    where: eq(items.id, params.id),
    with: {
      kids: true,
    }
  });

  if (!item) {
    return status(404, "Not Found");
  }

  if (item.deleted) {
    return {
      type: item.type,
      id: item.id,
      deleted: true,
    };
  }

  const kids =
    item.kids && item.kids.length > 0
      ? item.kids.map(kid => kid.id)
      : undefined;

  switch (item.type) {
    case "comment":
      return {
        type: item.type,
        id: item.id,
        dead: item.dead,
        by: item.by,
        time: item.time,
        text: item.text!,
        parent: item.parent!,
        score: item.score,
        kids,
      };

    case "story":
      return {
        type: item.type,
        id: item.id,
        dead: item.dead,
        by: item.by,
        time: item.time,
        title: item.title!,
        url: item.url!,
        text: item.text ?? undefined,
        score: item.score,
        kids,
      };

    case "job":
      return {
        type: item.type,
        id: item.id,
        dead: item.dead,
        by: item.by,
        time: item.time,
        url: item.url!,
        score: item.score,
      };
  }
}

export const insertItem = async ({ body }: { body: InsertItem }) => {
  const [inserted] = await db.insert(items).values(body).returning();
  return inserted;
}

export const deleteItem = async ({ params }: { params: { id: number } }) => {
  const affected = (await db.delete(items).where(eq(items.id, params.id))).rowsAffected;
  if (affected === 0) return status(404);
}

export const voteItem = async ({
  params,
  body,
}: {
  params: { id: number };
  body: { type: "up" | "down"; userId: string };
}) => {
  if (body.type !== "up") {
    return status(400, "Only upvote is supported");
  }

  if (!body.userId) {
    return status(401, "User ID is required");
  }

  // 检查用户是否已经 upvote 过这个 item
  const existingUpvote = await db.query.upvotes.findFirst({
    where: and(
      eq(upvotes.userId, body.userId),
      eq(upvotes.itemId, params.id)
    ),
  });

  const item = await db.query.items.findFirst({
    where: eq(items.id, params.id),
  });

  if (!item || item.deleted || item.dead) {
    return status(404, "Not Found or Not Votable");
  }

  let delta = 0;

  if (existingUpvote) {
    // 已 upvote，取消 upvote（toggle off）
    await db.delete(upvotes).where(eq(upvotes.id, existingUpvote.id));
    delta = -1;
  } else {
    // 未 upvote，添加 upvote（toggle on）
    await db.insert(upvotes).values({
      userId: body.userId,
      itemId: params.id,
    });
    delta = 1;
  }

  // 更新 item 的分数
  const [updatedItem] = await db
    .update(items)
    .set({
      score: sql`
        CASE
          WHEN ${items.score} + ${delta} < 0 THEN 0
          ELSE ${items.score} + ${delta}
        END
      `,
    })
    .where(eq(items.id, params.id))
    .returning({
      id: items.id,
      score: items.score,
      by: items.by,
    });

  // 更新作者的 karma
  if (updatedItem.by) {
    await db
      .update(users)
      .set({
        karma: sql`
          CASE
            WHEN ${users.karma} + ${delta} < 0 THEN 0
            ELSE ${users.karma} + ${delta}
          END
        `,
      })
      .where(eq(users.id, updatedItem.by));
  }

  return {
    id: updatedItem.id,
    score: updatedItem.score,
    upvoted: !existingUpvote,
  };
};

export const checkUpvoteStatus = async ({
  params,
  query,
}: {
  params: { id: number };
  query: { userId: string };
}) => {
  const upvote = await db.query.upvotes.findFirst({
    where: and(
      eq(upvotes.userId, query.userId),
      eq(upvotes.itemId, params.id)
    ),
  });

  return {
    upvoted: !!upvote,
  };
};

export const checkMultipleUpvoteStatus = async ({
  userId,
  itemIds,
}: {
  userId: string;
  itemIds: number[];
}) => {
  const userUpvotes = await db.query.upvotes.findMany({
    where: eq(upvotes.userId, userId),
  });

  const upvotedItemIds = new Set(userUpvotes.map(u => u.itemId));

  const statusMap: Record<number, boolean> = {};
  itemIds.forEach(id => {
    statusMap[id] = upvotedItemIds.has(id);
  });

  return statusMap;
};
