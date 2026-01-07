<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api";
import { useAuth } from "../auth";

const router = useRouter();
const auth = useAuth();
const title = ref("");
const url = ref("");
const text = ref("");
const loading = ref(false);
const error = ref(null);
const success = ref(false);

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    if (!auth.user.value) {
      throw new Error("You must be logged in to submit a story.");
    }

    const trimmedTitle = title.value.trim();
    const trimmedUrl = url.value.trim();
    const trimmedText = text.value.trim();

    if (!trimmedTitle) {
      throw new Error("Title is required.");
    }
    if (trimmedUrl && trimmedText) {
      throw new Error("Please provide either a URL or text, but not both.");
    }
    if (!trimmedUrl && !trimmedText) {
      throw new Error("A URL or text content is required.");
    }

    const result = await api.submitStory(
      trimmedTitle,
      trimmedUrl || null,
      trimmedText || null,
      auth.user.value
    );

    success.value = true;
    title.value = "";
    url.value = "";
    text.value = "";

    // Redirect to the new story page after a short delay
    setTimeout(() => {
      router.push(`/story/${result.id}`);
    }, 1000);

  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to submit story.";
    console.error("Error submitting story:", e);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="submit-view">
    <div class="submit-box">
      <h1>Submit a New Story</h1>
      <form @submit.prevent="handleSubmit" class="submit-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input
            type="text"
            id="title"
            v-model="title"
            placeholder="A clear and interesting title"
            required
          />
        </div>

        <div class="form-group">
          <label for="url">URL</label>
          <input
            type="url"
            id="url"
            v-model="url"
            placeholder="https://example.com/article"
            :disabled="text.length > 0"
          />
        </div>
        
        <div class="separator">or</div>

        <div class="form-group">
          <label for="text">Text</label>
          <textarea
            id="text"
            v-model="text"
            rows="6"
            placeholder="Share your story or question (leave URL blank)"
            :disabled="url.length > 0"
          ></textarea>
        </div>
        
        <div v-if="error" class="message error-message">
          <strong>Error:</strong> {{ error }}
        </div>

        <div v-if="success" class="message success-message">
          <strong>Success!</strong> Redirecting to your new post...
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? "Submitting..." : "Submit Story" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.submit-view {
  display: flex;
  justify-content: center;
}
.submit-box {
  width: 100%;
  max-width: 700px;
  padding: 32px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow);
}

h1 {
  font-size: 1.75rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
}

.submit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

input:disabled, textarea:disabled {
  background-color: var(--bg-hover);
  opacity: 0.6;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

.separator {
  text-align: center;
  color: var(--text-tertiary);
  font-weight: 500;
  margin: 8px 0;
  position: relative;
}
.separator::before, .separator::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 30px);
  height: 1px;
  background-color: var(--border);
}
.separator::before { left: 0; }
.separator::after { right: 0; }


.submit-btn {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background-color: var(--accent);
  transition: var(--transition-fast);
  margin-top: 16px;
}
.submit-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
}
.submit-btn:disabled {
  background-color: var(--text-tertiary);
  cursor: not-allowed;
}

.message {
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}
.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}
</style>
