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
      >
        <template v-slot:item.image="{ item }">
          <v-img
            :src="item.image"
            max-width="100"
            max-height="100"
            contain
          />
        </template>

        <template v-slot:item.target_audience="{ item }">
          <v-chip :color="getTargetColor(item.target_audience)">
            {{ item.target_audience }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editAd(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteAd(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования рекламы -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} рекламу</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-file-input
              v-model="imageFile"
              label="Фото"
              accept="image/*"
              :required="!isEditing"
              @change="handleImageChange"
            />
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
            <v-select
              v-model="editedItem.target_audience"
              :items="targetOptions"
              label="Целевая аудитория"
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
          <v-btn color="success" text @click="saveAd">Сохранить</v-btn>
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
  name: 'AdsView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const ads = ref([])
    const valid = ref(false)
    const imageFile = ref(null)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Фото', key: 'image' },
      { title: 'Заголовок', key: 'title' },
      { title: 'Описание', key: 'description' },
      { title: 'Целевая аудитория', key: 'target_audience' },
      { title: 'Ссылка', key: 'url' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const targetOptions = ['Все', 'Мужчина', 'Женщина']

    const editedItem = ref({
      id: null,
      image: null,
      title: '',
      description: '',
      target_audience: 'Все',
      url: ''
    })

    const defaultItem = {
      id: null,
      image: null,
      title: '',
      description: '',
      target_audience: 'Все',
      url: ''
    }

    const getTargetColor = (target) => {
      switch (target) {
        case 'Все':
          return 'primary'
        case 'Мужчина':
          return 'blue'
        case 'Женщина':
          return 'pink'
        default:
          return 'grey'
      }
    }

    const fetchAds = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/ads/')
        ads.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке рекламы')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/ads/?search=${search.value}`)
          ads.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchAds()
      }
    }

    const handleImageChange = (file) => {
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          editedItem.value.image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      imageFile.value = null
      dialog.value = true
    }

    const editAd = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      imageFile.value = null
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      imageFile.value = null
    }

    const saveAd = async () => {
      try {
        const formData = new FormData()
        formData.append('title', editedItem.value.title)
        formData.append('description', editedItem.value.description)
        formData.append('target_audience', editedItem.value.target_audience)
        formData.append('url', editedItem.value.url)
        
        if (imageFile.value) {
          formData.append('image', imageFile.value)
        }

        if (isEditing.value) {
          await axios.patch(`/api/admin/ads/${editedItem.value.id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          toast.success('Реклама успешно обновлена')
        } else {
          await axios.post('/api/admin/ads/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          toast.success('Реклама успешно создана')
        }
        closeDialog()
        fetchAds()
      } catch (error) {
        toast.error('Ошибка при сохранении рекламы')
      }
    }

    const deleteAd = async (item) => {
      if (confirm('Вы уверены, что хотите удалить эту рекламу?')) {
        try {
          await axios.delete(`/api/admin/ads/${item.id}/`)
          toast.success('Реклама успешно удалена')
          fetchAds()
        } catch (error) {
          toast.error('Ошибка при удалении рекламы')
        }
      }
    }

    onMounted(() => {
      fetchAds()
    })

    return {
      search,
      loading,
      dialog,
      isEditing,
      ads,
      headers,
      targetOptions,
      editedItem,
      imageFile,
      valid,
      getTargetColor,
      handleSearch,
      handleImageChange,
      openCreateDialog,
      editAd,
      closeDialog,
      saveAd,
      deleteAd
    }
  }
}
</script> 