import { status } from "elysia";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { items } from "@/db/schema";
import { InsertItem } from "./schema";

export const getItemById = async ({ params }: { params: { id: number } }) => {
  const item = await db.query.items.findFirst({
    where: eq(items.id, params.id),
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
        score: item.score!,
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
        score: item.score!,
      };

    case "job":
      return {
        type: item.type,
        id: item.id,
        dead: item.dead,
        by: item.by,
        time: item.time,
        url: item.url!,
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
