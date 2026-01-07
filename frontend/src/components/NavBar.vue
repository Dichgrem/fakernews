<script setup>
import { RouterLink, useRoute } from "vue-router";
import { computed, ref } from "vue";
import logoUrl from "../assets/logo.svg";
import { useAuth } from "../auth";

const route = useRoute();
const auth = useAuth();
const currentPath = computed(() => route.path);

const navItems = [
  { name: "Top", path: "/top" },
  { name: "New", path: "/new" },
  { name: "Best", path: "/best" },
  { name: "Ask", path: "/ask" },
  { name: "Show", path: "/show" },
  { name: "Jobs", path: "/jobs" },
  { name: "Comments", path: "/comments" },
];

const gameItems = [
  { name: "2048", path: "/game/2048" },
  { name: "Snake", path: "/game/snake" },
  { name: "Flappy", path: "/game/flappybird" },
  { name: "Leaders", path: "/leaderboard" },
];

const isGamesActive = computed(() => {
  return gameItems.some(item => currentPath.value.startsWith(item.path));
});

const handleLogout = () => {
  if (confirm("Are you sure you want to log out?")) {
    auth.logout();
    // Redirect to home or login page after logout
    route.path !== '/' && (window.location.href = '/');
  }
};
</script>

<template>
  <header class="navbar">
    <div class="container">
      <div class="nav-content">
        <RouterLink to="/" class="logo">
          <img :src="logoUrl" alt="Faker News" class="logo-icon" />
          <span class="logo-text">Faker News</span>
        </RouterLink>

        <nav class="nav-links">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="{ active: currentPath.startsWith(item.path) }"
            class="nav-link"
          >
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- Games Dropdown -->
        <div class="nav-item-dropdown" :class="{ active: isGamesActive }">
          <span class="nav-link dropdown-trigger">Games ▾</span>
          <div class="dropdown-menu">
            <RouterLink
              v-for="item in gameItems"
              :key="item.path"
              :to="item.path"
              class="dropdown-item"
              :class="{ active: currentPath.startsWith(item.path) }"
            >
              {{ item.name }}
            </RouterLink>
          </div>
        </div>

        <div class="nav-actions">
          <template v-if="auth.user.value">
            <RouterLink to="/submit" class="nav-btn submit">Submit</RouterLink>
            <RouterLink :to="`/user/${auth.user.value}`" class="nav-link user-link">
              {{ auth.user.value }}
            </RouterLink>
            <button @click="handleLogout" class="nav-btn logout">Logout</button>
          </template>
          <RouterLink v-else to="/login" class="nav-btn login">Login</RouterLink>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px var(--shadow);
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 16px; /* Reduced from 24px */
  height: 60px;
}

/* ... other styles ... */

.nav-links {
  display: flex;
  gap: 6px; /* Reduced from 8px */
  flex: 1;
  align-items: center;
  overflow-x: auto; /* Allow scrolling if it still overflows on tiny screens */
  scrollbar-width: none; /* Hide scrollbar Firefox */
}
.nav-links::-webkit-scrollbar {
  display: none; /* Hide scrollbar Chrome/Safari */
}

.nav-link {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 6px;
  transition: var(--transition-fast);
  white-space: nowrap; /* Prevent text wrapping */
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.active {
  color: var(--accent);
  background: var(--bg-hover);
}

/* Dropdown Styles */
.nav-item-dropdown {
  position: relative;
  display: inline-block;
  height: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--bg-primary);
  min-width: 160px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 8px 0;
  z-index: 101;
}

.nav-item-dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--bg-hover);
}

.dropdown-item.active {
  color: var(--accent);
  background-color: var(--bg-hover);
  font-weight: bold;
}

.nav-item-dropdown.active .dropdown-trigger {
  color: var(--accent);
  font-weight: bold;
}


.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0; /* Prevent actions from shrinking */
}

.user-link {
  font-weight: 600;
}

.nav-btn {
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 500;
  transition: var(--transition-fast);
  text-align: center;
  white-space: nowrap;
}

.nav-btn.login {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.nav-btn.login:hover {
  background-color: var(--bg-hover);
}

.nav-btn.submit {
  background-color: var(--accent);
  color: white;
}

.nav-btn.submit:hover {
  background-color: var(--accent-hover);
}

.nav-btn.logout {
  background-color: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.nav-btn.logout:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .nav-content {
    gap: 16px;
  }

  .nav-links {
    gap: 4px;
  }

  .logo-text {
    display: none;
  }
}

@media (max-width: 500px) {
  .nav-link {
    padding: 6px 8px;
    font-size: 14px;
  }
  .nav-btn {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>

