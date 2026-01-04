import { t } from "elysia";

const ItemType = t.Union([
  t.Literal("comment"),
  t.Literal("story"),
  t.Literal("job"),
]);

const BaseMeta = {
  id: t.Integer({
    title: "Item ID",
    description: "Unique identifier of the item",
  }),
  by: t.String({
    title: "Author",
    description: "Username of the item creator",
  }),
  time: t.Integer({
    title: "Created Time",
    description: "Unix timestamp (seconds)",
  }),
};

const DeadFlag = {
  dead: t.Boolean({
    title: "Dead Flag",
    description: "Whether the item is marked as dead",
  }),
};

export const SelectItem = t.Union([
  t.Object({
    type: t.Literal("comment"),
    ...BaseMeta,
    ...DeadFlag,
    text: t.String({
      title: "Comment Text",
      description: "Content of the comment",
    }),
    parent: t.Integer({
      title: "Parent ID",
      description: "ID of the parent item",
    }),
    score: t.Integer({
      title: "Score",
      description: "Score of the comment",
    }),
  }, {
    title: "Comment Item",
    description: "A comment item returned from storage",
  }),

  t.Object({
    type: t.Literal("story"),
    ...BaseMeta,
    ...DeadFlag,
    url: t.String({
      title: "Story URL",
      description: "External link of the story",
    }),
    text: t.Optional(
      t.String({
        title: "Story Text",
        description: "Optional text content of the story",
      }),
    ),
    score: t.Integer({
      title: "Score",
      description: "Score of the story",
    }),
  }, {
    title: "Story Item",
    description: "A story item returned from storage",
  }),

  t.Object({
    type: t.Literal("job"),
    ...BaseMeta,
    ...DeadFlag,
    url: t.String({
      title: "Job URL",
      description: "Link to the job posting",
    }),
  }, {
    title: "Job Item",
    description: "A job item returned from storage",
  }),

  t.Object({
    type: ItemType,
    id: t.Integer({
      title: "Item ID",
      description: "Unique identifier of the deleted item",
    }),
    deleted: t.Boolean({
      title: "Deleted Flag",
      description: "Whether the item is deleted",
    }),
  }, {
    title: "Deleted Item",
    description: "A lightweight representation of a deleted item",
  }),
]);

export type SelectItem = typeof SelectItem.static;

const BaseInsert = {
  by: t.String({
    title: "Author",
    description: "Username of the item creator",
  }),
};

export const InsertItem = t.Union([
  t.Object({
    type: t.Literal("comment"),
    ...BaseInsert,
    text: t.String({
      title: "Comment Text",
      description: "Content of the comment",
    }),
    parent: t.Integer({
      title: "Parent ID",
      description: "ID of the parent item",
    }),
  }, {
    title: "Insert Comment",
    description: "Payload for creating a comment",
  }),

  t.Object({
    type: t.Literal("story"),
    ...BaseInsert,
    url: t.String({
      title: "Story URL",
      description: "External link of the story",
    }),
    text: t.Optional(
      t.String({
        title: "Story Text",
        description: "Optional text content of the story",
      }),
    ),
  }, {
    title: "Insert Story",
    description: "Payload for creating a story",
  }),

  t.Object({
    type: t.Literal("job"),
    ...BaseInsert,
    url: t.String({
      title: "Job URL",
      description: "Link to the job posting",
    }),
  }, {
    title: "Insert Job",
    description: "Payload for creating a job posting",
  }),
]);

export type InsertItem = typeof InsertItem.static;
