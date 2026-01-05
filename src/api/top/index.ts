import { Elysia, t } from "elysia";
import { getTopStories, getTopComments, getTopJobs } from "./service";

export const top = new Elysia({ prefix: "/top" })
  .get("/stories", getTopStories,
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Number({ minimum: 0 })),
      }),
      response: {
        200: t.Array(t.Integer()),
      }
    }
  )
  .get("/comments", getTopComments,
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Number({ minimum: 0 })),
      }),
      response: {
        200: t.Array(t.Integer()),
      }
    }
  )
  .get("/jobs", getTopJobs,
    {
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Number({ minimum: 0 })),
      }),
      response: {
        200: t.Array(t.Integer()),
      }
    }
  );