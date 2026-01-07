<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
  rank: {
    type: Number,
    default: null,
  },
});

const domain = computed(() => {
  if (!props.story.url) return "";
  try {
    return new URL(props.story.url).hostname.replace("www.", "");
  } catch {
    return "";
  }
});

const timeAgo = computed(() => {
  const seconds = Math.floor((Date.now() - props.story.time) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 86400)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
});

const handleUpvote = (event) => {
  event.stopPropagation(); // Prevent the parent RouterLink from navigating
  // TODO: 实现点赞逻辑
  console.log("Upvote story:", props.story.id);
};
</script>

<template>
  <RouterLink :to="`/story/${story.id}`" custom v-slot="{ href, navigate }">
    <article class="story-item" :href="href" @click="navigate">
      <div class="story-rank" v-if="rank">{{ rank }}.</div>
      
      <button class="upvote-btn" @click="handleUpvote" title="Upvote">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
        </svg>
      </button>
      
      <div class="story-content">
        <div class="story-title-row">
          <span 
            class="story-title"
          >
            {{ story.title }}
          </span>
          <a 
            v-if="domain"
            :href="story.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="story-domain"
            @click.stop
          >
            ({{ domain }})
          </a>
        </div>
        
        <div class="story-meta">
          <span class="story-score">{{ story.score }} points</span>
          <span class="separator">•</span>
          <RouterLink :to="`/user/${story.by}`" class="story-author" @click.stop>
            {{ story.by }}
          </RouterLink>
          <span class="separator">•</span>
          <span class="story-time">{{ timeAgo }}</span>
          <span class="separator">•</span>
          <span class="story-comments">
            {{ story.descendants || 0 }} comments
          </span>
        </div>
      </div>
    </article>
  </RouterLink>
</template>

<style scoped>
.story-item {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 8px;
  transition: background 0.2s;
  cursor: pointer;
}

.story-item:hover {
  background: var(--bg-hover);
}

.story-item:hover .story-title {
  color: var(--link);
}

.story-item:hover .story-comments {
  color: var(--link);
}

.story-rank {
  min-width: 30px;
  color: var(--text-tertiary);
  font-weight: 500;
  text-align: right;
  font-size: 14px;
  padding-top: 2px;
}

.upvote-btn {
  padding: 4px;
  color: var(--text-tertiary);
  transition: color 0.2s;
  margin-top: 2px;
}

.upvote-btn:hover {
  color: var(--accent);
}

.story-content {
  flex: 1;
  min-width: 0;
}

.story-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.story-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--text-primary);
  text-decoration: none;
}

.story-domain {
  font-size: 13px;
  color: var(--text-tertiary);
}

.story-domain:hover {
  color: var(--link);
  text-decoration: underline;
}

.story-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--text-secondary);
}

.separator {
  color: var(--text-tertiary);
}

.story-score {
  font-weight: 500;
}

.story-author,
.story-comments {
  color: var(--text-secondary);
}

.story-author:hover {
  color: var(--link);
}

@media (max-width: 640px) {
  .story-item {
    padding: 10px;
  }
  
  .story-rank {
    min-width: 24px;
    font-size: 13px;
  }
  
  .story-title {
    font-size: 15px;
  }
  
  .story-meta {
    font-size: 12px;
  }
}
</style>
