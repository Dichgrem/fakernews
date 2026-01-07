<template>
  <div class="leaderboard-view">
    <h1>Game Leaderboards</h1>
    
    <div class="boards-container">
      <!-- 2048 Leaderboard -->
      <div class="board">
        <h2>2048</h2>
        <div v-if="loading2048">Loading...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in top2048" :key="score.id">
              <td>{{ index + 1 }}</td>
              <td>
                <router-link :to="`/user/${score.user?.id || score.userId}`">
                  {{ score.user?.id || score.userId }}
                </router-link>
              </td>
              <td>{{ score.score }}</td>
            </tr>
            <tr v-if="top2048.length === 0">
              <td colspan="3">No scores yet</td>
            </tr>
          </tbody>
        </table>
        <div class="play-link">
          <router-link to="/game/2048">Play 2048</router-link>
        </div>
      </div>

      <!-- Snake Leaderboard -->
      <div class="board">
        <h2>Snake</h2>
        <div v-if="loadingSnake">Loading...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in topSnake" :key="score.id">
              <td>{{ index + 1 }}</td>
              <td>
                <router-link :to="`/user/${score.user?.id || score.userId}`">
                  {{ score.user?.id || score.userId }}
                </router-link>
              </td>
              <td>{{ score.score }}</td>
            </tr>
            <tr v-if="topSnake.length === 0">
              <td colspan="3">No scores yet</td>
            </tr>
          </tbody>
        </table>
        <div class="play-link">
          <router-link to="/game/snake">Play Snake</router-link>
        </div>
      </div>

      <!-- Flappy Bird Leaderboard -->
      <div class="board">
        <h2>Flappy Bird</h2>
        <div v-if="loadingFlappy">Loading...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(score, index) in topFlappy" :key="score.id">
              <td>{{ index + 1 }}</td>
              <td>
                <router-link :to="`/user/${score.user?.id || score.userId}`">
                  {{ score.user?.id || score.userId }}
                </router-link>
              </td>
              <td>{{ score.score }}</td>
            </tr>
            <tr v-if="topFlappy.length === 0">
              <td colspan="3">No scores yet</td>
            </tr>
          </tbody>
        </table>
        <div class="play-link">
          <router-link to="/game/flappybird">Play Flappy Bird</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/api';

const top2048 = ref<any[]>([]);
const topSnake = ref<any[]>([]);
const topFlappy = ref<any[]>([]);

const loading2048 = ref(true);
const loadingSnake = ref(true);
const loadingFlappy = ref(true);

onMounted(() => {
  // Fetch independently to allow partial loading
  fetch2048();
  fetchSnake();
  fetchFlappy();
});

const fetch2048 = async () => {
  try {
    const scores = await api.getGameLeaderboard('2048');
    top2048.value = scores || [];
  } catch (err) {
    console.error("Failed to load 2048 leaderboard", err);
  } finally {
    loading2048.value = false;
  }
};

const fetchSnake = async () => {
  try {
    const scores = await api.getGameLeaderboard('snake');
    topSnake.value = scores || [];
  } catch (err) {
    console.error("Failed to load Snake leaderboard", err);
  } finally {
    loadingSnake.value = false;
  }
};

const fetchFlappy = async () => {
  try {
    const scores = await api.getGameLeaderboard('flappybird');
    topFlappy.value = scores || [];
  } catch (err) {
    console.error("Failed to load Flappy Bird leaderboard", err);
  } finally {
    loadingFlappy.value = false;
  }
};
</script>

<style scoped>
.leaderboard-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.boards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

.board {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  min-width: 300px;
  flex: 1;
  box-shadow: 0 2px 4px var(--shadow);
}

h2 {
  text-align: center;
  margin-bottom: 15px;
  color: var(--text-primary);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

th {
  font-weight: 600;
  color: var(--text-secondary);
}

.play-link {
  margin-top: 15px;
  text-align: center;
}

.play-link a {
  display: inline-block;
  padding: 8px 16px;
  background-color: var(--accent);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
}
.play-link a:hover {
  background-color: var(--accent-hover);
}
</style>