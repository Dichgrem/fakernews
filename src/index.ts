import { openapi, fromTypes } from '@elysiajs/openapi'
import { Elysia } from "elysia";
import { item } from "./api/item";
import { env } from "./env";

const app = new Elysia()
  .use(openapi({
    references: fromTypes()
  }))
  .use(item)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
