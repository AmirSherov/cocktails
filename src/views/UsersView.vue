<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Пользователи</h2>
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
          Создать пользователя
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        :loading="loading"
      >
        <template v-slot:item.avatar="{ item }">
          <v-avatar size="40">
            <v-img :src="item.avatar" alt="avatar" />
          </v-avatar>
        </template>

        <template v-slot:item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'">
            {{ item.is_active ? 'Активный' : 'Неактивный' }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editUser(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deleteUser(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования пользователя -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} пользователя</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.first_name"
                  label="Имя"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.last_name"
                  label="Фамилия"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="editedItem.email"
                  label="Email"
                  type="email"
                  required
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedItem.password"
                  label="Пароль"
                  type="password"
                  :required="!isEditing"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-text-field
                      v-model="editedItem.date_of_birthday"
                      label="Дата рождения"
                      readonly
                      v-bind="props"
                    />
                  </template>
                  <v-date-picker
                    v-model="editedItem.date_of_birthday"
                  />
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.gender"
                  :items="['Мужской', 'Женский']"
                  label="Пол"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedItem.os"
                  :items="['IOS', 'Android']"
                  label="Операционная система"
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.is_active"
                  label="Активный"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-switch
                  v-model="editedItem.is_staff"
                  label="Менеджер"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="saveUser">Сохранить</v-btn>
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
  name: 'UsersView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const isEditing = ref(false)
    const users = ref([])
    const valid = ref(false)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Аватар', key: 'avatar' },
      { title: 'Имя', key: 'first_name' },
      { title: 'Фамилия', key: 'last_name' },
      { title: 'Email', key: 'email' },
      { title: 'Дата рождения', key: 'date_of_birthday' },
      { title: 'Пол', key: 'gender' },
      { title: 'ОС', key: 'os' },
      { title: 'Активный', key: 'is_active' },
      { title: 'Менеджер', key: 'is_staff' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birthday: '',
      gender: '',
      os: null,
      is_active: true,
      is_staff: false
    })

    const defaultItem = {
      id: null,
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      date_of_birthday: '',
      gender: '',
      os: null,
      is_active: true,
      is_staff: false
    }

    const fetchUsers = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/profile/')
        users.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке пользователей')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/profile/?search=${search.value}`)
          users.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchUsers()
      }
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editUser = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
    }

    const saveUser = async () => {
      try {
        if (isEditing.value) {
          await axios.patch(`/api/admin/profile/${editedItem.value.id}/`, editedItem.value)
          toast.success('Пользователь успешно обновлен')
        } else {
          await axios.post('/api/admin/profile/', editedItem.value)
          toast.success('Пользователь успешно создан')
        }
        closeDialog()
        fetchUsers()
      } catch (error) {
        toast.error('Ошибка при сохранении пользователя')
      }
    }

    const deleteUser = async (item) => {
      if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
        try {
          await axios.delete(`/api/admin/profile/${item.id}/`)
          toast.success('Пользователь успешно удален')
          fetchUsers()
        } catch (error) {
          toast.error('Ошибка при удалении пользователя')
        }
      }
    }

    onMounted(() => {
      fetchUsers()
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
      handleSearch,
      openCreateDialog,
      editUser,
      closeDialog,
      saveUser,
      deleteUser
    }
  }
}
</script> 