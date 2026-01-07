<script setup>
import { RouterView } from "vue-router";
import NavBar from "./components/NavBar.vue";
</script>

<template>
    <div id="app-wrapper">
        <NavBar />
        <main class="container">
            <RouterView v-slot="{ Component }">
                <Transition name="fade" mode="out-in">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </main>
    </div>
</template>

<style scoped>
#app-wrapper {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

main {
    flex: 1;
    padding-top: 32px;
    padding-bottom: 64px;
}
</style>
