<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import StoryItem from "../components/StoryItem.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import { api } from "../api";

const route = useRoute();
const stories = ref([]);
const loading = ref(false);
const error = ref(null);
const page = ref(1);
const hasMore = ref(true);

const type = computed(() => route.params.type || "top");
const pageTitle = computed(
  () => `${type.value.charAt(0).toUpperCase() + type.value.slice(1)} Stories`,
);

const loadStories = async (isLoadMore = false) => {
  if (loading.value) return;
  loading.value = true;
  error.value = null;

  try {
    const newStories = await api.getStories(type.value, page.value);
    if (newStories.length === 0) {
      hasMore.value = false;
    }

    if (isLoadMore) {
      stories.value.push(...newStories);
    } else {
      stories.value = newStories;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load stories.";
    console.error("Error loading stories:", e);
  } finally {
    loading.value = false;
  }
};

const loadMore = () => {
  if (hasMore.value) {
    page.value++;
    loadStories(true);
  }
};

watch(
  () => route.params.type,
  () => {
    page.value = 1;
    hasMore.value = true;
    stories.value = [];
    loadStories();
  },
  { immediate: true },
);
</script>

<template>
  <div class="stories-view">
    <header class="stories-header">
      <h1>{{ pageTitle }}</h1>
    </header>

    <LoadingSpinner v-if="loading && stories.length === 0">
      Fetching stories...
    </LoadingSpinner>

    <div v-else-if="error" class="error">
      <p>Could not load stories. Please try again later.</p>
      <pre v-if="error">{{ error }}</pre>
      <button @click="loadStories(false)" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="stories.length > 0" class="stories-list">
      <StoryItem
        v-for="(story, index) in stories"
        :key="story.id"
        :story="story"
        :rank="index + 1"
      />
    </div>
    
    <div v-else class="no-stories">
      <p>No stories found in this category.</p>
    </div>

    <div class="stories-footer">
      <button 
        v-if="hasMore && !loading && stories.length > 0" 
        @click="loadMore" 
        class="load-more-btn"
      >
        Load More
      </button>
      <LoadingSpinner v-if="loading && stories.length > 0" />
    </div>
  </div>
</template>

<style scoped>
.stories-header {
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

h1 {
  font-size: 1.75rem;
}

.stories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stories-footer {
  padding: 24px 0;
  text-align: center;
}

.load-more-btn,
.retry-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: var(--transition-fast);
  border: 1px solid var(--border);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.load-more-btn:hover,
.retry-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--text-secondary);
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
  background-color: var(--accent);
  border-color: var(--accent);
  color: white;
}
.retry-btn:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.no-stories {
  text-align: center;
  padding: 40px;
  color: var(--text-secondary);
}
</style>
