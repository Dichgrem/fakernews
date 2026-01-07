<template>
  <div class="game-snake">
    <h1>Snake</h1>
    <div class="score-container">
      Score: <span class="score">{{ score }}</span>
    </div>
    <div v-if="highScore > 0" class="score-container">
      High Score: <span class="score">{{ highScore }}</span>
    </div>
    
    <button @click="startGame" v-if="!isPlaying">
      {{ gameOver ? 'Play Again' : 'Start Game' }}
    </button>
    <p v-if="!user" class="login-warning">Log in to save your high scores!</p>

    <div class="canvas-container">
      <canvas ref="gameCanvas" width="400" height="400"></canvas>
      <div v-if="gameOver" class="overlay">
        <p>Game Over!</p>
      </div>
    </div>
    
    <div class="controls-hint">
      Use Arrow Keys to move
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { api } from '@/api';
import { useAuth } from '@/auth';

// Game Constants
const CANVAS_SIZE = 400;
const GRID_SIZE = 20;
const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;
const SPEED = 100; // ms per frame

// State
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const score = ref(0);
const highScore = ref(0);
const gameOver = ref(false);
const isPlaying = ref(false);
const { user } = useAuth();

// Game Logic Variables
let snake: { x: number; y: number }[] = [];
let velocity = { x: 0, y: 0 };
let food = { x: 5, y: 5 };
let gameInterval: number | null = null;
let startTime: number = 0;
let foodEatenCount = 0;

// Initialize
onMounted(() => {
  if (gameCanvas.value) {
    ctx.value = gameCanvas.value.getContext('2d');
    // Draw initial empty board
    draw();
  }
  loadHighScore();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  stopGame();
  window.removeEventListener('keydown', handleKeydown);
});

const loadHighScore = async () => {
  const currentUserId = user.value;
  if (!currentUserId) return;

  try {
    const scores = await api.getSnakeUserScores(currentUserId);
    if (scores && scores.length > 0) {
      highScore.value = scores.reduce((max: number, s: any) => Math.max(max, s.score), 0);
    }
  } catch (e) {
    console.error("Failed to load snake scores", e);
  }
};

const startGame = () => {
  if (isPlaying.value) return;
  
  // Reset State
  snake = [{ x: 10, y: 10 }];
  velocity = { x: 0, y: 0 }; // Stationary start
  score.value = 0;
  foodEatenCount = 0;
  gameOver.value = false;
  isPlaying.value = true;
  startTime = Date.now();
  
  spawnFood();
  
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = window.setInterval(gameLoop, SPEED);
};

const stopGame = () => {
  if (gameInterval) {
    clearInterval(gameInterval);
    gameInterval = null;
  }
  isPlaying.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  // Prevent default scrolling for arrow keys
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  if (gameOver.value) return;

  // Start moving on first keypress if game started but snake stationary
  if (isPlaying.value && velocity.x === 0 && velocity.y === 0) {
     // logic below will handle direction
  }

  switch (e.key) {
    case 'ArrowUp':
      if (velocity.y !== 1) velocity = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (velocity.y !== -1) velocity = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (velocity.x !== 1) velocity = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (velocity.x !== -1) velocity = { x: 1, y: 0 };
      break;
  }
};

const gameLoop = () => {
  update();
  draw();
};

const update = () => {
  // If not moving yet, don't update snake position
  if (velocity.x === 0 && velocity.y === 0) return;

  const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

  // Wall Collision
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    handleGameOver();
    return;
  }

  // Self Collision
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      handleGameOver();
      return;
    }
  }

  snake.unshift(head);

  // Food Collision
  if (head.x === food.x && head.y === food.y) {
    score.value += 10;
    foodEatenCount++;
    spawnFood();
  } else {
    snake.pop(); // Remove tail
  }
};

const spawnFood = () => {
  food = {
    x: Math.floor(Math.random() * TILE_COUNT),
    y: Math.floor(Math.random() * TILE_COUNT)
  };
  // Ensure food doesn't spawn on snake
  for (let segment of snake) {
    if (food.x === segment.x && food.y === segment.y) {
      spawnFood();
      return;
    }
  }
};

const draw = () => {
  if (!ctx.value) return;
  
  // Clear screen
  ctx.value.fillStyle = '#222';
  ctx.value.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw Snake
  ctx.value.fillStyle = '#42b883'; // Vue Green
  for (let segment of snake) {
    ctx.value.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
  }

  // Draw Food
  ctx.value.fillStyle = '#ff5f5f'; // Red
  ctx.value.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE - 2, GRID_SIZE - 2);
};

const handleGameOver = async () => {
  gameOver.value = true;
  stopGame();
  
  const currentUserId = user.value;
  if (currentUserId && score.value > 0) {
    const duration = Math.floor((Date.now() - startTime) / 1000); // in seconds (API expects int) or ms? 
    // Schema says: duration: t.Integer()
    // Usually APIs want ms, but let's check schema/service context if possible. 
    // Backend schema just says Integer. Assuming ms based on other timestamps, but duration is usually seconds or ms.
    // Let's pass ms. Wait, SnakeScore schema has 'duration'. 
    // Let's use milliseconds to be safe for a "duration" field unless it's huge. 
    // Actually, let's look at `frontend/src/api/index.ts` again.
    // It passes duration directly. 
    
    // Let's stick to milliseconds for precision.
    const durationMs = Date.now() - startTime;
    
    try {
      await api.submitSnakeScore(currentUserId, score.value, durationMs, foodEatenCount);
      loadHighScore();
    } catch (e) {
      console.error("Failed to submit score", e);
    }
  }
};
</script>

<style scoped>
.game-snake {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}

.canvas-container {
  position: relative;
  border: 4px solid #333;
  border-radius: 4px;
  margin-top: 20px;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

.score-container {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}
.score {
  font-weight: bold;
  color: #42b883;
}

button {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 10px;
}

button:hover {
  background-color: #555;
}

.login-warning {
  color: #e67e22;
  font-weight: bold;
  margin-bottom: 10px;
}

.controls-hint {
  margin-top: 10px;
  color: #777;
}
</style>
