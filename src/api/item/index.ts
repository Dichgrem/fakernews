import { Elysia, status, t } from "elysia";
import { InsertItem, SelectItem } from "./schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { items } from "@/db/schema";

export const item = new Elysia({ prefix: "/item" })
  .get("/:id",
    async ({ params }) => {
      const item = await db.query.items.findFirst({
        where: eq(items.id, params.id)
      });

      if (!item) {
        return status(404, "Not Found");
      }

      return item;
    },
    {
      params: t.Object({ id: t.Integer() }),
      response: {
        200: SelectItem,
        404: t.String(),
      }
    }
  )
  .post("/",
    async ({ body }) => {
      const [inserted] = await db.insert(items).values(body).returning();
      return inserted;
    },
    {
      body: InsertItem,
      response: {
        200: SelectItem
      }
    })
  .route("DELETE", "/:id",
    async ({ params }) => {
      const affected = (await db.delete(items).where(eq(items.id, params.id))).rowsAffected;
      if (affected === 0) return status(404);
    },
    {
      params: t.Object({ id: t.Integer() }),
    });
