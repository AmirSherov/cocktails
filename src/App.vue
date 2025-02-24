<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const drawer = ref(true)
    const menuItems = [
      { title: 'Пользователи', path: '/users', icon: 'mdi-account-group' },
      { title: 'Баллы', path: '/points', icon: 'mdi-star' },
      { title: 'Реферальная система', path: '/referral', icon: 'mdi-account-multiple-plus' },
      { title: 'Промокоды', path: '/promo', icon: 'mdi-ticket-percent' },
      { title: 'Реклама', path: '/ads', icon: 'mdi-advertisement' },
      { title: 'Рассылки', path: '/mailing', icon: 'mdi-email' },
      { title: 'FAQ', path: '/faq', icon: 'mdi-frequently-asked-questions' },
      { title: 'Тикеты', path: '/tickets', icon: 'mdi-ticket-account' }
    ]

    return {
      drawer,
      menuItems
    }
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
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
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="lg"
          class="mb-1"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      elevation="1"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>Админ панель</v-app-bar-title>
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
</style>
