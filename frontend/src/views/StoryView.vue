<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";
import { useAuth } from "../auth";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import CommentItem from "../components/CommentItem.vue";
import StoryItem from "../components/StoryItem.vue";

const route = useRoute();
const auth = useAuth();
const story = ref(null);
const comments = ref([]);
const loading = ref(false);
const error = ref(null);
const newComment = ref("");

const storyId = computed(() => route.params.id);

const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

const loadData = async () => {
  loading.value = true;
  error.value = null;
  try {
    const id = storyId.value;
    if (!id) return;
    const [_story, _comments] = await Promise.all([
      api.getStory(id),
      api.getComments(id),
    ]);
    story.value = _story;
    comments.value = _comments;
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load story.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  if (!newComment.value.trim() || !auth.user.value) return;
  try {
    const id = storyId.value;
    if (!id) return;
    const comment = await api.submitComment(
      id,
      newComment.value,
      auth.user.value
    );
    comments.value.unshift(comment);
    newComment.value = "";
  } catch (e) {
    error.value = "Failed to post comment. Please try again.";
    console.error(e);
  }
};

watch(storyId, loadData, { immediate: true });
</script>

<template>
  <div class="story-view">
    <LoadingSpinner v-if="loading">Loading story...</LoadingSpinner>

    <div v-else-if="error" class="error">
      <p>Could not load story details.</p>
      <pre>{{ error }}</pre>
      <button @click="loadData" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="story" class="story-details">
      <StoryItem :story="story" />
      
      <div v-if="story.text" class="story-text" v-html="story.text" />

      <section class="comments-section">
        <h2 class="comments-title">
          {{ story.descendants || 0 }} Comments
        </h2>

        <div v-if="auth.user.value" class="comment-form">
          <textarea
            v-model="newComment"
            placeholder="Add a comment..."
            rows="3"
            class="comment-input"
          />
          <button @click="submitComment" class="submit-btn">
            Submit Comment
          </button>
        </div>

        <div class="comments-list">
          <CommentItem
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.story-details {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.story-text {
  background: var(--bg-primary);
  padding: 20px 24px;
  border-radius: 8px;
  line-height: 1.7;
  word-break: break-word;
  box-shadow: 0 1px 3px var(--shadow);
}
.story-text :deep(p) {
  margin-bottom: 1em;
}
.story-text :deep(a) {
  color: var(--link);
}
.story-text :deep(pre) {
  background-color: var(--bg-secondary);
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comments-title {
  font-size: 1.25rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-input {
  resize: vertical;
  min-height: 80px;
}

.submit-btn {
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  transition: var(--transition-fast);
}
.submit-btn:hover {
  background-color: var(--accent-hover);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.error {
  padding: 24px;
  text-align: center;
  background-color: var(--bg-primary);
  border-radius: 8px;
}

.error pre {
  margin-top: 12px;
  background-color: var(--bg-secondary);
  padding: 8px;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-all;
}

.retry-btn {
  margin-top: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: var(--transition-fast);
  border: 1px solid var(--border);
  background-color: var(--accent);
  border-color: var(--accent);
  color: white;
}
.retry-btn:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}
</style>
