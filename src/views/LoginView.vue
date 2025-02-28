<template>
  <body>
    <div class="auth-page">
    <v-card class="auth-card">
      <v-card-title class="text-center pa-4">
        <h2>Вход в админ-панель</h2>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="email"
            label="Имя пользователя"
            name="email"
            prepend-icon="mdi-account"
            type="text"
            required
            :rules="[v => !!v || 'Email обязателен']"
            class="mb-4"
          />
          <v-text-field
            v-model="password"
            label="Пароль"
            name="password"
            prepend-icon="mdi-lock"
            type="password"
            required
            :rules="[v => !!v || 'Пароль обязателен']"
            class="mb-6"
            @keyup.enter="handleLogin"
          />
          <v-btn
            color="primary"
            block
            type="submit"
            :loading="loading"
            :disabled="!valid"
            height="44"
          >
            Войти
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
  </body>
</template>
<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()

    const form = ref(null)
    const valid = ref(false)
    const loading = ref(false)
    const email = ref('')
    const password = ref('')
    onMounted(() => {
      if (authStore.isAuthenticated) {
        router.push('/users')
      }
    }) 
    const handleLogin = async (e) => {
      e.preventDefault()
      if (!form.value.validate()) return

      loading.value = true
      try {
        const success = await authStore.login(email.value, password.value)
        if (success) {
          toast.success('Успешный вход под именем ' + email.value)
          router.push('/users')
        } else {
          toast.error('Неверный логин или пароль')
        }
      } catch (error) {
        toast.error('Ошибка входа: ' + (error.message || 'Неизвестная ошибка'))
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      valid,
      loading,
      email,
      password,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-page {
  height: 100vh;
  display: flex;
  position: relative;
  left: 50%;
  width: 100%;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  background: rgb(255, 255, 255);
}

.v-card-title {
  padding: 32px !important;
  background: transparent;
}

.v-card-title h2 {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-align: center;
  width: 100%;
}

.v-card-text {
  padding: 32px !important;
  background: transparent;
}

.v-text-field {
  margin-bottom: 24px !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
  background: #f5f5f5 !important;
  min-height: 56px !important;
}

:deep(.v-field__outline) {
  display: none;
}

:deep(.v-field__input) {
  padding: 16px 20px !important;
  font-size: 16px !important;
  min-height: 56px !important;
}

:deep(.v-label) {
  font-size: 16px;
  color: #666;
  margin-top: -2px;
}

:deep(.v-input__prepend) {
  margin-right: 12px !important;
}

:deep(.mdi-account::before),
:deep(.mdi-lock::before) {
  font-size: 24px;
  color: #666;
}

.v-btn {
  text-transform: none;
  font-size: 18px;
  font-weight: 500;
  height: 56px !important;
  border-radius: 12px;
  margin-top: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.v-btn:active {
  transform: translateY(0);
}
</style> 