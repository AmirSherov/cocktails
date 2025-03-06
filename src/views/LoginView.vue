<template>
  <div class="auth-wrapper">
    <div class="auth-container">
      <v-card class="auth-card" elevation="8">
        <div class="auth-header">
          <v-icon size="48" color="primary" class="mb-4">mdi-shield-lock</v-icon>
          <h1 class="auth-title">Вход в админ-панель</h1>
        </div>
        <v-card-text class="auth-form">
          <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="Имя пользователя"
              name="email"
              prepend-icon="mdi-account"
              type="text"
              required
              :rules="[v => !!v || 'Имя пользователя обязательно']"
              class="mb-4"
              density="comfortable"
              variant="outlined"
              bg-color="surface"
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
              density="comfortable"
              variant="outlined"
              bg-color="surface"
            />
            <v-btn
              color="primary"
              block
              type="submit"
              :loading="loading"
              :disabled="!valid"
              height="48"
              class="auth-submit-btn"
            >
              <v-icon left class="mr-2">mdi-login</v-icon>
              Войти
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
  </div>
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
.auth-wrapper {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.auth-card {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.auth-header {
  padding: 40px 32px 0;
  text-align: center;
}

.auth-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.auth-form {
  padding: 32px !important;
}

:deep(.v-field) {
  border-radius: 12px !important;
  transition: all 0.3s ease;
  padding-left: 16px !important;
}

:deep(.v-field__outline) {
  border-width: 1px !important;
}

:deep(.v-field__input) {
  padding: 16px 16px 16px 0 !important;
  font-size: 15px !important;
}

:deep(.v-label) {
  font-size: 15px;
  opacity: 0.8;
}

:deep(.v-input__prepend) {
  margin-right: 8px !important;
  opacity: 0.7;
}

.auth-submit-btn {
  margin-top: 24px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.auth-submit-btn:not(:disabled) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

@media (max-width: 600px) {
  .auth-container {
    max-width: 100%;
  }

  .auth-header {
    padding: 32px 24px 0;
  }

  .auth-form {
    padding: 24px !important;
  }

  .auth-title {
    font-size: 22px;
  }
}
</style> 