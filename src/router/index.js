import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginView from '../views/LoginView.vue'
import UsersView from '../views/UsersView.vue'
import PointsView from '../views/PointsView.vue'
import ReferralView from '../views/ReferralView.vue'
import PromoView from '../views/PromoView.vue'
import AdsView from '../views/AdsView.vue'
import MailingView from '../views/MailingView.vue'
import FAQView from '../views/FAQView.vue'
import TicketsView from '../views/TicketsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      redirect: '/users'
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/points',
      name: 'points',
      component: PointsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/referral',
      name: 'referral',
      component: ReferralView,
      meta: { requiresAuth: true }
    },
    {
      path: '/promo',
      name: 'promo',
      component: PromoView,
      meta: { requiresAuth: true }
    },
    {
      path: '/ads',
      name: 'ads',
      component: AdsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/mailing',
      name: 'mailing',
      component: MailingView,
      meta: { requiresAuth: true }
    },
    {
      path: '/faq',
      name: 'faq',
      component: FAQView,
      meta: { requiresAuth: true }
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Если маршрут требует авторизации и пользователь не авторизован
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  }
  // Если пользователь авторизован и пытается зайти на страницу логина
  else if (to.path === '/login' && isAuthenticated) {
    next('/users')
  }
  // В остальных случаях разрешаем переход
  else {
    next()
  }
})

export default router
