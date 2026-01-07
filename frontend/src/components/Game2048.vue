<template>
  <div class="game-2048">
    <h1>2048</h1>
    <div class="score-container">
      Score: <span class="score">{{ score }}</span>
    </div>
    <div v-if="highScore > 0" class="score-container">
      High Score: <span class="score">{{ highScore }}</span>
    </div>
    <button @click="newGame">New Game</button>
    <p v-if="!user" class="login-warning">Log in to save your high scores!</p>
    <div class="grid-container" ref="gameContainer">
      <div v-for="(row, rowIndex) in grid" :key="rowIndex" class="grid-row">
        <div v-for="(cell, colIndex) in row" :key="colIndex" class="grid-cell" :class="`tile-${cell}`">
          <div v-if="cell !== 0" class="tile-content">
            {{ cell }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="gameOver" class="game-over-overlay">
      <p>Game Over!</p>
      <button @click="newGame">Play Again</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { api } from '@/api';
import { useAuth } from '@/auth';

const gridSize = 4;
const grid = ref<number[][]>([]);
const score = ref(0);
const gameOver = ref(false);
const moves = ref(0); // Track moves for persistence

const gameContainer = ref<HTMLElement | null>(null); // Ref for the game container
const startX = ref(0);
const startY = ref(0);
const threshold = 30; // Minimum distance for a swipe

const { user } = useAuth();
const highScore = ref(0);

const initializeGrid = () => {
  grid.value = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  score.value = 0;
  gameOver.value = false;
  moves.value = 0;
  addRandomTile();
  addRandomTile();
};

const addRandomTile = () => {
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] === 0) {
        emptyCells.push({ r, c });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid.value[r][c] = Math.random() < 0.9 ? 2 : 4;
  }
};

const getBestTile = () => {
  let max = 0;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] > max) {
        max = grid.value[r][c];
      }
    }
  }
  return max;
};

// --- Game Logic (Move, Merge) ---

const slide = (row: number[]) => {
  const arr = row.filter(val => val);
  const missing = gridSize - arr.length;
  const zeros = Array(missing).fill(0);
  return arr.concat(zeros);
};

const combine = (row: number[]) => {
  for (let i = 0; i < gridSize - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      row[i + 1] = 0;
      score.value += row[i];
    }
  }
  return row;
};

const moveLeft = () => {
  let changed = false;
  for (let r = 0; r < gridSize; r++) {
    const original = grid.value[r].slice();
    let row = grid.value[r];
    row = slide(row);
    row = combine(row);
    row = slide(row);
    grid.value[r] = row;
    if (JSON.stringify(original) !== JSON.stringify(row)) {
      changed = true;
    }
  }
  return changed;
};

const rotateGrid = (matrix: number[][]) => {
  return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
};

const moveRight = () => {
  // Rotate 180 (or just reverse rows), move left, reverse back
  // Easier: Reverse each row, move left, reverse back
  let changed = false;
  for (let r = 0; r < gridSize; r++) {
    const original = grid.value[r].slice();
    let row = grid.value[r].slice().reverse();
    row = slide(row);
    row = combine(row);
    row = slide(row);
    grid.value[r] = row.reverse();
    if (JSON.stringify(original) !== JSON.stringify(grid.value[r])) {
      changed = true;
    }
  }
  return changed;
};

const moveUp = () => {
  // Rotate -90 (transposed then reversed?), move left, rotate back
  // Rotate Left (counter-clockwise): Transpose then reverse rows? No.
  // Standard Rotate Clockwise: Transpose then reverse columns.
  // Let's implement moveUp by processing columns.
  
  let changed = false;
  // Transpose grid to operate on rows (which are actually columns)
  let transposed = grid.value[0].map((_, colIndex) => grid.value.map(row => row[colIndex]));
  
  for (let r = 0; r < gridSize; r++) {
    const original = transposed[r].slice();
    let row = transposed[r];
    row = slide(row);
    row = combine(row);
    row = slide(row);
    transposed[r] = row;
    if (JSON.stringify(original) !== JSON.stringify(row)) {
      changed = true;
    }
  }
  
  // Transpose back
  if (changed) {
    grid.value = transposed[0].map((_, colIndex) => transposed.map(row => row[colIndex]));
  }
  return changed;
};

const moveDown = () => {
  let changed = false;
  let transposed = grid.value[0].map((_, colIndex) => grid.value.map(row => row[colIndex]));
  
  for (let r = 0; r < gridSize; r++) {
    const original = transposed[r].slice();
    let row = transposed[r].slice().reverse();
    row = slide(row);
    row = combine(row);
    row = slide(row);
    transposed[r] = row.reverse();
    if (JSON.stringify(original) !== JSON.stringify(transposed[r])) {
      changed = true;
    }
  }
  
  if (changed) {
    grid.value = transposed[0].map((_, colIndex) => transposed.map(row => row[colIndex]));
  }
  return changed;
};

const checkGameOver = () => {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid.value[r][c] === 0) return;
      if (c < gridSize - 1 && grid.value[r][c] === grid.value[r][c + 1]) return;
      if (r < gridSize - 1 && grid.value[r][c] === grid.value[r + 1][c]) return;
    }
  }
  gameOver.value = true;
};

