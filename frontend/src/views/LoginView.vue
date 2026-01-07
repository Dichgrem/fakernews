<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../auth";
import { api } from "../api";

const username = ref("");
const password = ref("");
const isRegister = ref(false);
const loading = ref(false);
const error = ref(null);
const router = useRouter();
const auth = useAuth();

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  
  if (!username.value) {
    error.value = "Username is required.";
    loading.value = false;
    return;
  }

  try {
    if (isRegister.value) {
      // Register new user
      await api.createUser(username.value);
    } else {
      // For "login", we just check if the user exists.
      const existingUser = await api.getUser(username.value);
      if (!existingUser) {
        throw new Error("User does not exist. Please register first.");
      }
    }
    // If registration or user check is successful, "log in" the user
    auth.login(username.value);
    router.push("/");
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-view">
    <div class="login-box">
      <h1>{{ isRegister ? "Create Account" : "Login" }}</h1>
      <form @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="Enter your username"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? "Loading..." : isRegister ? "Register" : "Login" }}
        </button>
      </form>
      <div class="toggle-mode">
        <button @click="isRegister = !isRegister" class="toggle-btn">
          {{
            isRegister
              ? "Already have an account? Login"
              : "Don't have an account? Register"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow);
}

h1 {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-secondary);
}

.submit-btn {
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  background-color: var(--accent);
  transition: var(--transition-fast);
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.submit-btn:disabled {
  background-color: var(--text-tertiary);
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
  margin: 0;
}

.toggle-mode {
  text-align: center;
  margin-top: 24px;
}

.toggle-btn {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
}
.toggle-btn:hover {
  text-decoration: underline;
}
</style>
