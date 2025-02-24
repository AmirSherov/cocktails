import { createRouter, createWebHistory } from 'vue-router'
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
      path: '/',
      redirect: '/users'
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView
    },
    {
      path: '/points',
      name: 'points',
      component: PointsView
    },
    {
      path: '/referral',
      name: 'referral',
      component: ReferralView
    },
    {
      path: '/promo',
      name: 'promo',
      component: PromoView
    },
    {
      path: '/ads',
      name: 'ads',
      component: AdsView
    },
    {
      path: '/mailing',
      name: 'mailing',
      component: MailingView
    },
    {
      path: '/faq',
      name: 'faq',
      component: FAQView
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketsView
    }
  ]
})

export default router
