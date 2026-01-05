import { openapi, fromTypes } from '@elysiajs/openapi'
import { Elysia } from "elysia";
import { item } from "./api/item";
import { user } from "./api/user";
import { top } from "./api/top";
import { env } from "./env";

const app = new Elysia()
  .use(openapi({
    references: fromTypes()
  }))
  .use(item)
  .use(user)
  .use(top)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
