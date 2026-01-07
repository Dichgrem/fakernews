<template>
  <div class="game-view-container">
    <Game2048 />
  </div>
</template>

<script setup lang="ts">
import Game2048 from '../components/Game2048.vue';
</script>

<style scoped>
.game-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  min-height: calc(100vh - var(--navbar-height)); /* Adjust based on your navbar height */
}
</style>