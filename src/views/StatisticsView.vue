<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Статистика</h1>
        <v-divider class="mb-6"></v-divider>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" xl="10" lg="11">
        <!-- Рецепты -->
        <v-card class="stat-card mb-6" elevation="2">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                class="stat-icon"
                color="primary"
                size="32"
              >
                mdi-book-open-page-variant
              </v-icon>
            </template>
            <v-card-title>Рецепты</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h3 font-weight-bold mb-1">
                  {{ statistics.total_recipes || 0 }}
                </div>
                <div class="text-subtitle-1 text-medium-emphasis">
                  Всего рецептов
                </div>
              </div>
              <v-chip
                color="primary"
                size="large"
                class="stat-chip"
              >
                100%
              </v-chip>
            </div>
            <v-divider class="mb-4"></v-divider>
            <v-row class="stat-details">
              <v-col cols="6">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h5 mb-1">{{ statistics.rus_recipes || 0 }}</div>
                    <div class="text-subtitle-2 text-medium-emphasis">На русском</div>
                  </div>
                  <v-chip
                    color="info"
                    size="small"
                  >
                    {{ getRussianRecipesPercentage }}%
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h5 mb-1">{{ statistics.eng_recipes || 0 }}</div>
                    <div class="text-subtitle-2 text-medium-emphasis">На английском</div>
                  </div>
                  <v-chip
                    color="info"
                    size="small"
                  >
                    {{ getEnglishRecipesPercentage }}%
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Пользователи -->
        <v-card class="stat-card mb-6" elevation="2">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                class="stat-icon"
                color="success"
                size="32"
              >
                mdi-account-group
              </v-icon>
            </template>
            <v-card-title>Пользователи</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="text-h3 font-weight-bold mb-1">
                  {{ statistics.total_users || 0 }}
                </div>
                <div class="text-subtitle-1 text-medium-emphasis">
                  Всего пользователей
                </div>
              </div>
              <v-chip
                color="success"
                size="large"
                class="stat-chip"
              >
                100%
              </v-chip>
            </div>
            <v-divider class="mb-4"></v-divider>
            <v-row class="stat-details">
              <v-col cols="6">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h5 mb-1">{{ statistics.ios_users || 0 }}</div>
                    <div class="text-subtitle-2 text-medium-emphasis">iOS</div>
                  </div>
                  <v-chip
                    color="primary"
                    size="small"
                  >
                    {{ getIOSPercentage }}%
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="6">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h5 mb-1">{{ statistics.android_users || 0 }}</div>
                    <div class="text-subtitle-2 text-medium-emphasis">Android</div>
                  </div>
                  <v-chip
                    color="error"
                    size="small"
                  >
                    {{ getAndroidPercentage }}%
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Платформы -->
        <v-card class="stat-card" elevation="2">
          <v-card-item>
            <template v-slot:prepend>
              <v-icon
                class="stat-icon"
                color="info"
                size="32"
              >
                mdi-cellphone
              </v-icon>
            </template>
            <v-card-title>Распределение платформ</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="d-flex justify-center align-center py-6">
              <div class="platform-chart-container">
                <v-progress-circular
                  :model-value="getIOSPercentage"
                  :size="200"
                  :width="20"
                  color="primary"
                  class="platform-chart"
                >
                  {{ getIOSPercentage }}%
                </v-progress-circular>
                <div class="platform-chart-label">iOS</div>
              </div>
              <v-divider vertical class="mx-12" style="height: 160px"></v-divider>
              <div class="platform-chart-container">
                <v-progress-circular
                  :model-value="getAndroidPercentage"
                  :size="200"
                  :width="20"
                  color="error"
                  class="platform-chart"
                >
                  {{ getAndroidPercentage }}%
                </v-progress-circular>
                <div class="platform-chart-label">Android</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from '@/plugins/axios'
import { ref, onMounted, computed } from 'vue'

export default {
  name: 'StatisticsView',
  setup() {
    const statistics = ref({
      total_recipes: 0,
      rus_recipes: 0,
      eng_recipes: 0,
      total_users: 0,
      ios_users: 0,
      android_users: 0
    })
    const loading = ref(false)

    const fetchStatistics = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/statistics/')
        statistics.value = {
          total_recipes: parseInt(response.data.total_recipes) || 0,
          rus_recipes: parseInt(response.data.rus_recipes) || 0,
          eng_recipes: parseInt(response.data.eng_recipes) || 0,
          total_users: parseInt(response.data.total_users) || 0,
          ios_users: parseInt(response.data.ios_users) || 0,
          android_users: parseInt(response.data.android_users) || 0
        }
      } catch (error) {
        console.error('Error fetching statistics:', error)
      }
      loading.value = false
    }

    const getIOSPercentage = computed(() => {
      if (!statistics.value.total_users) return 0
      return Math.round((statistics.value.ios_users / statistics.value.total_users) * 100)
    })

    const getAndroidPercentage = computed(() => {
      if (!statistics.value.total_users) return 0
      return Math.round((statistics.value.android_users / statistics.value.total_users) * 100)
    })

    const getRussianRecipesPercentage = computed(() => {
      if (!statistics.value.total_recipes) return 0
      return Math.round((statistics.value.rus_recipes / statistics.value.total_recipes) * 100)
    })

    const getEnglishRecipesPercentage = computed(() => {
      if (!statistics.value.total_recipes) return 0
      return Math.round((statistics.value.eng_recipes / statistics.value.total_recipes) * 100)
    })

    onMounted(() => {
      fetchStatistics()
    })

    return {
      statistics,
      loading,
      getIOSPercentage,
      getAndroidPercentage,
      getRussianRecipesPercentage,
      getEnglishRecipesPercentage
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 12px;
  min-width: 100%;
  margin: 0 -12px;
  width: calc(100% + 24px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.12) !important;
}

.stat-icon {
  opacity: 0.9;
}

.stat-details {
  padding-top: 12px;
}

.platform-chart {
  font-weight: bold;
  font-size: 2.5rem;
}

.platform-chart-container {
  text-align: center;
  padding: 24px;
}

.platform-chart-label {
  margin-top: 24px;
  font-size: 1.25rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
}

.stat-chip {
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 16px;
}

:deep(.v-progress-circular__overlay) {
  stroke-linecap: round;
}

@media (max-width: 960px) {
  .platform-chart {
    font-size: 1.5rem;
  }
  
  .platform-chart-container {
    padding: 10px;
  }
}
</style> 