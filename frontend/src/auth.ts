import { ref, readonly } from "vue";

const USER_STORAGE_KEY = "fakernews_user";

const currentUser = ref(localStorage.getItem(USER_STORAGE_KEY) || null);

function login(username: string) {
  if (!username) return;
  currentUser.value = username;
  localStorage.setItem(USER_STORAGE_KEY, username);
}

function logout() {
  currentUser.value = null;
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function useAuth() {
  return {
    user: readonly(currentUser),
    login,
    logout,
  };
}
