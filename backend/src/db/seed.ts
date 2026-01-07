import { db } from ".";
import { users, items } from "./schema";

console.log("Seeding database...");

// Create a user
const [user] = await db.insert(users).values({
    id: "admin",
    about: "I am the admin.",
}).returning();

console.log(`Created user: ${user.id}`);

// Create stories
await db.insert(items).values([
    {
        by: user.id,
        type: "story",
        title: "Drizzle ORM, a lightweight and performant TypeScript ORM",
        url: "https://orm.drizzle.team/",
        text: "Drizzle ORM is a lightweight and performant TypeScript ORM. It's a great choice for your next project.",
        score: 110,
    },
    {
        by: user.id,
        type: "story",
        title: "ElysiaJS, a fast, and friendly Bun web framework",
        url: "https://elysiajs.com/",
        text: "ElysiaJS is a fast, and friendly Bun web framework. It's designed to be simple and easy to use.",
        score: 95,
    },
    {
        by: user.id,
        type: "story",
        title: "Vue.js - The Progressive JavaScript Framework",
        url: "https://vuejs.org/",
        score: 150,
    },
    {
        by: user.id,
        type: "job",
        title: "Frontend Engineer at Vercel",
        url: "https://vercel.com/careers",
        score: 1,
    }
]);

console.log("Database seeded successfully!");
process.exit(0);
