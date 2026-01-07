import { Elysia, status, t } from "elysia";
import { db } from "../../db";
import { game2048Scores, snakeScores, flappyBirdScores } from "../../db/schema";
import { eq, desc } from "drizzle-orm";
import { Game2048Score, SnakeScore, FlappyBirdScore, InsertGame2048Score, InsertSnakeScore, InsertFlappyBirdScore } from "./schema";

const games = new Elysia({ prefix: "/games" })
  .get("/2048/users/:userId", async ({ params }) => {
    const scores = await db.query.game2048Scores.findMany({
      where: eq(game2048Scores.userId, params.userId),
      orderBy: desc(game2048Scores.score),
      limit: 10,
    });

    if (!scores || scores.length === 0) {
      return { message: "No 2048 scores found for this user", scores: [] };
    }

    return { scores };
  }, {
    params: t.Object({ userId: t.String() }),
    response: {
      200: t.Object({
        message: t.Optional(t.String()),
        scores: t.Array(Game2048Score),
      }),
    },
  })

  .post("/2048", async ({ body }) => {
    try {
      const newScore = await db.insert(game2048Scores).values({
        userId: body.userId,
        score: body.score,
        bestTile: body.bestTile || 2,
        moves: body.moves || 0,
        time: new Date().getTime(),
      }).returning();

      return newScore[0];
    } catch (err) {
      return status(500, "Failed to create 2048 score");
    }
  }, {
    body: InsertGame2048Score,
    response: {
      200: Game2048Score,
      500: t.String(),
    },
  })

  .get("/snake/users/:userId", async ({ params }) => {
    const scores = await db.query.snakeScores.findMany({
      where: eq(snakeScores.userId, params.userId),
      orderBy: desc(snakeScores.score),
      limit: 10,
    });

    if (!scores || scores.length === 0) {
      return { message: "No snake scores found for this user", scores: [] };
    }

    return { scores };
  }, {
    params: t.Object({ userId: t.String() }),
    response: {
      200: t.Object({
        message: t.Optional(t.String()),
        scores: t.Array(SnakeScore),
      }),
    },
  })

  .post("/snake", async ({ body }) => {
    try {
      const newScore = await db.insert(snakeScores).values({
        userId: body.userId,
        score: body.score,
        duration: body.duration,
        foodEaten: body.foodEaten || 0,
        time: new Date().getTime(),
      }).returning();

      return newScore[0];
    } catch (err) {
      console.error("Error creating snake score:", err);
      return status(500, "Failed to create snake score");
    }
  }, {
    body: InsertSnakeScore,
    response: {
      200: SnakeScore,
      500: t.String(),
    },
  })

  .get("/flappybird/users/:userId", async ({ params }) => {
    const scores = await db.query.flappyBirdScores.findMany({
      where: eq(flappyBirdScores.userId, params.userId),
      orderBy: desc(flappyBirdScores.score),
      limit: 10,
    });

    if (!scores || scores.length === 0) {
      return { message: "No Flappy Bird scores found for this user", scores: [] };
    }

    return { scores };
  }, {
    params: t.Object({ userId: t.String() }),
    response: {
      200: t.Object({
        message: t.Optional(t.String()),
        scores: t.Array(FlappyBirdScore),
      }),
    },
  })

  .post("/flappybird", async ({ body }) => {
    try {
      const newScore = await db.insert(flappyBirdScores).values({
        userId: body.userId,
        score: body.score,
        pipesPassed: body.pipesPassed,
        duration: body.duration,
        time: new Date().getTime(),
      }).returning();

      return newScore[0];
    } catch (err) {
      console.error("Error creating Flappy Bird score:", err);
      return status(500, "Failed to create Flappy Bird score");
    }
  }, {
    body: InsertFlappyBirdScore,
    response: {
      200: FlappyBirdScore,
      500: t.String(),
    },
  })

  .get("/leaderboard/:game", async ({ params, query }) => {
    const limit = query.limit ? parseInt(query.limit) : 10;

    try {
      switch (params.game) {
        case "2048":
          const top2048 = await db.query.game2048Scores.findMany({
            orderBy: desc(game2048Scores.score),
            limit,
            with: {
              user: {
                columns: {
                  id: true,
                },
              },
            },
          });
          return { scores: top2048 };

        case "snake":
          const topSnake = await db.query.snakeScores.findMany({
            orderBy: desc(snakeScores.score),
            limit,
            with: {
              user: {
                columns: {
                  id: true,
                },
              },
            },
          });
          return { scores: topSnake };

        case "flappybird":
          const topFlappy = await db.query.flappyBirdScores.findMany({
            orderBy: desc(flappyBirdScores.score),
            limit,
            with: {
              user: {
                columns: {
                  id: true,
                },
              },
            },
          });
          return { scores: topFlappy };

        default:
          return status(400, "Invalid game type. Valid options: 2048, snake, flappybird");
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      return status(500, "Failed to fetch leaderboard");
    }
  }, {
    params: t.Object({ game: t.String() }),
    query: t.Object({ limit: t.Optional(t.String()) }),
    response: {
      200: t.Object({
        scores: t.Array(t.Object({
          id: t.Integer(),
          userId: t.String(),
          score: t.Integer(),
          time: t.Integer(),
          bestTile: t.Optional(t.Integer()),
          moves: t.Optional(t.Integer()),
          duration: t.Optional(t.Integer()),
          pipesPassed: t.Optional(t.Integer()),
          foodEaten: t.Optional(t.Integer()),
          user: t.Object({ id: t.String() }),
        })),
      }),
      400: t.String(),
      500: t.String(),
    },
  });

export default games;
