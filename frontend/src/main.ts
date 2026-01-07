import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import StoriesView from "./views/StoriesView.vue";
import StoryView from "./views/StoryView.vue";
import UserView from "./views/UserView.vue";
import SubmitView from "./views/SubmitView.vue";
import LoginView from "./views/LoginView.vue";
import Game2048View from "./views/Game2048View.vue";
import GameSnakeView from "./views/GameSnakeView.vue";
import GameFlappyBirdView from "./views/GameFlappyBirdView.vue";
import LeaderboardView from "./views/LeaderboardView.vue";
import CommentsView from "./views/CommentsView.vue";
import "./style.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/top" },
    { path: "/:type(top|new|best|ask|show|jobs)", component: StoriesView },
    { path: "/comments", component: CommentsView },
    { path: "/story/:id", component: StoryView },
    { path: "/user/:id", component: UserView },
    { path: "/submit", component: SubmitView },
    { path: "/login", component: LoginView },
    { path: "/game/2048", component: Game2048View },
    { path: "/game/snake", component: GameSnakeView },
    { path: "/game/flappybird", component: GameFlappyBirdView },
    { path: "/leaderboard", component: LeaderboardView },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

createApp(App).use(router).mount("#app");
