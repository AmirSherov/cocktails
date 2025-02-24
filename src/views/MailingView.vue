<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Рассылки</h2>
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск по заголовку и описанию"
            single-line
            hide-details
            class="mx-4"
            @input="handleSearch"
          />
          <v-btn color="primary" @click="openCreateDialog">
            Создать рассылку
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="mailings"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editMailing(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteMailing(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования рассылки -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} рассылку</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.title"
              label="Заголовок"
              required
            />
            <v-textarea
              v-model="editedItem.description"
              label="Описание"
              required
            />
            <v-text-field
              v-model="editedItem.title_eng"
              label="Заголовок на английском"
              required
            />
            <v-textarea
              v-model="editedItem.description_eng"
              label="Описание на английском"
              required
            />
            <v-text-field
              v-model="editedItem.url"
              label="Ссылка"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveMailing">Сохранить</v-btn>
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
  name: 'MailingView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const mailings = ref([])
    const valid = ref(false)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Заголовок', key: 'title' },
      { title: 'Описание', key: 'description' },
      { title: 'Заголовок (EN)', key: 'title_eng' },
      { title: 'Описание (EN)', key: 'description_eng' },
      { title: 'Ссылка', key: 'url' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      title: '',
      description: '',
      title_eng: '',
      description_eng: '',
      url: ''
    })

    const defaultItem = {
      id: null,
      title: '',
      description: '',
      title_eng: '',
      description_eng: '',
      url: ''
    }

    const fetchMailings = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/mailing/')
        mailings.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке рассылок')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/mailing/?search=${search.value}`)
          mailings.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchMailings()
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editMailing = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
    }

    const saveMailing = async () => {
      try {
        if (isEditing.value) {
          await axios.patch(`/api/admin/mailing/${editedItem.value.id}/`, editedItem.value)
          toast.success('Рассылка успешно обновлена')
        } else {
          await axios.post('/api/admin/mailing/', editedItem.value)
          toast.success('Рассылка успешно создана')
        }
        closeDialog()
        fetchMailings()
      } catch (error) {
        toast.error('Ошибка при сохранении рассылки')
      }
    }

    const deleteMailing = async (item) => {
      if (confirm('Вы уверены, что хотите удалить эту рассылку?')) {
        try {
          await axios.delete(`/api/admin/mailing/${item.id}/`)
          toast.success('Рассылка успешно удалена')
          fetchMailings()
        } catch (error) {
          toast.error('Ошибка при удалении рассылки')
        }
      }
    }

    onMounted(() => {
      fetchMailings()
    })

    return {
      search,
      loading,
      dialog,
      isEditing,
      mailings,
      headers,
      editedItem,
      valid,
      handleSearch,
      openCreateDialog,
      editMailing,
      closeDialog,
      saveMailing,
      deleteMailing
    }
  }
}
</script> 