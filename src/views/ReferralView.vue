<template>
  <v-container fluid class="pa-10">
    <v-card class="full-width-card">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <h4>Реферальная система</h4>
        <div class="d-flex align-center gap-4" style="min-width: 60%;">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            hide-details
            class="search-field flex-grow-1"
            @input="handleSearch"
            density="comfortable"
          />
          <v-btn color="primary" class="ml-4" min-width="140">
            Создать код
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="referralCodes"
        :search="search"
        :loading="loading"
        class="referral-table elevation-1"
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

        <template #[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                size="24"
                color="primary"
                class="mr-2"
                v-bind="attrs"
                v-on="on"
                @click="editCode(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Редактировать</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                size="24"
                color="error"
                v-bind="attrs"
                v-on="on"
                @click="deleteCode(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Удалить</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} реферальный код</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.code"
              label="Код"
              :rules="[rules.required, rules.code]"
              required
              :disabled="saving"
            />
            <v-text-field
              v-if="!isEditing"
              v-model.number="editedItem.user"
              label="ID пользователя"
              type="number"
              :rules="[rules.required, rules.user]"
              required
              :disabled="saving"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog" :disabled="saving">Отмена</v-btn>
          <v-btn 
            color="success" 
            text 
            @click="saveCode" 
            :disabled="!valid || saving"
            :loading="saving"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Удаление реферального кода</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить этот реферальный код?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" text @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'ReferralView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const isEditing = ref(false)
    const referralCodes = ref([])
    const valid = ref(false)
    const form = ref(null)
    const itemToDelete = ref(null)
    const saving = ref(false)

    const headers = [
      { title: 'ID', key: 'id', width: '200px' },
      { title: 'Код', key: 'code', width: '20%' },
      { title: 'Применений кода', key: 'code_applying', width: '200px' },
      { title: 'ID владельца', key: 'user', width: '100px' },
      { title: 'Действия', key: 'actions', sortable: false, width: '400px' }
    ]

    const editedItem = ref({
      id: null,
      code: '',
      user: null
    })

    const defaultItem = {
      id: null,
      code: '',
      user: null
    }

    const rules = {
      required: v => !!v || 'Обязательное поле',
      code: v => (v && v.length >= 3) || 'Код должен быть не менее 3 символов',
      user: v => (v && v > 0) || 'ID пользователя должен быть положительным числом'
    }

    const fetchCodes = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/referral/')
        console.log('Referral codes response:', response.data)
        referralCodes.value = Array.isArray(response.data) ? response.data : 
                             response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading referral codes:', error)
        toast.error('Ошибка при загрузке реферальных кодов')
        referralCodes.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/referral/?search=${search.value}`)
          referralCodes.value = Array.isArray(response.data) ? response.data : 
                               response.data.results ? response.data.results : []
        } catch (error) {
          console.error('Error searching:', error)
          toast.error('Ошибка при поиске')
          referralCodes.value = []
        }
        loading.value = false
      } else {
        fetchCodes()
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editCode = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      form.value?.resetValidation()
    }

    const saveCode = async () => {
      if (!form.value?.validate()) return

      saving.value = true
      try {
        const payload = {
          code: editedItem.value.code.trim()
        }

        if (!isEditing.value) {
          payload.user = parseInt(editedItem.value.user)
        }

        console.log('Sending payload:', payload)

        if (isEditing.value) {
          await axios.patch(`/admin/referral/${editedItem.value.id}/`, payload)
          toast.success('Реферальный код успешно обновлен')
        } else {
          await axios.post('/admin/referral/', payload)
          toast.success('Реферальный код успешно создан')
        }
        closeDialog()
        fetchCodes()
      } catch (error) {
        console.error('Error saving code:', error)
        const errorMessage = error.response?.data?.detail || 'Ошибка при сохранении реферального кода'
        toast.error(errorMessage)
      } finally {
        saving.value = false
      }
    }

    const deleteCode = (item) => {
      itemToDelete.value = item
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      try {
        await axios.delete(`/admin/referral/${itemToDelete.value.id}/`)
        toast.success('Реферальный код успешно удален')
        deleteDialog.value = false
        itemToDelete.value = null
        fetchCodes()
      } catch (error) {
        console.error('Error deleting code:', error)
        toast.error('Ошибка при удалении реферального кода')
      }
    }

    onMounted(() => {
      fetchCodes()
    })

    return {
      search,
      loading,
      saving,
      dialog,
      deleteDialog,
      isEditing,
      referralCodes,
      headers,
      editedItem,
      valid,
      form,
      rules,
      handleSearch,
      openCreateDialog,
      editCode,
      closeDialog,
      saveCode,
      deleteCode,
      confirmDelete
    }
  }
}
</script>

<style>
.v-container {
  max-width: none !important;
  width: 100% !important;
  padding: 0 !important;
}

.full-width-card {
  width: 100%;
  margin: 0;
  border-radius: 0;
  max-width: none !important;
}

.referral-table {
  width: 100%;
  border: none;
  max-width: none !important;
}

.v-data-table {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
}

.v-data-table__wrapper {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
}

.referral-table .v-data-table__wrapper table {
  table-layout: auto;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  max-width: none !important;
}

.referral-table .v-data-table__wrapper table td,
.referral-table .v-data-table__wrapper table th {
  white-space: normal;
  word-wrap: break-word;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

/* Добавляем отступы для содержимого */
.v-card-title {
  padding: 16px 24px !important;
}

.v-data-table__wrapper {
  padding: 0 24px !important;
}

.search-field {
  min-width: 300px;
}

.gap-4 {
  gap: 16px;
}
</style> 