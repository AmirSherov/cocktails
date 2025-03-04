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

      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
        row-key="id"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        @sort-change="handleSortChange"
      >
        <el-table-column
          prop="id"
          label="ID"
          sortable
          width="80"
        />
        <el-table-column
          prop="avatar"
          label="Аватар"
          width="80"
        >
          <template #default="{ row }">
            <v-avatar size="32" style="cursor: pointer" @click="showAvatarPreview(row)">
              <v-img :src="row.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'" alt="avatar" />
            </v-avatar>
          </template>
        </el-table-column>
        <el-table-column
          prop="first_name"
          label="Имя"
          sortable
        />
        <el-table-column
          prop="last_name"
          label="Фамилия"
          sortable
        />
        <el-table-column
          width="150"
          prop="email"
          label="Email"
          sortable
        />
        <el-table-column
          prop="date_of_birth"
          label="Дата рождения"
          sortable
        >
          <template #default="{ row }">
            {{ formatDate(row.date_of_birth) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="gender"
          label="Пол"
          sortable
        />
        <el-table-column
          prop="os"
          label="ОС"
          sortable
        />
        <el-table-column
          prop="is_active"
          label="Статус"
          width="100"
          sortable
        >
          <template #default="{ row }">
            <v-chip
              :color="row.is_active ? 'success' : 'error'"
              size="x-small"
              class="text-caption"
            >
              {{ row.is_active ? 'Активный' : 'Неактивный' }}
            </v-chip>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_staff"
          label="Роль"
          width="120"
          sortable
        >
          <template #default="{ row }">
            <v-chip
              :color="row.is_staff ? 'primary' : 'default'"
              size="x-small"
              class="text-caption"
            >
              {{ row.is_staff ? 'Менеджер' : 'Пользователь' }}
            </v-chip>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Действия"
          width="100"
        >
          <template #default="{ row }">
            <div class="d-flex">
              <v-btn
                icon="mdi-pencil"
                color="primary"
                size="x-small"
                variant="text"
                class="mr-1"
                @click="editUser(row)"
              />
              <v-btn
                icon="mdi-delete"
                color="error"
                size="x-small"
                variant="text"
                @click="deleteUser(row)"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="userPagination.currentPage"
          :page-size="userPagination.pageSize"
          :total="userPagination.total"
          @current-change="handlePageChange"
          layout="total, prev, pager, next"
          :pager-count="7"
        />
      </div>
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
                  v-model="editedItem.date_of_birth"
                  label="Дата рождения"
                  type="date"
                  density="comfortable"
                  :max="new Date().toISOString().split('T')[0]"
                  clearable
                  @click:clear="editedItem.date_of_birth = null"
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
                  @update:model-value="handleStaffChange"
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
                  :disabled="!editedItem.is_staff"
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
import { debounce } from 'lodash'

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
      if (!editedItem.value.date_of_birth) return ''
      const date = new Date(editedItem.value.date_of_birth)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('ru-RU')
    })

    const headers = [
      { title: 'ID', key: 'id', width: '50px' },
      { title: 'Аватар', key: 'avatar', width: '30px', sortable: false },
      { title: 'Имя', key: 'first_name', width: '120px' },
      { title: 'Фамилия', key: 'last_name', width: '120px' },
      { title: 'Email', key: 'email', width: '150px' },
      { title: 'Дата рождения', key: 'date_of_birth', width: '120px' },
      { title: 'Пол', key: 'gender', width: '100px' },
      { title: 'ОС', key: 'os', width: '100px' },
      { title: 'Статус', key: 'is_active', width: '100px' },
      { title: 'Роль', key: 'is_staff', width: '120px' },
      { title: 'Действия', key: 'actions', width: '100px', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birth: '',
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
      date_of_birth: '',
      gender: 'male',
      os: null,
      is_active: true,
      is_staff: false,
      user_permissions: [],
      avatarFile: null
    }

    const userPagination = ref({
      currentPage: 1,
      pageSize: 15,
      total: 0,
      sortBy: 'id',
      sortOrder: 'ascending'
    })

    const fetchUsers = async () => {
      try {
        loading.value = true;
        const params = new URLSearchParams({
          page: userPagination.value.currentPage.toString()
        });

        if (search.value) {
          params.append('search', search.value);
        }

        if (userPagination.value.sortBy) {
          const orderingPrefix = userPagination.value.sortOrder === 'descending' ? '-' : '';
          params.append('ordering', orderingPrefix + userPagination.value.sortBy);
        }

        const response = await axios.get(`/admin/profile/?${params.toString()}`);
        users.value = response.data.results || [];
        userPagination.value.total = response.data.count || 0;
      } catch (error) {
        console.error('Error fetching users:', error);
        users.value = [];
      } finally {
        loading.value = false;
      }
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

    const handleSearch = (value) => {
      userPagination.value.currentPage = 1;
      debounceSearch(value);
    }

    const debounceSearch = debounce((value) => {
      fetchUsers();
    }, 300);

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
      editedItem.value = itemCopy
      dialog.value = true
      
      axios.get(`/admin/profile/${item.id}/`)
        .then(response => {
          console.log('Detailed user data:', response.data)
          if (response.data.user_permissions) {
            editedItem.value.user_permissions = response.data.user_permissions
          }
          if (response.data.date_of_birth) {
            editedItem.value.date_of_birth = response.data.date_of_birth
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
            if (key === 'date_of_birth') {
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

    const formatDate = (dateString) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      return date.toLocaleDateString('ru-RU')
    }

    const handleStaffChange = (value) => {
      if (!value) {
        editedItem.value.user_permissions = []
      }
    }

    const handlePageChange = (page) => {
      userPagination.value.currentPage = page;
      fetchUsers();
    }

    const handleSortChange = ({ prop, order }) => {
      if (!prop) return;
      userPagination.value.sortBy = prop;
      userPagination.value.sortOrder = order || 'ascending';
      userPagination.value.currentPage = 1;
      fetchUsers();
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
      formattedBirthday,
      formatDate,
      handleStaffChange,
      userPagination,
      handlePageChange,
      handleSortChange
    }
  }
}
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.users-card {
  height: 100%;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.users-title {
  font-size: 20px;
  margin: 0;
}

.search-block {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-field {
  width: 300px;
}

.pagination-container {
  padding: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.file-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style> 