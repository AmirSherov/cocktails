<template>
  <div class="faq-wrapper">
    <v-card flat class="full-width-card">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <h4>FAQ</h4>
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
          <v-btn color="primary" min-width="140" @click="openCreateDialog">
            Создать FAQ
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="faqs"
        :search="search"
        :loading="loading"
        class="faq-table elevation-1"
        :items-per-page="10"
      >
        <template #item.actions="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                color="primary"
                class="mr-2"
                size="30"
                v-bind="attrs"
                v-on="on"
                @click="editFaq(item)"
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
                color="error"
                v-bind="attrs"
                size="30"
                v-on="on"
                @click="deleteFaq(item)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Удалить</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} FAQ</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-textarea
              v-model="editedItem.question"
              label="Вопрос"
              :rules="[v => !!v || 'Обязательное поле']"
              required
              rows="3"
            />
            <v-textarea
              v-model="editedItem.answer"
              label="Ответ"
              :rules="[v => !!v || 'Обязательное поле']"
              required
              rows="5"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveFaq" :disabled="!valid">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Удаление FAQ</v-card-title>
        <v-card-text>
          Вы уверены, что хотите удалить этот FAQ?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn color="error" text @click="confirmDelete">Удалить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'FAQView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const valid = ref(false)
    const form = ref(null)
    const faqs = ref([])
    const isEditing = ref(false)
    const itemToDelete = ref(null)

    const headers = [
      { title: 'ID', key: 'id', width: '100px' },
      { title: 'Вопрос', key: 'question' },
      { title: 'Ответ', key: 'answer' },
      { title: 'Действия', key: 'actions', sortable: false, width: '120px' }
    ]

    const defaultItem = {
      question: '',
      answer: ''
    }

    const editedItem = ref({ ...defaultItem })

    const fetchFaqs = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/FAQ/')
        console.log('FAQ response:', response.data)
        faqs.value = Array.isArray(response.data) ? response.data : 
                     response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading FAQs:', error)
        toast.error('Ошибка при загрузке FAQ')
        faqs.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/FAQ/?search=${search.value}`)
          faqs.value = Array.isArray(response.data) ? response.data : 
                       response.data.results ? response.data.results : []
        } catch (error) {
          console.error('Error searching FAQs:', error)
          toast.error('Ошибка при поиске')
          faqs.value = []
        }
        loading.value = false
      } else {
        fetchFaqs()
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editFaq = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      form.value?.resetValidation()
    }

    const saveFaq = async () => {
      if (!form.value.validate()) return

      try {
        if (isEditing.value) {
          await axios.patch(`/admin/FAQ/${editedItem.value.id}/`, editedItem.value)
          toast.success('FAQ успешно обновлен')
        } else {
          await axios.post('/admin/FAQ/', editedItem.value)
          toast.success('FAQ успешно создан')
        }
        closeDialog()
        fetchFaqs()
      } catch (error) {
        console.error('Error saving FAQ:', error)
        toast.error('Ошибка при сохранении FAQ')
      }
    }

    const deleteFaq = (item) => {
      itemToDelete.value = item
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      try {
        await axios.delete(`/admin/FAQ/${itemToDelete.value.id}/`)
        toast.success('FAQ успешно удален')
        deleteDialog.value = false
        itemToDelete.value = null
        fetchFaqs()
      } catch (error) {
        console.error('Error deleting FAQ:', error)
        toast.error('Ошибка при удалении FAQ')
      }
    }

    onMounted(() => {
      fetchFaqs()
    })

    return {
      search,
      loading,
      dialog,
      deleteDialog,
      valid,
      form,
      faqs,
      headers,
      editedItem,
      isEditing,
      handleSearch,
      openCreateDialog,
      editFaq,
      closeDialog,
      saveFaq,
      deleteFaq,
      confirmDelete
    }
  }
}
</script>

<style>
.faq-wrapper {
  width: 100vh;
  height: 100%;
  padding: 0;
  margin: 0;
  position: relative;
}

.full-width-card {
  width: 100%;
  margin: 0;
  border-radius: 0;
}

.faq-table {
  width: 100%;
  border: none;
}

.v-data-table {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.v-data-table__wrapper {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Улучшаем отображение колонок */
.faq-table .v-data-table__wrapper table {
  table-layout: fixed;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.faq-table .v-data-table__wrapper table td,
.faq-table .v-data-table__wrapper table th {
  white-space: normal;
  word-wrap: break-word;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

/* Задаем ширину колонок */
.faq-table .v-data-table__wrapper table th:nth-child(1),
.faq-table .v-data-table__wrapper table td:nth-child(1) {
  width: 80px;  /* ID колонка */
}

.faq-table .v-data-table__wrapper table th:nth-child(2),
.faq-table .v-data-table__wrapper table td:nth-child(2) {
  width: 35%;  /* Вопрос */
}

.faq-table .v-data-table__wrapper table th:nth-child(3),
.faq-table .v-data-table__wrapper table td:nth-child(3) {
  width: calc(65% - 200px);  /* Ответ */
}

.faq-table .v-data-table__wrapper table th:nth-child(4),
.faq-table .v-data-table__wrapper table td:nth-child(4) {
  width: 120px;  /* Действия */
}

.search-field {
  min-width: 300px;
}

.gap-4 {
  gap: 16px;
}
</style> 