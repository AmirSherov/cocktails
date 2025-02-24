<template>
  <v-container>
    <!-- Таблица конфигурации начисления баллов -->
    <v-card class="mb-4">
      <v-card-title>Начисления баллов</v-card-title>
      <v-data-table
        :headers="configHeaders"
        :items="pointsConfig"
        :loading="loadingConfig"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editConfig(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Таблица пользователей с баллами -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Баллы пользователей</h2>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mx-4"
          @input="handleSearch"
        />
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        @click:row="expandRow"
      >
        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length">
              <v-card flat>
                <v-card-title class="d-flex justify-space-between">
                  <span>История операций</span>
                  <v-btn color="primary" @click="openPointDialog(item)">
                    Добавить операцию
                  </v-btn>
                </v-card-title>
                <v-data-table
                  :headers="historyHeaders"
                  :items="item.history || []"
                  hide-default-footer
                >
                  <template v-slot:item.charge="{ item }">
                    <v-chip :color="item.charge ? 'error' : 'success'">
                      {{ item.charge ? 'Списание' : 'Начисление' }}
                    </v-chip>
                  </template>
                </v-data-table>
              </v-card>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог редактирования конфигурации -->
    <v-dialog v-model="configDialog" max-width="500px">
      <v-card>
        <v-card-title>Редактировать начисление баллов</v-card-title>
        <v-card-text>
          <v-form ref="configForm" v-model="validConfig">
            <v-text-field
              v-model="editedConfig.name"
              label="Название"
              required
            />
            <v-text-field
              v-model.number="editedConfig.value"
              label="Значение"
              type="number"
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

    <!-- Диалог добавления операции -->
    <v-dialog v-model="pointDialog" max-width="500px">
      <v-card>
        <v-card-title>Добавить операцию</v-card-title>
        <v-card-text>
          <v-form ref="pointForm" v-model="validPoint">
            <v-text-field
              v-model.number="editedPoint.points"
              label="Баллы"
              type="number"
              required
            />
            <v-text-field
              v-model="editedPoint.text"
              label="Описание"
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
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
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

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Email', key: 'email' },
      { title: 'Телефон', key: 'phone' },
      { title: 'Всего баллов', key: 'total_points' }
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
        const response = await axios.get('/api/admin/point/')
        users.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке пользователей')
      }
      loading.value = false
    }

    const fetchConfig = async () => {
      loadingConfig.value = true
      try {
        const response = await axios.get('/api/admin/point/config/')
        pointsConfig.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке конфигурации')
      }
      loadingConfig.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/point/?search=${search.value}`)
          users.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchUsers()
      }
    }

    const expandRow = (item) => {
      if (!item.history) {
        // Загружаем историю операций при первом раскрытии
        axios.get(`/api/admin/point/?user=${item.id}`)
          .then(response => {
            item.history = response.data
          })
          .catch(() => {
            toast.error('Ошибка при загрузке истории операций')
          })
      }
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
      try {
        await axios.patch(`/api/admin/point/config/${editedConfig.value.id}/`, editedConfig.value)
        toast.success('Конфигурация успешно обновлена')
        closeConfigDialog()
        fetchConfig()
      } catch (error) {
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
      try {
        await axios.post('/api/admin/point/', editedPoint.value)
        toast.success('Операция успешно создана')
        closePointDialog()
        // Обновляем данные пользователя
        if (selectedUser.value) {
          expandRow(selectedUser.value)
        }
        fetchUsers()
      } catch (error) {
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
      handleSearch,
      expandRow,
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