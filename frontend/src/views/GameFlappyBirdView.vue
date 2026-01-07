<template>
  <div class="game-view-container">
    <GameFlappyBird />
  </div>
</template>

<script setup lang="ts">
import GameFlappyBird from '../components/GameFlappyBird.vue';
</script>

<style scoped>
.game-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: calc(100vh - var(--navbar-height));
}
</style>
