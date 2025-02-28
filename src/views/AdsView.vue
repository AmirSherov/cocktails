<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Реклама</h2>
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
            Создать рекламу
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="ads"
        :search="search"
        :loading="loading"
        class="ads-table elevation-1"
      >
        <template v-slot:[`item.images`]="{ item }">
          <v-img
            :src="item.images"
            max-width="100"
            max-height="100"
            contain
            class="clickable-image"
            @click="openImageDialog(item.images)"
          />
        </template>

        <template v-slot:[`item.target_audience`]="{ item }">
          <v-chip :color="getTargetColor(item.target_audience)">
            {{ item.target_audience === 'ALL' ? 'Все' :
               item.target_audience === 'MEN' ? 'Мужчина' :
               item.target_audience === 'WOMEN' ? 'Женщина' :
               item.target_audience }}
          </v-chip>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn 
                icon 
                small 
                color="primary"
                v-bind="attrs"
                v-on="on"
                @click="editAd(item)"
                class="mr-2"
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
                v-on="on"
                @click="deleteAd(item)"
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
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} рекламу</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <div class="mb-4">
              <label class="v-label theme--light">
                Фото
                <span v-if="!isEditing" class="v-label--required">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleImageChange"
                :disabled="saving"
                ref="fileInput"
              />
            </div>
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
            <v-select
              v-model="editedItem.target_audience"
              :items="[
                { title: 'Все', value: 'ALL' },
                { title: 'Мужчина', value: 'MEN' },
                { title: 'Женщина', value: 'WOMEN' }
              ]"
              item-title="title"
              item-value="value"
              label="Целевая аудитория"
              :rules="[v => !!v || 'Целевая аудитория обязательна']"
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
            @click="saveAd" 
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
          Вы действительно хотите удалить эту рекламу?
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

    <v-dialog v-model="imageDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-end">
          <v-btn icon @click="imageDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="text-center">
          <v-img
            :src="selectedImage"
            max-height="600"
            contain
          />
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
  name: 'AdsView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const deleting = ref(false)
    const imageLoading = ref(false)
    const dialog = ref(false)
    const deleteDialog = ref(false)
    const imageDialog = ref(false)
    const isEditing = ref(false)
    const ads = ref([])
    const valid = ref(false)
    const imageFile = ref(null)
    const selectedImage = ref(null)
    const form = ref(null)
    const fileInput = ref(null)

    const headers = [
      { title: 'ID', key: 'id', width: '80px' },
      { title: 'Фото', key: 'images', width: '120px' },
      { title: 'Заголовок', key: 'title', width: '20%' },
      { title: 'Описание', key: 'description', width: '30%' },
      { title: 'Целевая аудитория', key: 'target_audience', width: '15%' },
      { title: 'Ссылка', key: 'url', width: '20%' },
      { title: 'Действия', key: 'actions', sortable: false, width: '120px' }
    ]

    const targetDisplayMap = {
      'ALL': 'Все',
      'MEN': 'Мужчина',
      'WOMEN': 'Женщина'
    }

    const targetOptions = ['ALL', 'MEN', 'WOMEN']

    const editedItem = ref({
      id: null,
      images: null,
      title: '',
      description: '',
      target_audience: 'ALL',
      url: ''
    })

    const defaultItem = {
      id: null,
      images: null,
      title: '',
      description: '',
      target_audience: 'ALL',
      url: ''
    }

    const getTargetColor = (target) => {
      switch (target) {
        case 'ALL':
          return 'primary'
        case 'MEN':
          return 'blue'
        case 'WOMEN':
          return 'pink'
        default:
          return 'grey'
      }
    }

    const fetchAds = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/ads/')
        ads.value = Array.isArray(response.data) ? response.data : 
                    response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading ads:', error)
        toast.error('Ошибка при загрузке рекламы')
        ads.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/ads/?search=${search.value}`)
          ads.value = Array.isArray(response.data) ? response.data : 
                      response.data.results ? response.data.results : []
        } catch (error) {
          console.error('Error searching:', error)
          toast.error('Ошибка при поиске')
          ads.value = []
        }
        loading.value = false
      } else {
        fetchAds()
      }
    }

    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        imageFile.value = file
      } else {
        imageFile.value = null
      }
    }

    const openImageDialog = (image) => {
      selectedImage.value = image
      imageDialog.value = true
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      imageFile.value = null
      dialog.value = true
      form.value?.resetValidation()
    }

    const editAd = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      imageFile.value = null
      dialog.value = true
      form.value?.resetValidation()
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      imageFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      form.value?.resetValidation()
    }

    const saveAd = async () => {
      if (!form.value?.validate()) return
      
      if (!isEditing.value && !imageFile.value) {
        toast.error('Пожалуйста, выберите изображение')
        return
      }

      saving.value = true
      try {
        const formData = new FormData()
        formData.append('title', editedItem.value.title)
        formData.append('description', editedItem.value.description)
        formData.append('target_audience', editedItem.value.target_audience)
        formData.append('url', editedItem.value.url)
        
        if (imageFile.value) {
          formData.append('images', imageFile.value)
        }

        if (isEditing.value) {
          await axios.patch(`/admin/ads/${editedItem.value.id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          toast.success('Реклама успешно обновлена')
        } else {
          const response = await axios.post('/admin/ads/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          console.log('Create response:', response.data)
          toast.success('Реклама успешно создана')
        }
        closeDialog()
        fetchAds()
      } catch (error) {
        console.error('Error saving ad:', error.response?.data || error)
        const errorMessage = error.response?.data?.detail || 'Ошибка при сохранении рекламы'
        toast.error(errorMessage)
      } finally {
        saving.value = false
      }
    }

    const deleteAd = (item) => {
      editedItem.value = { ...item }
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      deleting.value = true
      try {
        await axios.delete(`/admin/ads/${editedItem.value.id}/`)
        toast.success('Реклама успешно удалена')
        deleteDialog.value = false
        fetchAds()
      } catch (error) {
        console.error('Error deleting ad:', error)
        toast.error('Ошибка при удалении рекламы')
      } finally {
        deleting.value = false
      }
    }

    onMounted(() => {
      fetchAds()
    })

    return {
      search,
      loading,
      saving,
      deleting,
      imageLoading,
      dialog,
      deleteDialog,
      imageDialog,
      isEditing,
      ads,
      headers,
      targetOptions,
      editedItem,
      imageFile,
      selectedImage,
      valid,
      form,
      fileInput,
      getTargetColor,
      targetDisplayMap,
      handleSearch,
      handleImageChange,
      openImageDialog,
      openCreateDialog,
      editAd,
      closeDialog,
      saveAd,
      deleteAd,
      confirmDelete
    }
  }
}
</script>

<style>
.ads-table {
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

.ads-table .v-data-table__wrapper table {
  table-layout: auto;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.ads-table .v-data-table__wrapper table td,
.ads-table .v-data-table__wrapper table th {
  white-space: normal;
  word-wrap: break-word;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.clickable-image {
  cursor: pointer;
  transition: transform 0.2s;
}

.clickable-image:hover {
  transform: scale(1.1);
}

.file-input {
  width: 100%;
  padding: 8px;
  margin-top: 4px;
}
</style> 