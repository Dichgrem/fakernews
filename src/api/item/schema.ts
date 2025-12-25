import { items } from "@/db/schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

const removeNullsTS = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== null)) as T;

export const SelectItem = createSelectSchema(items).transform(removeNullsTS);
export const InsertItem = createInsertSchema(items).omit({ id: true, time: true, dead: true, score: true, deleted: true });
