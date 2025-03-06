<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Статистика</h1>
        <v-divider class="mb-6"></v-divider>
      </v-col>
    </v-row>

    <v-row >
      <v-col cols="12" xl="10" >
        <v-card width="200%" class="stat-card mb-6" elevation="2">
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
        <v-card width="200%" class="stat-card mb-6" elevation="2">
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
                    {{ getIOSPercentage.toFixed(1) }}%
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
                    {{ getAndroidPercentage.toFixed(1) }}%
                  </v-chip>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card width="200%" class="stat-card" elevation="2">
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
                <div class="platform-distribution">
                  <svg viewBox="0 0 42 42" class="donut">
                    <circle class="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="#fff"></circle>
                    <circle class="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" stroke-width="4"></circle>
                    <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" 
                      stroke="#FF5252" stroke-width="4.5" 
                      :stroke-dasharray="`${getAndroidPercentage} ${100 - getAndroidPercentage}`"
                      stroke-dashoffset="25"></circle>
                    <circle class="donut-segment" cx="21" cy="21" r="15.91549430918954" fill="transparent" 
                      stroke="#1867C0" stroke-width="4.5" 
                      :stroke-dasharray="`${getIOSPercentage} ${100 - getIOSPercentage}`"
                      :stroke-dashoffset="25 - getAndroidPercentage"></circle>
                  </svg>
                </div>
                <div class="platform-labels">
                  <div class="platform-label">
                    <span class="label-dot" style="background-color: #FF5252"></span>
                    <span class="label-text">iOS {{ getAndroidPercentage.toFixed(1) }}%</span>
                  </div>
                  <div class="platform-label">
                    <span class="label-dot" style="background-color: #1867C0"></span>
                    <span class="label-text">Android {{ getIOSPercentage.toFixed(1) }}%</span>
                  </div>
                </div>
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
      const total = statistics.value.ios_users + statistics.value.android_users
      if (!total) return 0
      return (statistics.value.ios_users / total) * 100
    })

    const getAndroidPercentage = computed(() => {
      const total = statistics.value.ios_users + statistics.value.android_users
      if (!total) return 0
      return (statistics.value.android_users / total) * 100
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
  position: relative;
  display: flex;
  align-items: center;
  gap: 32px;
}

.platform-distribution {
  position: relative;
  width: 250px;
  height: 250px;
}

.platform-labels {
  text-align: left;
  padding-left: 16px;
}

.platform-label {
  display: flex;
  align-items: center;
  margin: 12px 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.label-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

.label-text {
  color: rgba(0, 0, 0, 0.87);
}

@media (max-width: 960px) {
  .platform-label {
    font-size: 1.1rem;
  }
  
  .platform-chart-container {
    gap: 24px;
  }
}

.platform-chip {
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0 16px;
}

:deep(.v-progress-circular__overlay) {
  stroke-linecap: round;
  transition: all 0.3s ease;
}

.circular-chart {
  width: 200px;
  height: 200px;
  transform: rotate(-90deg);
}

.circular-chart path {
  transition: all 0.3s ease;
}

@media (max-width: 960px) {
  .platform-percentages div {
    font-size: 1rem;
  }
}

.donut {
  width: 250px;
  height: 250px;
  transform: rotate(-90deg);
}

.donut-ring {
  stroke: #eeeeee;
}

.donut-segment {
  transition: stroke-dasharray 0.3s ease;
}
</style> 