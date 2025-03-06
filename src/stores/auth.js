import { defineStore } from 'pinia'
import axios from '../plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('/admin/auth/sign-in/', {
          username: email,
          password: password
        })
        
        if (response.data && response.data.token) {
          const token = response.data.token
          const id = response.data.user.id
          this.token = token
          localStorage.setItem('token', token)
          localStorage.setItem('userId', id)
          return true
        }
        return false
      } catch (error) {
        console.error('Login error:', error)
        if (error.response?.data) {
          console.error('Server response:', error.response.data)
        }
        return false
      }
    },

    async logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
    },

    async checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) {
        return false
      }
      
      try {
        const response = await axios.get('/admin/profile/')
        if (response.data) {
          this.user = response.data
          return true
        }
        return false
      } catch (error) {
        if (error.response?.status === 401) {
          this.token = null
          this.user = null
          localStorage.removeItem('token')
        }
        return false
      }
    }
  },

  persist: true
}) 