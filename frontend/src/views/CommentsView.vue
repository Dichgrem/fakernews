<template>
    <div class="comments-view">
        <header class="comments-header">
            <h1>Top Comments</h1>
        </header>

        <LoadingSpinner v-if="loading">Fetching comments...</LoadingSpinner>

        <div v-else-if="error" class="error">
            <p>Could not load comments.</p>
            <pre>{{ error }}</pre>
        </div>

        <div v-else class="comments-list">
            <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-wrapper"
            >
                <CommentItem :comment="comment" />
                <div class="context-link">
                    <router-link :to="`/story/${comment.parent}`"
                        >View Context</router-link
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "../api";
import CommentItem from "../components/CommentItem.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const comments = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
    try {
        comments.value = await api.getTopComments();
    } catch (e) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.comments-view {
    width: 100%;
    margin: 0 auto;
    padding: 0 12px 40px;
}
.comments-header {
    margin-bottom: 24px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 16px;
}
.comments-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}
.comment-wrapper {
    background: var(--bg-primary);
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 1px 2px var(--shadow);
    width: 100%;
}
.context-link {
    margin-top: 10px;
    font-size: 0.9em;
    text-align: right;
}
.context-link a {
    color: var(--accent);
}
.error {
    padding: 20px;
    text-align: center;
}
</style>
