<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useToast } from 'vue-toastification'
export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    const drawer = ref(true)
    const menuItems = [
      { title: 'Пользователи', path: '/users', icon: 'mdi-account-group' },
      { title: 'Баллы', path: '/points', icon: 'mdi-star' },
      { title: 'Реферальная система', path: '/referral', icon: 'mdi-account-multiple' },
      { title: 'Промокоды', path: '/promo', icon: 'mdi-ticket-percent' },
      { title: 'Реклама', path: '/ads', icon: 'mdi-advertisement' },
      { title: 'Рассылки', path: '/mailing', icon: 'mdi-email' },
      { title: 'FAQ', path: '/faq', icon: 'mdi-frequently-asked-questions' },
      { title: 'Тикеты', path: '/tickets', icon: 'mdi-ticket-account' }
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
      v-if="authStore.isAuthenticated"
      v-model="drawer"
      app
      permanent
      color="grey-lighten-4"
      class="elevation-1"
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      v-if="authStore.isAuthenticated"
      app
      color="primary"
      dark
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Админ-панель</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
body {
  background-color: rgb(var(--v-theme-background));
}

.v-navigation-drawer {
  padding: 12px;
  width: 300px !important;
}

.v-list-item {
  margin-bottom: 4px;
}

.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-primary), 0.1);
}

.v-main {
  background-color: rgb(var(--v-theme-background));
}

.v-container {
  max-width: 1400px;
  margin-top: 16px;
}

.v-application {
  background-color: #f5f5f5 !important;
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
