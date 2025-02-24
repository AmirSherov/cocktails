<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>FAQ</h2>
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
            Создать FAQ
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="faqs"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editFAQ(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteFAQ(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования FAQ -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} FAQ</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.question"
              label="Вопрос"
              required
            />
            <v-textarea
              v-model="editedItem.answer"
              label="Ответ"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveFAQ">Сохранить</v-btn>
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
  name: 'FAQView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const faqs = ref([])
    const valid = ref(false)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Вопрос', key: 'question' },
      { title: 'Ответ', key: 'answer' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      question: '',
      answer: ''
    })

    const defaultItem = {
      id: null,
      question: '',
      answer: ''
    }

    const fetchFAQs = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/FAQ/')
        faqs.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке FAQ')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/FAQ/?search=${search.value}`)
          faqs.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchFAQs()
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editFAQ = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
    }

    const saveFAQ = async () => {
      try {
        if (isEditing.value) {
          await axios.patch(`/api/admin/FAQ/${editedItem.value.id}/`, editedItem.value)
          toast.success('FAQ успешно обновлен')
        } else {
          await axios.post('/api/admin/FAQ/', editedItem.value)
          toast.success('FAQ успешно создан')
        }
        closeDialog()
        fetchFAQs()
      } catch (error) {
        toast.error('Ошибка при сохранении FAQ')
      }
    }

    const deleteFAQ = async (item) => {
      if (confirm('Вы уверены, что хотите удалить этот FAQ?')) {
        try {
          await axios.delete(`/api/admin/FAQ/${item.id}/`)
          toast.success('FAQ успешно удален')
          fetchFAQs()
        } catch (error) {
          toast.error('Ошибка при удалении FAQ')
        }
      }
    }

    onMounted(() => {
      fetchFAQs()
    })

    return {
      search,
      loading,
      dialog,
      isEditing,
      faqs,
      headers,
      editedItem,
      valid,
      handleSearch,
      openCreateDialog,
      editFAQ,
      closeDialog,
      saveFAQ,
      deleteFAQ
    }
  }
}
</script> 