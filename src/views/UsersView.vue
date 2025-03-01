<template>
  <div class="users-container">
    <v-card class="users-card">
      <v-card-title class="users-header">
        <h2 class="users-title">Пользователи</h2>
        <div class="search-block">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск"
            single-line
            hide-details
            class="search-field"
            @input="handleSearch"
            density="compact"
          />
          <v-btn 
            color="primary" 
            @click="openCreateDialog"
            prepend-icon="mdi-plus"
            size="small"
          >
            Создать
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
        density="compact"
        class="users-table"
      >
        <template #[`item.avatar`]="{ item }">
          <v-avatar size="32" style="cursor: pointer" @click="showAvatarPreview(item)">
            <v-img :src="item.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'" alt="avatar" />
          </v-avatar>
        </template>

        <template #[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'error'"
            size="x-small"
            class="text-caption"
          >
            {{ item.is_active ? 'Активный' : 'Неактивный' }}
          </v-chip>
        </template>

        <template #[`item.is_staff`]="{ item }">
          <v-chip
            v-if="item.is_staff"
            color="primary"
            size="x-small"
            class="text-caption"
          >
            Менеджер
          </v-chip>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex">
            <v-btn
              icon="mdi-pencil"
              color="primary"
              size="x-small"
              variant="text"
              class="mr-1"
              @click="editUser(item)"
            />
            <v-btn
              icon="mdi-delete"
              color="error"
              size="x-small"
              variant="text"
              @click="deleteUser(item)"
            />
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="700px">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} пользователя</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.first_name"
                  label="Имя"
                  required
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.last_name"
                  label="Фамилия"
                  required
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  required
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.password"
                  label="Пароль"
                  type="password"
                  :required="!isEditing"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.date_of_birthday"
                  label="Дата рождения"
                  type="date"
                  density="comfortable"
                  :max="new Date().toISOString().split('T')[0]"
                  clearable
                  @click:clear="editedItem.date_of_birthday = null"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.gender"
                  :items="[
                    { title: 'Мужской', value: 'Male' },
                    { title: 'Женский', value: 'Female' },
                    { title: 'Другой', value: 'other' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Пол"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.os"
                  :items="['IOS', 'Android']"
                  label="Операционная система"
                  clearable
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <div class="file-input-wrapper">
                  <label for="avatar">Аватар</label>
                  <input
                    type="file"
                    id="avatar"
                    @change="handleAvatarChange"
                    class="file-input"
                  />
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.is_active"
                  label="Активный"
                  color="success"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.is_staff"
                  label="Менеджер"
                  color="primary"
                  hide-details
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="editedItem.user_permissions"
                  :items="permissions"
                  item-title="name"
                  item-value="id"
                  label="Права доступа"
                  multiple
                  chips
                  density="comfortable"
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            @click="closeDialog"
          >
            Отмена
          </v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            class="ml-2"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог для предпросмотра аватара -->
    <v-dialog v-model="avatarPreviewDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center pa-4">
          <span>Аватар пользователя</span>
          <v-btn icon="mdi-close" size="small" @click="avatarPreviewDialog = false" />
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            :src="selectedAvatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'"
            max-height="500"
            contain
            class="mx-auto"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import axios from '../plugins/axios'
import { useToast } from 'vue-toastification'
import { useRoute } from 'vue-router'

export default {
  name: 'UsersView',
  setup() {
    const route = useRoute()
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const users = ref([])
    const valid = ref(false)
    const permissions = ref([])
    const avatarFile = ref(null)
    const avatarPreviewDialog = ref(false)
    const selectedAvatar = ref(null)
    const dateMenu = ref(false)
    const formattedBirthday = computed(() => {
      if (!editedItem.value.date_of_birthday) return ''
      const date = new Date(editedItem.value.date_of_birthday)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('ru-RU')
    })

    const headers = [
      { title: 'ID', key: 'id', width: '50px' },
      { title: 'Аватар', key: 'avatar', width: '60px', sortable: false },
      { title: 'Имя', key: 'first_name', width: '120px' },
      { title: 'Фамилия', key: 'last_name', width: '120px' },
      { title: 'Email', key: 'email' },
      { title: 'Дата рождения', key: 'date_of_birthday', width: '120px' },
      { title: 'Пол', key: 'gender', width: '100px' },
      { title: 'ОС', key: 'os', width: '100px' },
      { title: 'Статус', key: 'is_active', width: '100px' },
      { title: 'Роль', key: 'is_staff', width: '100px' },
      { title: 'Действия', key: 'actions', width: '100px', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birthday: '',
      gender: 'male',
      os: null,
      is_active: true,
      is_staff: false,
      user_permissions: [],
      avatarFile: null
    })

    const defaultItem = {
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birthday: '',
      gender: 'male',
      os: null,
      is_active: true,
      is_staff: false,
      user_permissions: [],
      avatarFile: null
    }

    const fetchUsers = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/profile/')
        users.value = Array.isArray(response.data) ? response.data : 
                     response.data.results ? response.data.results : []
        console.log(users.value)
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Ошибка при загрузке пользователей')
        users.value = []
      }
      loading.value = false
    }

    const fetchPermissions = async () => {
      try {
        const response = await axios.get('/admin/permissions/')
        permissions.value = Array.isArray(response.data) ? response.data.map(p => ({ ...p, id: Number(p.id) })) :
                          response.data.results ? response.data.results.map(p => ({ ...p, id: Number(p.id) })) : []
      } catch (error) {
        console.error('Error fetching permissions:', error)
        toast.error('Ошибка при загрузке прав доступа')
        permissions.value = []
      }
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/profile/?search=${search.value}`)
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

    const handleAvatarChange = (event) => {
      avatarFile.value = event.target.files[0]
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editUser = (item) => {
      isEditing.value = true
      console.log('Initial user data:', item)
      
      const itemCopy = { ...item }
      if (item.user_permissions) {
        itemCopy.user_permissions = Array.isArray(item.user_permissions) 
          ? item.user_permissions.map(p => typeof p === 'object' ? p.id : Number(p))
          : []
      }
      if (itemCopy.date_of_birth) {
        itemCopy.date_of_birthday = itemCopy.date_of_birth
      }
      editedItem.value = itemCopy
      dialog.value = true
      
      axios.get(`/admin/profile/${item.id}/`)
        .then(response => {
          console.log('Detailed user data:', response.data)
          if (response.data.user_permissions) {
            editedItem.value.user_permissions = response.data.user_permissions
          }
          if (response.data.date_of_birth) {
            editedItem.value.date_of_birthday = response.data.date_of_birth
          }
        })
        .catch(error => {
          console.error('Error fetching user permissions:', error)
        })
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      avatarFile.value = null
    }

    const saveUser = async () => {
      try {
        const formData = new FormData()
        
        Object.keys(editedItem.value).forEach(key => {
          if (editedItem.value[key] !== null && key !== 'avatar' && key !== 'avatarFile' && key !== 'user_permissions') {
            if (key === 'date_of_birthday') {
              formData.append('date_of_birth', editedItem.value[key])
            } else {
              formData.append(key, editedItem.value[key])
            }
          }
        })

        if (editedItem.value.user_permissions?.length) {
          editedItem.value.user_permissions.forEach(permission => {
            formData.append('user_permissions', Number(permission))
          })
        }

        if (avatarFile.value) {
          formData.append('avatar', avatarFile.value)
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }

        console.log('Sending data:', Object.fromEntries(formData.entries()))

        if (!isEditing.value) {
          await axios.post('/admin/profile/', formData, config)
          toast.success('Пользователь успешно создан')
        } else {
          await axios.put(`/admin/profile/${editedItem.value.id}/`, formData, config)
          toast.success('Пользователь успешно обновлен')
        }
        
        closeDialog()
        fetchUsers()
      } catch (error) {
        console.error('Error saving user:', error)
        if (error.response?.data) {
          console.error('Server response:', error.response.data)
          toast.error(`Ошибка: ${JSON.stringify(error.response.data)}`)
        } else {
          toast.error('Ошибка при сохранении пользователя')
        }
      }
    }

    const deleteUser = async (item) => {
      if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        try {
          await axios.delete(`/admin/profile/${item.id}/`)
          toast.success('Пользователь успешно удален')
          fetchUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
          toast.error('Ошибка при удалении пользователя')
        }
      }
    }

    const showAvatarPreview = (item) => {
      selectedAvatar.value = item.avatar
      avatarPreviewDialog.value = true
    }

    onMounted(() => {
      if (route.query.search) {
        search.value = route.query.search
        handleSearch()
      } else {
        fetchUsers()
      }
      fetchPermissions()
    })

    return {
      search,
      loading,
      dialog,
      isEditing,
      users,
      headers,
      editedItem,
      valid,
      permissions,
      avatarFile,
      avatarPreviewDialog,
      selectedAvatar,
      handleSearch,
      openCreateDialog,
      editUser,
      closeDialog,
      saveUser,
      deleteUser,
      handleAvatarChange,
      showAvatarPreview,
      dateMenu,
      formattedBirthday
    }
  }
}
</script>

<style>
.users-container {
  padding: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  margin-left: -50px;
}

.users-card {
  margin: 0;
  border-radius: 0;
  box-shadow: none;
}

.users-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.users-title {
  font-size: 20px;
  margin: 0;
}

.search-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-field {
  width: 300px;
}

.v-data-table {
  font-size: 14px;
}

.v-data-table .v-data-table-header th {
  white-space: nowrap;
  font-weight: 600 !important;
  background-color: #f5f5f5;
}

.v-data-table .v-data-table__wrapper {
  overflow-x: auto;
  margin: 0;
  padding: 0;
}

.v-data-table .v-data-table__wrapper table {
  min-width: 100%;
  border-collapse: collapse;
}

.v-data-table .v-data-table__wrapper td {
  height: 40px !important;
  padding: 0 8px !important;
  vertical-align: middle;
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input-wrapper label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
}

.file-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}
</style> 