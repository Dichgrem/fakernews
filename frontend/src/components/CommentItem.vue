<script setup>
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { api } from "@/api";
import { useAuth } from "../auth";
import CommentItem from "./CommentItem.vue";

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});

const auth = useAuth();
const isCollapsed = ref(false);
const showReplyForm = ref(false);
const replyText = ref("");

const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
};

const hasChildren = computed(
  () => props.comment.children && props.comment.children.length > 0,
);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const submitReply = async () => {
  if (!replyText.value.trim() || !auth.user.value) return;
  try {
    const comment = await api.submitComment(
      props.comment.id,
      replyText.value,
      auth.user.value
    );
    if (!props.comment.children) {
      props.comment.children = [];
    }
    props.comment.children.push(comment);
    replyText.value = "";
    showReplyForm.value = false;
  } catch (error) {
    console.error("Failed to submit reply:", error);
  }
};
</script>

<template>
  <div class="comment-item">
    <div class="comment-header">
      <button @click="toggleCollapse" class="toggle-btn">
        <span v-if="isCollapsed">[+]</span>
        <span v-else>[–]</span>
      </button>
      <RouterLink :to="`/user/${comment.by}`" class="comment-author">
        {{ comment.by }}
      </RouterLink>
      <span class="comment-time">{{ timeAgo(comment.time) }} ago</span>
    </div>

    <div v-if="!isCollapsed" class="comment-body">
      <div class="comment-text" v-html="comment.text" />

      <button @click="showReplyForm = !showReplyForm" class="reply-btn">
        {{ showReplyForm ? 'Cancel' : 'Reply' }}
      </button>

      <div v-if="showReplyForm" class="reply-form">
        <textarea
          v-model="replyText"
          placeholder="Write a reply..."
          rows="3"
          class="reply-input"
        />
        <button @click="submitReply" class="submit-reply-btn">
          Submit Reply
        </button>
      </div>

      <div v-if="hasChildren" class="comment-children">
        <CommentItem
          v-for="child in comment.children"
          :key="child.id"
          :comment="child"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-item {
  position: relative;
  padding-left: 24px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.toggle-btn {
  color: var(--text-tertiary);
  font-weight: bold;
  cursor: pointer;
  width: 20px;
}
.toggle-btn:hover {
  color: var(--accent);
}

.comment-author {
  font-weight: 500;
  color: var(--text-secondary);
}
.comment-author:hover {
  color: var(--link);
}

.comment-body {
  border-left: 2px solid var(--border);
  padding-left: 24px;
}

.comment-text {
  line-height: 1.6;
  color: var(--text-primary);
  word-wrap: break-word;
}
.comment-text :deep(p) {
  margin-bottom: 0.8em;
}
.comment-text :deep(a) {
  color: var(--link);
}
.comment-text :deep(pre) {
  background-color: var(--bg-secondary);
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
}

.comment-children {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.reply-btn {
  margin-top: 8px;
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reply-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.reply-form {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  resize: vertical;
  min-height: 60px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: inherit;
}

.reply-input:focus {
  outline: none;
  border-color: var(--accent);
}

.submit-reply-btn {
  align-self: flex-start;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-reply-btn:hover {
  background-color: var(--accent-hover);
}
</style>
