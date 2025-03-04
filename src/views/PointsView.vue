<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="d-flex align-center">
        <h2>Баллы</h2>
        <v-spacer></v-spacer>
        <v-text-field
          v-if="activeTab === 1"
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mx-4"
          @input="handleSearch"
        />
      </v-card-title>

      <v-tabs v-model="activeTab">
        <v-tab>Начисления баллов</v-tab>
        <v-tab>Баллы пользователей</v-tab>
      </v-tabs>

      <v-card-text>
        <v-data-table
          v-if="activeTab === 0"
          :headers="configHeaders"
          :items="pointsConfig"
          :loading="loadingConfig"
        >
          <template v-slot:item.actions="{ item }">
            <v-btn size="34" icon x-small @click="editConfig(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
        </v-data-table>
        <v-data-table
          v-else
          :headers="headers"
          :items="users"
          :search="search"
          :loading="loading"
        >
          <template #[`item.id`]="{ item }">
            <v-btn
              text
              color="primary"
              variant="text"
              :to="{ name: 'users', query: { search: item.id }}"
              class="pa-0"
            >
              {{ item.id }}
            </v-btn>
          </template>
          <template #[`item.actions`]="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  density="compact"
                  size="24"
                  icon
                  color="primary"
                  class="mr-1"
                  v-bind="attrs"
                  v-on="on"
                  @click="showHistory(item)"
                >
                  <v-icon size="16">mdi-history</v-icon>
                </v-btn>
              </template>
              <span>История операций</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  density="compact"
                  size="24"
                  icon
                  color="success"
                  v-bind="attrs"
                  v-on="on"
                  @click="openPointDialog(item)"
                >
                  <v-icon size="16">mdi-plus-circle</v-icon>
                </v-btn>
              </template>
              <span>Добавить операцию</span>
            </v-tooltip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="configDialog" max-width="500px">
      <v-card>
        <v-card-title>Редактировать начисление баллов</v-card-title>
        <v-card-text>
          <v-form ref="configForm" v-model="validConfig">
            <v-text-field
              v-model="editedConfig.name"
              label="Название"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-text-field
              v-model.number="editedConfig.value"
              label="Значение"
              type="number"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeConfigDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveConfig">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="pointDialog" max-width="500px">
      <v-card>
        <v-card-title>Добавить операцию</v-card-title>
        <v-card-text>
          <v-form ref="pointForm" v-model="validPoint">
            <v-text-field
              v-model.number="editedPoint.points"
              label="Баллы"
              type="number"
              :rules="[
                v => !!v || 'Обязательное поле',
                v => v > 0 || 'Значение должно быть больше 0'
              ]"
              required
            />
            <v-text-field
              v-model="editedPoint.text"
              label="Описание"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-switch
              v-model="editedPoint.charge"
              label="Списание"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closePointDialog">Отмена</v-btn>
          <v-btn color="success" text @click="savePoint">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="900px">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span>История операций пользователя {{ selectedUser?.email }}</span>
          <v-btn icon @click="closeHistoryDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="historyHeaders"
            :items="selectedUser?.points || []"
            :loading="false"
          >
            <template #[`item.user`]="{ item }">
              <v-btn
                text
                color="primary"
                variant="text"
                :to="{ name: 'users', query: { search: item.user }}"
                class="pa-0"
              >
                {{ item.user }}
              </v-btn>
            </template>
            <template #[`item.charge`]="{ item }">
              <v-chip :color="item.charge ? 'error' : 'success'" text-color="white">
                {{ item.charge ? 'Списание' : 'Начисление' }}
              </v-chip>
            </template>
            <template #[`item.created_at`]="{ item }">
              {{ new Date(item.created_at).toLocaleString('ru-RU') }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'PointsView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const loadingConfig = ref(false)
    const configDialog = ref(false)
    const pointDialog = ref(false)
    const users = ref([])
    const pointsConfig = ref([])
    const validConfig = ref(false)
    const validPoint = ref(false)
    const selectedUser = ref(null)
    const configForm = ref(null)
    const pointForm = ref(null)
    const activeTab = ref(0)
    const historyDialog = ref(false)
    const loadingHistory = ref(false)
    const userHistory = ref([])

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Email', key: 'email' },
      { title: 'Телефон', key: 'phone' },
      { title: 'Всего баллов', key: 'total_points' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const configHeaders = [
      { title: 'Название', key: 'name' },
      { title: 'Значение', key: 'value' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const historyHeaders = [
      { title: 'ID', key: 'id' },
      { title: 'Баллы', key: 'points' },
      { title: 'Описание', key: 'text' },
      { title: 'Операция', key: 'charge' },
      { title: 'Дата', key: 'created_at' }
    ]

    const editedConfig = ref({
      id: null,
      name: '',
      value: 0
    })

    const defaultConfig = {
      id: null,
      name: '',
      value: 0
    }

    const editedPoint = ref({
      points: 0,
      text: '',
      charge: false,
      user: null
    })

    const defaultPoint = {
      points: 0,
      text: '',
      charge: false,
      user: null
    }

    const fetchUsers = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/point/')
        console.log('Points response:', response.data)
        users.value = Array.isArray(response.data) ? response.data : 
                     response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading users:', error)
        toast.error('Ошибка при загрузке пользователей')
        users.value = []
      }
      loading.value = false
    }

    const fetchConfig = async () => {
      loadingConfig.value = true
      try {
        const response = await axios.get('/admin/point/config/')
        console.log('Config response:', response.data)
        pointsConfig.value = Array.isArray(response.data) ? response.data : 
                            response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading config:', error)
        toast.error('Ошибка при загрузке конфигурации')
        pointsConfig.value = []
      }
      loadingConfig.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/point/?search=${search.value}`)
          console.log('Search response:', response.data)
          users.value = Array.isArray(response.data) ? response.data : 
                       response.data.results ? response.data.results : []
        } catch (error) {
          console.error('Error searching:', error)
          toast.error('Ошибка при поиске')
          users.value = []
        }
        loading.value = false
      } else {
        fetchUsers()
      }
    }

    const showHistory = (item) => {
      selectedUser.value = item
      historyDialog.value = true
    }

    const closeHistoryDialog = () => {
      historyDialog.value = false
      selectedUser.value = null
    }

    const editConfig = (item) => {
      editedConfig.value = { ...item }
      configDialog.value = true
    }

    const closeConfigDialog = () => {
      configDialog.value = false
      editedConfig.value = { ...defaultConfig }
    }

    const saveConfig = async () => {
      if (!configForm.value.validate()) return

      try {
        await axios.patch(`/admin/point/config/${editedConfig.value.id}/`, editedConfig.value)
        toast.success('Конфигурация успешно обновлена')
        closeConfigDialog()
        fetchConfig()
      } catch (error) {
        console.error('Error saving config:', error)
        toast.error('Ошибка при сохранении конфигурации')
      }
    }

    const openPointDialog = (user) => {
      selectedUser.value = user
      editedPoint.value = { ...defaultPoint, user: user.id }
      pointDialog.value = true
    }

    const closePointDialog = () => {
      pointDialog.value = false
      editedPoint.value = { ...defaultPoint }
      selectedUser.value = null
    }

    const savePoint = async () => {
      if (!pointForm.value.validate()) return

      try {
        await axios.post('/admin/point/', {
          ...editedPoint.value,
          user: selectedUser.value.id
        })
        toast.success('Операция успешно создана')
        closePointDialog()
        // Обновляем данные пользователя и его историю
        fetchUsers()
        if (selectedUser.value) {
          showHistory(selectedUser.value)
        }
      } catch (error) {
        console.error('Error saving point:', error)
        toast.error('Ошибка при создании операции')
      }
    }

    onMounted(() => {
      fetchUsers()
      fetchConfig()
    })

    return {
      search,
      loading,
      loadingConfig,
      configDialog,
      pointDialog,
      users,
      pointsConfig,
      headers,
      configHeaders,
      historyHeaders,
      editedConfig,
      editedPoint,
      validConfig,
      validPoint,
      configForm,
      pointForm,
      activeTab,
      historyDialog,
      selectedUser,
      handleSearch,
      showHistory,
      closeHistoryDialog,
      editConfig,
      closeConfigDialog,
      saveConfig,
      openPointDialog,
      closePointDialog,
      savePoint
    }
  }
}
</script> 