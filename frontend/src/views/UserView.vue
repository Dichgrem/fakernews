<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { api } from "../api";
import LoadingSpinner from "../components/LoadingSpinner.vue";

const route = useRoute();
const user = ref(null);
const loading = ref(false);
const error = ref(null);

const userId = computed(() => route.params.id);

const joinedDate = computed(() => {
  if (!user.value?.created) return "";
  return new Date(user.value.created).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
});

const loadUser = async () => {
  loading.value = true;
  error.value = null;

  try {
    user.value = await api.getUser(userId.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load user.";
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(userId, loadUser, { immediate: true });
</script>

<template>
  <div class="user-view">
    <LoadingSpinner v-if="loading">Loading user profile...</LoadingSpinner>

    <div v-else-if="error" class="error">
      <p>Could not load user profile.</p>
      <pre>{{ error }}</pre>
      <button @click="loadUser" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="user" class="user-profile">
      <header class="profile-header">
        <div class="avatar">
          <span>{{ user.id.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="profile-info">
          <h1 class="username">{{ user.id }}</h1>
          <div class="meta">
            <span>
              <span class="label">Karma:</span>
              <strong class="value">{{ user.karma }}</strong>
            </span>
            <span class="separator">|</span>
            <span>
              <span class="label">Joined:</span>
              <strong class="value">{{ joinedDate }}</strong>
            </span>
          </div>
        </div>
      </header>

      <section v-if="user.about" class="profile-section about">
        <h2>About</h2>
        <div class="about-content" v-html="user.about" />
      </section>

      <section class="profile-section activity">
        <h2>Recent Activity</h2>
        <p class="placeholder">
          User submissions and comments will be listed here soon.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--bg-primary);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow);
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  flex-shrink: 0;
}

.username {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}
.label {
  color: var(--text-tertiary);
}
.value {
  color: var(--text-primary);
  font-weight: 600;
}
.separator {
  color: var(--border);
}

.profile-section {
  background: var(--bg-primary);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 4px var(--shadow);
}

h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.about-content {
  line-height: 1.7;
  color: var(--text-secondary);
}

.placeholder {
  color: var(--text-tertiary);
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

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