const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
  if (gameOver.value) return;

  let moved = false;
  if (direction === 'left') moved = moveLeft();
  else if (direction === 'right') moved = moveRight();
  else if (direction === 'up') moved = moveUp();
  else if (direction === 'down') moved = moveDown();

  if (moved) {
    moves.value++;
    addRandomTile();
    checkGameOver();
  }
};

// --- Input Handling ---

const handleKeyDown = (e: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }

  switch (e.key) {
    case 'ArrowLeft': handleMove('left'); break;
    case 'ArrowRight': handleMove('right'); break;
    case 'ArrowUp': handleMove('up'); break;
    case 'ArrowDown': handleMove('down'); break;
  }
};

const handleTouchStart = (e: TouchEvent) => {
  startX.value = e.touches[0].clientX;
  startY.value = e.touches[0].clientY;
};

const handleTouchEnd = (e: TouchEvent) => {
  if (gameOver.value) return;

  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const diffX = endX - startX.value;
  const diffY = endY - startY.value;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) handleMove('right');
      else handleMove('left');
    }
  } else {
    if (Math.abs(diffY) > threshold) {
      if (diffY > 0) handleMove('down');
      else handleMove('up');
    }
  }
};

const handleMouseDown = (e: MouseEvent) => {
  startX.value = e.clientX;
  startY.value = e.clientY;
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseUp = (e: MouseEvent) => {
  document.removeEventListener('mouseup', handleMouseUp);
  if (gameOver.value) return;

  const endX = e.clientX;
  const endY = e.clientY;

  const diffX = endX - startX.value;
  const diffY = endY - startY.value;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) handleMove('right');
      else handleMove('left');
    }
  } else {
    if (Math.abs(diffY) > threshold) {
      if (diffY > 0) handleMove('down');
      else handleMove('up');
    }
  }
};

// --- API Calls ---

const submitScore = async () => {
  const currentUserId = user.value;
  if (score.value === 0 || !currentUserId) return;

  const bestTile = getBestTile();

  try {
    const response = await api.submit2048Score(currentUserId, score.value, bestTile, moves.value);
    if (!response || (response as any).error) {
      console.error("Failed to submit 2048 score");
    } else {
      loadScores();
    }
  } catch (error) {
    console.error("Error submitting 2048 score:", error);
  }
};

const loadScores = async () => {
  const currentUserId = user.value;
  if (!currentUserId) return;

  try {
    const userScores = await api.get2048UserScores(currentUserId);
    if (userScores && userScores.length > 0) {
      const highestScore = userScores.reduce((max: number, current: any) => Math.max(max, current.score), 0);
      highScore.value = highestScore;
    } else {
      highScore.value = 0;
    }
  } catch (error) {
    console.error("Error loading 2048 scores:", error);
  }
};

const newGame = () => {
  initializeGrid();
};

watch(gameOver, (newVal) => {
  if (newVal) {
    submitScore();
  }
});

onMounted(() => {
  initializeGrid();
  loadScores();
  window.addEventListener('keydown', handleKeyDown);
  if (gameContainer.value) {
    gameContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameContainer.value.addEventListener('touchend', handleTouchEnd);
    gameContainer.value.addEventListener('mousedown', handleMouseDown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (gameContainer.value) {
    gameContainer.value.removeEventListener('touchstart', handleTouchStart);
    gameContainer.value.removeEventListener('touchend', handleTouchEnd);
    gameContainer.value.removeEventListener('mousedown', handleMouseDown);
    // mouseup is removed in handleMouseUp or here just in case
  }
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
.game-2048 {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}

h1 {
  color: #776e65;
  margin-bottom: 10px;
}

.score-container {
  font-size: 1.5em;
  color: #776e65;
  margin-bottom: 20px;
}

.score {
  font-weight: bold;
  color: #ee776e;
}

button {
  background-color: #8f7a66;
  color: #f9f6f2;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 20px;
}

button:hover {
  background-color: #9f8b77;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  grid-template-rows: repeat(4, 100px);
  gap: 10px;
  background-color: #bbada0;
  padding: 10px;
  border-radius: 6px;
  position: relative;
  touch-action: none;
  user-select: none;
}

.grid-row {
  display: contents;
}

.grid-cell {
  width: 100px;
  height: 100px;
  background-color: rgba(238, 228, 218, 0.35);
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5em;
  font-weight: bold;
  color: #776e65;
  transition: all 0.1s ease-in-out;
}

.tile-content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Tile styling */
.tile-2 { background-color: #eee4da; color: #776e65; }
.tile-4 { background-color: #ede0c8; color: #776e65; }
.tile-8 { background-color: #f2b179; color: #f9f6f2; }
.tile-16 { background-color: #f59563; color: #f9f6f2; }
.tile-32 { background-color: #f67c5f; color: #f9f6f2; }
.tile-64 { background-color: #f65e3b; color: #f9f6f2; }
.tile-128 { background-color: #edcf72; color: #f9f6f2; font-size: 2em; }
.tile-256 { background-color: #edcc61; color: #f9f6f2; font-size: 2em; }
.tile-512 { background-color: #edc850; color: #f9f6f2; font-size: 2em; }
.tile-1024 { background-color: #edc53f; color: #f9f6f2; font-size: 1.5em; }
.tile-2048 { background-color: #edc22e; color: #f9f6f2; font-size: 1.5em; }

.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 6px;
}

.game-over-overlay p {
  font-size: 3em;
  font-weight: bold;
  color: #776e65;
  margin-bottom: 20px;
}
</style>