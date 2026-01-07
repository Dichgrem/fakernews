import { openapi } from '@elysiajs/openapi';
import { cors } from '@elysiajs/cors';
import { Elysia } from "elysia";
import { item } from "./api/item";
import { user } from "./api/user";
import { top } from "./api/top";
import games from "./api/games";
import { env } from "./env";

const apiRoutes = new Elysia()
  .use(item)
  .use(user)
  .use(top)
  .use(games);

const app = new Elysia()
  .use(cors())
  .use(openapi())
  .use(apiRoutes)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof apiRoutes;

