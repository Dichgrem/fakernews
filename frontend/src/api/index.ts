import { edenTreaty } from "@elysiajs/eden";
import type { App } from "../../../backend/src/index";

const treaty = edenTreaty<App>("http://localhost:3000");

// --- HELPER FUNCTIONS ---

const fetchCommentTree = async (commentId: number) => {
  const { data: comment, error } = await treaty.item[commentId].get();
  if (error) {
    console.error(`Failed to fetch comment ${commentId}:`, error);
    return null;
  }
  if (!comment || typeof comment !== "object" || !("kids" in comment)) {
    return comment;
  }
  
  if ('kids' in comment && comment.kids && comment.kids.length > 0) {
    const children = await Promise.all(comment.kids.map(fetchCommentTree));
    // @ts-ignore
    comment.children = children.filter(Boolean);
  } else {
    // @ts-ignore
    comment.children = [];
  }
  return comment;
};

function createFriendlyError(error: any): Error {
  let errorMessage = "An unknown error occurred.";
  if (error && typeof error === 'object') {
    if (typeof error.value === 'string') {
      errorMessage = error.value;
    } else if (error.value && typeof error.value === 'object' && 'message' in error.value && typeof error.value.message === 'string') {
      errorMessage = error.value.message;
    } else if (error.status) {
      errorMessage = `HTTP Error: ${error.status}`;
    } else {
        // Fallback for generic object errors
        errorMessage = JSON.stringify(error.value || error);
    }
  } else if (typeof error === 'string') {
      errorMessage = error;
  }
  return new Error(errorMessage);
}

// --- EXPORTED API ---

export const api = {
  getStories: async (type = "top", page = 1) => {
    const limit = 30;
    const offset = (page - 1) * limit;

    let endpoint;
    if (type === "jobs") {
      endpoint = treaty.top.jobs;
    } else {
      endpoint = treaty.top.stories;
    }

    const { data: ids, error: idsError } = await endpoint.get({
      $query: { limit, offset },
    });

    if (idsError) {
      console.error("Failed to fetch story IDs:", idsError);
      throw createFriendlyError(idsError);
    }
    if (!ids) return [];

    const storyPromises = ids.map(id => treaty.item[id].get());
    const results = await Promise.all(storyPromises);

    return results
      .map(({ data: story }) => {
        if (story && typeof story === 'object' && 'id' in story) {
          // Shim the 'descendants' property for the StoryItem component
          // @ts-ignore
          story.descendants = 'kids' in story && story.kids?.length || 0;
          return story;
        }
        return null;
      })
      .filter(Boolean);
  },

  getStory: async (id: string) => {
    const { data: story, error } = await treaty.item[id].get();
    if (error) throw createFriendlyError(error);
    if (story && typeof story === 'object' && 'id' in story) {
        // @ts-ignore
        story.descendants = 'kids' in story && story.kids?.length || 0;
    }
    return story;
  },

  getComments: async (storyId: string) => {
    const { data: story, error } = await treaty.item[storyId].get();
    if (error) throw createFriendlyError(error);
    if (!story || typeof story !== 'object' || !('kids' in story) || !story.kids) return [];

    const commentPromises = story.kids.map(fetchCommentTree);
    const comments = await Promise.all(commentPromises);
    return comments.filter(Boolean);
  },

  getUser: async (id: string) => {
    const { data: user, error } = await treaty.user[id].get();
    if (error) throw createFriendlyError(error);
    return user;
  },

  createUser: async (id: string, about?: string) => {
    const { data, error } = await treaty.user.post({ id, about });
    if (error) throw createFriendlyError(error);
    return data;
  },

  submitStory: async (title: string, url: string | null, text: string | null, by: string) => {
    if (!by) throw new Error("User must be logged in to submit a story.");

    const payload = {
        by,
        type: "story" as const,
        title,
        url: url || "", // Always include 'url' as a string, default to empty string if null/empty
        ...(text && { text }),
    };

    const { data, error } = await treaty.item.post(payload);
    if (error) throw createFriendlyError(error);
    return data;
  },

  submitComment: async (storyId: string, text: string, by: string) => {
    if (!by) throw new Error("User must be logged in to comment.");

    const { data, error } = await treaty.item.post({
      by,
      type: "comment",
      parent: Number(storyId),
      text,
    });
    if (error) throw createFriendlyError(error);
    
    if (data) {
        // @ts-ignore
        data.children = [];
    }
    return data;
  },

  deleteItem: async (id: string) => {
    const { error } = await treaty.item[id].delete();
    if (error) throw createFriendlyError(error);
    return true;
  },

  voteItem: async (id: string, type: 'up' | 'down') => {
    const { error } = await treaty.item.items[id].vote.post({ type });
    if (error) throw createFriendlyError(error);
    return true;
  },

  getUserSubmittedItems: async (userId: string, type?: 'story' | 'comment' | 'job') => {
    const { data, error } = await treaty.user[userId].items.get({ $query: { type } });
    if (error) throw createFriendlyError(error);
    return data;
  },

  updateUserKarma: async (id: string, amount: number) => {
    const { data, error } = await treaty.user[id].karma.patch({ amount });
    if (error) throw createFriendlyError(error);
    return data;
  },

  getTopComments: async (page = 1) => {
    const limit = 30;
    const offset = (page - 1) * limit;

    const { data: ids, error: idsError } = await treaty.top.comments.get({
      $query: { limit, offset },
    });

    if (idsError) {
      console.error("Failed to fetch comment IDs:", idsError);
      throw createFriendlyError(idsError);
    }
    if (!ids) return [];

    const commentPromises = ids.map(id => fetchCommentTree(id));
    const comments = await Promise.all(commentPromises);

    return comments.filter(Boolean);
  },

  // --- Game APIs ---
  get2048UserScores: async (userId: string) => {
    const { data, error } = await treaty.games["2048"].users[userId].get();
    if (error) throw createFriendlyError(error);
    // @ts-ignore
    return data.scores;
  },

  submit2048Score: async (userId: string, score: number, bestTile?: number, moves?: number) => {
    const { data, error } = await treaty.games["2048"].post({ userId, score, bestTile, moves });
    if (error) throw createFriendlyError(error);
    return data;
  },

  getSnakeUserScores: async (userId: string) => {
    const { data, error } = await treaty.games.snake.users[userId].get();
    if (error) throw createFriendlyError(error);
    // @ts-ignore
    return data.scores;
  },

  submitSnakeScore: async (userId: string, score: number, duration: number, foodEaten?: number) => {
    const { data, error } = await treaty.games.snake.post({ userId, score, duration, foodEaten });
    if (error) throw createFriendlyError(error);
    return data;
  },

  getFlappyBirdUserScores: async (userId: string) => {
    const { data, error } = await treaty.games.flappybird.users[userId].get();
    if (error) throw createFriendlyError(error);
    // @ts-ignore
    return data.scores;
  },

  submitFlappyBirdScore: async (userId: string, score: number, pipesPassed: number, duration: number) => {
    const { data, error } = await treaty.games.flappybird.post({ userId, score, pipesPassed, duration });
    if (error) throw createFriendlyError(error);
    return data;
  },

  getGameLeaderboard: async (game: '2048' | 'snake' | 'flappybird', limit?: number) => {
    const { data, error } = await treaty.games.leaderboard[game].get({ $query: { limit: limit?.toString() } });
    if (error) throw createFriendlyError(error);
    // @ts-ignore
    return data.scores;
  },
};