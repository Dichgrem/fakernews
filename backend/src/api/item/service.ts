import { status } from "elysia";
import { db } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { items, users } from "@/db/schema";
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
  body: { type: "up" | "down" };
}) => {
  const delta = body.type === "up" ? 1 : -1;

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
    .where(
      and(
        eq(items.id, params.id),
        eq(items.deleted, false),
        eq(items.dead, false)
      )
    )
    .returning({
      id: items.id,
      score: items.score,
      by: items.by,
    });

  if (!updatedItem) {
    return status(404, "Not Found or Not Votable");
  }

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
  };
};
