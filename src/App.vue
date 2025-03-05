<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const drawer = ref(true)
    const menuItems = [
      { title: 'Пользователи', path: '/users', icon: 'mdi-account-group' },
      { title: 'Баллы', path: '/points', icon: 'mdi-star' },
      { title: 'Реферальная система', path: '/referral', icon: 'mdi-account-multiple' },
      { title: 'Промокоды', path: '/promo', icon: 'mdi-ticket-percent' },
      { title: 'Реклама', path: '/ads', icon: 'mdi-bullhorn' },
      { title: 'Рассылки', path: '/mailing', icon: 'mdi-email' },
      { title: 'FAQ', path: '/faq', icon: 'mdi-frequently-asked-questions' },
      { title: 'Тикеты', path: '/tickets', icon: 'mdi-ticket-account' },
      { title: 'Статистика', path: '/statistics', icon: 'mdi-chart-box' },
      { title: 'Инструменты', path: '/tools', icon: 'mdi-tools' },
      { title: 'Ингредиенты', path: '/ingredients', icon: 'mdi-food-variant' },
      { title: 'Рецепты', path: '/recipes', icon: 'mdi-book-open-variant' }
    ]

    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }
    return {
      drawer,
      menuItems,
      authStore,
      logout: handleLogout
    }
  }
}
</script>
<template>
  <v-app>
    <v-navigation-drawer
      v-if="$route.name !== 'login'"
      v-model="drawer"
      permanent
    >
      <div class="text-h6 font-weight-bold primary--text">Админ-панель</div>

      <v-list class="pa-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
          rounded="lg"
          class="mb-1"
        >
          <template v-slot:prepend>
            <v-icon
              :color="$route.path.startsWith(item.path) ? 'white' : 'primary'"
              class="menu-icon"
            >
              {{ item.icon }}
            </v-icon>
          </template>
          <v-list-item-title 
            class="menu-title"
            :class="{ 'font-weight-bold': $route.path.startsWith(item.path) }"
          >
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn
            block
            color="error"
            variant="tonal"
            @click="logout"
            class="logout-btn"
          >
            <v-icon start>mdi-logout</v-icon>
            Выйти
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar
      v-if="$route.name !== 'login'"
      app
      color="white"
      elevation="1"
    >
      <v-toolbar-title class="text-primary font-weight-bold">Админ-панель</v-toolbar-title>
      <v-spacer />
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
body {
  background-color: #f5f7fa;
}

.sidebar {
  border-right: none !important;
}

.sidebar-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.v-navigation-drawer {
  padding: 0;
  width: 260px !important;
}

.v-list-item {
  margin-bottom: 4px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.v-list-item--active {
  background: linear-gradient(118deg, var(--v-primary-base), var(--v-primary-darken1));
  color: white;
  transform: scale(1.02);
}

.v-list-item--active .v-icon {
  color: white !important;
}

.v-list-item:hover:not(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

.menu-icon {
  transition: all 0.3s ease;
}

.menu-title {
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.v-list-item--active .menu-title {
  letter-spacing: 0.4px;
}

.logout-btn {
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
}

.v-main {
  background-color: #f5f7fa;
}

.v-container {
  max-width: 1400px;
  margin-top: 16px;
}

.auth-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}
</style>