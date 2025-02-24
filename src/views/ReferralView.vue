<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Реферальная система</h2>
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
            class="mx-4"
            @input="handleSearch"
          />
          <v-btn color="primary" @click="openCreateDialog">
            Создать код
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="referralCodes"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editCode(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteCode(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования кода -->
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
              required
            />
            <v-text-field
              v-model="editedItem.user"
              label="ID пользователя"
              type="number"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveCode">Сохранить</v-btn>
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
  name: 'ReferralView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const referralCodes = ref([])
    const valid = ref(false)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Код', key: 'code' },
      { title: 'Применений кода', key: 'code_applying' },
      { title: 'ID владельца', key: 'user' },
      { title: 'Действия', key: 'actions', sortable: false }
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

    const fetchCodes = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/referral/')
        referralCodes.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке реферальных кодов')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/referral/?search=${search.value}`)
          referralCodes.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
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
    }

    const saveCode = async () => {
      try {
        if (isEditing.value) {
          await axios.patch(`/api/admin/referral/${editedItem.value.id}/`, {
            code: editedItem.value.code
          })
          toast.success('Реферальный код успешно обновлен')
        } else {
          await axios.post('/api/admin/referral/', editedItem.value)
          toast.success('Реферальный код успешно создан')
        }
        closeDialog()
        fetchCodes()
      } catch (error) {
        toast.error('Ошибка при сохранении реферального кода')
      }
    }

    const deleteCode = async (item) => {
      if (confirm('Вы уверены, что хотите удалить этот реферальный код?')) {
        try {
          await axios.delete(`/api/admin/referral/${item.id}/`)
          toast.success('Реферальный код успешно удален')
          fetchCodes()
        } catch (error) {
          toast.error('Ошибка при удалении реферального кода')
        }
      }
    }

    onMounted(() => {
      fetchCodes()
    })

    return {
      search,
      loading,
      dialog,
      isEditing,
      referralCodes,
      headers,
      editedItem,
      valid,
      handleSearch,
      openCreateDialog,
      editCode,
      closeDialog,
      saveCode,
      deleteCode
    }
  }
}
</script> 