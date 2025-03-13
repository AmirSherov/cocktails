<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <h4>Рассылки</h4>
        <div class="d-flex align-center gap-4" style="min-width: 60%;">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск по заголовку и описанию"
            hide-details
            class="search-field flex-grow-1"
            @input="handleSearch"
            density="comfortable"
          />
          <v-btn color="primary" min-width="140" @click="openCreateDialog">
            Создать рассылку
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="truncatedMailings"
        :search="search"
        :loading="loading"
        class="mailing-table elevation-1"
      >
        <template #[`item.description`]="{ item }">
          <div class="text-truncate" style="max-width: 200px;" :title="item.description">
            {{ item.description }}
          </div>
        </template>

        <template #[`item.description_eng`]="{ item }">
          <div class="text-truncate" style="max-width: 200px;" :title="item.description_eng">
            {{ item.description_eng }}
          </div>
        </template>

        <template #[`item.url`]="{ item }">
          <a :href="item.url" target="_blank" class="text-decoration-none">
            {{ item.url }}
          </a>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn 
                icon 
                small 
                color="primary"
                v-bind="attrs"
                size="30"
                v-on="on"
                @click="editMailing(item)"
                class="mr-2"
                :loading="loading"
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
                small 
                color="error"
                v-bind="attrs"
                size="30"
                v-on="on"
                @click="deleteMailing(item)"
                :loading="loading"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Удалить</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>
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
              :rules="[v => !!v || 'Заголовок обязателен']"
              required
              :disabled="saving"
            />
            <v-textarea
              v-model="editedItem.description"
              label="Описание"
              :rules="[v => !!v || 'Описание обязательно']"
              required
              :disabled="saving"
            />
            <v-text-field
              v-model="editedItem.title_eng"
              label="Заголовок на английском"
              :rules="[v => !!v || 'Заголовок на английском обязателен']"
              required
              :disabled="saving"
            />
            <v-textarea
              v-model="editedItem.description_eng"
              label="Описание на английском"
              :rules="[v => !!v || 'Описание на английском обязательно']"
              required
              :disabled="saving"
            />
            <v-text-field
              v-model="editedItem.url"
              label="Ссылка"
              :rules="[
                v => !!v || 'Ссылка обязательна',
                v => /^https?:\/\/.+/.test(v) || 'Ссылка должна начинаться с http:// или https://'
              ]"
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
            @click="saveMailing" 
            :disabled="!valid || saving"
            :loading="saving"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>
          Вы действительно хотите удалить рассылку "{{ editedItem.title }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="deleteDialog = false" :disabled="deleting">Отмена</v-btn>
          <v-btn 
            color="error" 
            text 
            @click="confirmDelete"
            :loading="deleting"
            :disabled="deleting"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'MailingView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const isEditing = ref(false)
    const mailings = ref([])
    const valid = ref(false)
    const form = ref(null)

    const headers = [
      { title: 'ID', key: 'id', width: '80px' },
      { title: 'Заголовок', key: 'title', width: '15%' },
      { title: 'Описание', key: 'description', width: '20%' },
      { title: 'Заголовок (EN)', key: 'title_eng', width: '15%' },
      { title: 'Описание (EN)', key: 'description_eng', width: '20%' },
      { title: 'Ссылка', key: 'url', width: '20%' },
      { title: 'Действия', key: 'actions', sortable: false, width: '120px' }
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
        const response = await axios.get('/admin/mailing/')
        mailings.value = Array.isArray(response.data) ? response.data : 
                        response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading mailings:', error)
        toast.error('Ошибка при загрузке рассылок')
        mailings.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/mailing/?search=${search.value}`)
          mailings.value = Array.isArray(response.data) ? response.data : 
                          response.data.results ? response.data.results : []
        } catch (error) {
          console.error('Error searching:', error)
          toast.error('Ошибка при поиске')
          mailings.value = []
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
      form.value?.resetValidation()
    }

    const editMailing = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
      form.value?.resetValidation()
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      form.value?.resetValidation()
    }

    const saveMailing = async () => {
      if (!form.value?.validate()) return

      saving.value = true
      try {
        if (isEditing.value) {
          await axios.patch(`/admin/mailing/${editedItem.value.id}/`, editedItem.value)
          toast.success('Рассылка успешно обновлена')
        } else {
          await axios.post('/admin/mailing/', editedItem.value)
          toast.success('Рассылка успешно создана')
        }
        closeDialog()
        fetchMailings()
      } catch (error) {
        console.error('Error saving mailing:', error.response?.data || error)
        const errorMessage = error.response?.data?.detail || 'Ошибка при сохранении рассылки'
        toast.error(errorMessage)
      } finally {
        saving.value = false
      }
    }

    const deleteMailing = (item) => {
      editedItem.value = { ...item }
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      deleting.value = true
      try {
        await axios.delete(`/admin/mailing/${editedItem.value.id}/`)
        toast.success('Рассылка успешно удалена')
        deleteDialog.value = false
        fetchMailings()
      } catch (error) {
        console.error('Error deleting mailing:', error)
        toast.error('Ошибка при удалении рассылки')
      } finally {
        deleting.value = false
      }
    }

    const truncatedMailings = computed(() => {
      return mailings.value.map(mailing => {
        return {
          ...mailing,
          url: mailing.url.length > 10 ? mailing.url.slice(0, 10) + '...' : mailing.url
        }
      })
    })

    onMounted(() => {
      fetchMailings()
    })

    return {
      search,
      loading,
      saving,
      deleting,
      dialog,
      deleteDialog,
      isEditing,
      mailings,
      headers,
      editedItem,
      valid,
      form,
      handleSearch,
      openCreateDialog,
      editMailing,
      closeDialog,
      saveMailing,
      deleteMailing,
      confirmDelete,
      truncatedMailings
    }
  }
}
</script>

<style>
.mailing-table {
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

.mailing-table .v-data-table__wrapper table {
  table-layout: auto;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.mailing-table .v-data-table__wrapper table td,
.mailing-table .v-data-table__wrapper table th {
  white-space: normal;
  word-wrap: break-word;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-field {
  min-width: 300px;
}

.gap-4 {
  gap: 16px;
}
</style> 