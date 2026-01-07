<template>
  <div class="game-flappy">
    <h1>Flappy Bird</h1>
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

    <div class="canvas-container" @click="flap">
      <canvas ref="gameCanvas" width="320" height="480"></canvas>
      <div v-if="gameOver" class="overlay">
        <p>Game Over!</p>
      </div>
    </div>
    
    <div class="controls-hint">
      Press Space or Click to Jump
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { api } from '@/api';
import { useAuth } from '@/auth';

// Game Constants
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 480;
const GRAVITY = 0.25;
const JUMP = -4.5;
const PIPE_SPEED = 2;
const PIPE_SPAWN_RATE = 1500; // ms
const PIPE_GAP = 100;

// State
const gameCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const score = ref(0);
const highScore = ref(0);
const gameOver = ref(false);
const isPlaying = ref(false);
const { user } = useAuth();

// Game Logic Variables
let bird = { x: 50, y: 150, velocity: 0, radius: 10 };
let pipes: { x: number; topHeight: number; passed: boolean }[] = [];
let lastTime = 0;
let pipeInterval: number | null = null;
let animationFrameId: number | null = null;
let startTime = 0;

onMounted(() => {
  if (gameCanvas.value) {
    ctx.value = gameCanvas.value.getContext('2d');
    draw(); // Initial draw
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
    const scores = await api.getFlappyBirdUserScores(currentUserId);
    if (scores && scores.length > 0) {
      highScore.value = scores.reduce((max: number, s: any) => Math.max(max, s.score), 0);
    }
  } catch (e) {
    console.error("Failed to load flappy bird scores", e);
  }
};

const startGame = () => {
  if (isPlaying.value) return;

  // Reset
  bird = { x: 50, y: 150, velocity: 0, radius: 10 };
  pipes = [];
  score.value = 0;
  gameOver.value = false;
  isPlaying.value = true;
  startTime = Date.now();
  lastTime = 0;

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(gameLoop);

  if (pipeInterval) clearInterval(pipeInterval);
  pipeInterval = window.setInterval(spawnPipe, PIPE_SPAWN_RATE);
};

const stopGame = () => {
  isPlaying.value = false;
  if (pipeInterval) {
    clearInterval(pipeInterval);
    pipeInterval = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space') {
    e.preventDefault();
    flap();
  }
};

const flap = () => {
  if (!isPlaying.value) return;
  bird.velocity = JUMP;
};

const spawnPipe = () => {
  const minHeight = 50;
  const maxHeight = CANVAS_HEIGHT - 50 - PIPE_GAP;
  const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  
  pipes.push({
    x: CANVAS_WIDTH,
    topHeight,
    passed: false
  });
};

const gameLoop = (timestamp: number) => {
  if (!lastTime) lastTime = timestamp;
  // const deltaTime = timestamp - lastTime; // Can use for frame-independent movement if needed
  lastTime = timestamp;

  update();
  draw();

  if (isPlaying.value) {
    animationFrameId = requestAnimationFrame(gameLoop);
  }
};

const update = () => {
  // Bird Physics
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Floor/Ceiling Collision
  if (bird.y + bird.radius >= CANVAS_HEIGHT || bird.y - bird.radius <= 0) {
    handleGameOver();
    return;
  }

  // Pipe Logic
  for (let i = pipes.length - 1; i >= 0; i--) {
    let pipe = pipes[i];
    pipe.x -= PIPE_SPEED;

    // Remove off-screen pipes
    if (pipe.x + 50 < 0) {
      pipes.splice(i, 1);
      continue;
    }

    // Collision Detection
    // Bird bounds approx
    const birdLeft = bird.x - bird.radius;
    const birdRight = bird.x + bird.radius;
    const birdTop = bird.y - bird.radius;
    const birdBottom = bird.y + bird.radius;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + 50; // Pipe width assumed 50
    
    // Top Pipe
    if (
      birdRight > pipeLeft && 
      birdLeft < pipeRight && 
      birdTop < pipe.topHeight
    ) {
      handleGameOver();
      return;
    }

    // Bottom Pipe
    if (
      birdRight > pipeLeft && 
      birdLeft < pipeRight && 
      birdBottom > pipe.topHeight + PIPE_GAP
    ) {
      handleGameOver();
      return;
    }

    // Score counting
    if (!pipe.passed && birdLeft > pipeRight) {
      score.value++;
      pipe.passed = true;
    }
  }
};

const draw = () => {
  if (!ctx.value) return;

  // Background
  ctx.value.fillStyle = '#70c5ce'; // Sky blue
  ctx.value.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Bird
  ctx.value.fillStyle = '#f1c40f'; // Yellow
  ctx.value.beginPath();
  ctx.value.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.value.fill();
  ctx.value.stroke();

  // Pipes
  ctx.value.fillStyle = '#2ecc71'; // Green
  for (let pipe of pipes) {
    // Top Pipe
    ctx.value.fillRect(pipe.x, 0, 50, pipe.topHeight);
    
    // Bottom Pipe
    ctx.value.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, 50, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
    
    // Borders
    ctx.value.strokeRect(pipe.x, 0, 50, pipe.topHeight);
    ctx.value.strokeRect(pipe.x, pipe.topHeight + PIPE_GAP, 50, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
  }
  
  // Ground line
  ctx.value.fillStyle = '#ded895';
  ctx.value.fillRect(0, CANVAS_HEIGHT - 10, CANVAS_WIDTH, 10);
};

const handleGameOver = async () => {
  gameOver.value = true;
  stopGame();

  const currentUserId = user.value;
  if (currentUserId && score.value > 0) {
    const duration = Date.now() - startTime;
    try {
      // API: submitFlappyBirdScore: async (userId: string, score: number, pipesPassed: number, duration: number)
      await api.submitFlappyBirdScore(currentUserId, score.value, score.value, duration); // pipesPassed is basically score here
      loadHighScore();
    } catch (e) {
      console.error("Failed to submit score", e);
    }
  }
};
</script>

<style scoped>
.game-flappy {
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
  cursor: pointer;
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
  color: #f1c40f;
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
