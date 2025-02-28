<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-12">Статистика</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8" offset-lg="2">
        <v-card class="stat-card mb-10" elevation="2" min-width="100%">
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
            <v-card-title>Всего рецептов</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="text-h4 font-weight-bold mb-2">
              {{ statistics.total_recipes || 0 }}
            </div>
            <v-row class="stat-details">
              <v-col cols="6">
                <div class="text-subtitle-2 text-medium-emphasis">На русском</div>
                <div class="text-h6">{{ statistics.rus_recipes || 0 }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2 text-medium-emphasis">На английском</div>
                <div class="text-h6">{{ statistics.eng_recipes || 0 }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="stat-card mb-6" elevation="2" min-width="100%">
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
            <v-card-title>Всего пользователей</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="text-h4 font-weight-bold mb-2">
              {{ statistics.total_users || 0 }}
            </div>
            <v-row class="stat-details">
              <v-col cols="6">
                <div class="text-subtitle-2 text-medium-emphasis">iOS</div>
                <div class="text-h6">{{ statistics.ios_users || 0 }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-subtitle-2 text-medium-emphasis">Android</div>
                <div class="text-h6">{{ statistics.android_users || 0 }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-card class="stat-card" elevation="2" min-width="100%">
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
          <v-card-text class="d-flex justify-center align-center py-6">
            <v-progress-circular
              :model-value="getIOSPercentage"
              :size="120"
              :width="12"
              color="primary"
              class="platform-chart"
            >
              {{ getIOSPercentage }}%
            </v-progress-circular>
            <div class="platform-legend ml-4">
              <div class="d-flex align-center mb-2">
                <div class="legend-dot primary"></div>
                <span class="text-body-2">iOS</span>
              </div>
              <div class="d-flex align-center">
                <div class="legend-dot grey"></div>
                <span class="text-body-2">Android</span>
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

    onMounted(() => {
      fetchStatistics()
    })

    return {
      statistics,
      loading,
      getIOSPercentage
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.3s ease;
  height: 50%;
  min-width: 700px !important;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  opacity: 0.9;
}

.stat-details {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 12px;
  margin-top: 8px;
}

.platform-chart {
  font-weight: bold;
}

.platform-legend {
  margin-left: 24px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-dot.primary {
  background-color: rgb(var(--v-theme-primary));
}

.legend-dot.grey {
  background-color: rgb(var(--v-theme-grey));
}
</style> 