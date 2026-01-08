<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/api";
import { useAuth } from "@/auth";

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

const { user } = useAuth();

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

const isUpvoted = computed(() => props.story.upvoted || false);

const handleUpvote = async (event) => {
  event.stopPropagation();

  if (!user.value) {
    alert("Please log in to upvote");
    return;
  }

  // 乐观更新：切换状态
  const wasUpvoted = isUpvoted.value;
  props.story.upvoted = !wasUpvoted;
  props.story.score += wasUpvoted ? -1 : 1;

  try {
    const result = await api.voteItem(props.story.id, 'up', user.value);
    // 同步服务器返回的状态
    if (result) {
      props.story.score = result.score;
      props.story.upvoted = result.upvoted;
    }
  } catch (error) {
    // 出错时回滚
    props.story.upvoted = wasUpvoted;
    props.story.score += wasUpvoted ? 1 : -1;
    console.error("Failed to toggle upvote:", error);
  }
};

</script>

<template>
  <RouterLink :to="`/story/${story.id}`" custom v-slot="{ href, navigate }">
    <article class="story-item" :href="href" @click="navigate">
      <div class="story-rank" v-if="rank">{{ rank }}.</div>
      
      <div class="upvote-score-container">
        <button
          class="upvote-btn"
          :class="{ upvoted: isUpvoted }"
          @click="handleUpvote"
          title="Upvote"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M5 0 L10 10 L0 10 Z" fill="currentColor" />
          </svg>
        </button>
        <div class="story-score">{{ story.score }}</div>
      </div>
      
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

.upvote-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.upvote-btn {
  padding: 4px;
  color: var(--text-tertiary);
  transition: all 0.2s;
}

.upvote-btn:hover {
  color: var(--accent);
  transform: scale(1.2);
}

.upvote-btn.upvoted {
  color: #ff6600;
}

.story-score {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 13px;
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

.upvote-score-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
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
