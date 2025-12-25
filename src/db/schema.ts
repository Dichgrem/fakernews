import { relations } from "drizzle-orm";
import { sqliteTable, integer, text, AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export const items = sqliteTable("items", {
  id: integer({ mode: "number" }).primaryKey(),

  deleted: integer({ mode: "boolean" }).default(false).notNull(),
  dead: integer({ mode: "boolean" }).default(false).notNull(),

  type: text({
    enum: ["story", "comment", "job"],
  }).notNull(),

  by: text().notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  time: integer().notNull()
    .$defaultFn(() => new Date().getTime())
    .$onUpdate(() => new Date().getTime()),

  text: text(),

  parent: integer({ mode: "number" })
    .references((): AnySQLiteColumn => items.id, {
      onDelete: "cascade",
    }),
  poll: integer({ mode: "number" })
    .references((): AnySQLiteColumn => items.id, {
      onDelete: "cascade",
    }),

  url: text(),

  score: integer(),

  title: text(),
});

export const users = sqliteTable("users", {
  id: text().primaryKey(),

  created: integer().notNull()
    .$defaultFn(() => new Date().getTime()),

  karma: integer().notNull().default(0),

  about: text(),
});

export const itemsRelations = relations(items, ({ one, many }) => ({
  author: one(users, {
    fields: [items.by],
    references: [users.id],
  }),

  parent: one(items, {
    fields: [items.parent],
    references: [items.id],
    relationName: "parent-kids"
  }),

  kids: many(items, {
    relationName: "parent-kids"
  }),

  poll: one(items, {
    fields: [items.poll],
    references: [items.id],
    relationName: "poll-opt"
  }),

  parts: many(items, {
    relationName: "poll-opt"
  }),
}));
