<template>
  <v-container fluid class="pa-0">
    <v-card class="full-width-card">
      <v-card-title class="d-flex align-center justify-space-between pa-6">
        <h4>Промокоды</h4>
        <div class="d-flex align-center gap-4" style="min-width: 60%;">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск по названию и описанию"
            hide-details
            class="search-field flex-grow-1"
            @input="handleSearch"
            density="comfortable"
          />
          <v-btn color="primary" class="ml-4" min-width="140" @click="openCreateDialog">
            Создать промокод
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="promos"
        :search="search"
        :loading="loading"
        class="promo-table elevation-1"
      >
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="success"
                  class="mr-2"
                  v-bind="attrs"
                  size="small"
                  v-on="on"
                  @click.stop="openPurchaseDialog(item)"
                >
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </template>
              <span>Добавить пользователю</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="info"
                  class="mr-2"
                  v-bind="attrs"
                  size="small"
                  v-on="on"
                  @click.stop="showHistory(item)"
                >
                  <v-icon>mdi-history</v-icon>
                </v-btn>
              </template>
              <span>История</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  color="primary"
                  class="mr-2"
                  v-bind="attrs"
                  size="small"
                  v-on="on"
                  @click.stop="editPromo(item)"
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
                  size="small"
                  v-on="on"
                  @click.stop="deletePromo(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>Удалить</span>
            </v-tooltip>
          </div>
        </template>

        <template #expanded-item="{ item }">
          <td :colspan="headers.length">
            <v-card flat>
              <v-card-title class="d-flex justify-space-between">
                <span>Покупки промокода</span>
                <div class="d-flex align-center">
                  <v-text-field
                    v-model="purchaseSearch"
                    append-icon="mdi-magnify"
                    label="Поиск по ID пользователя или дате"
                    single-line
                    hide-details
                    class="mx-4"
                    @input="() => handlePurchaseSearch(item.id)"
                  />
                  <v-btn color="primary" @click.stop="openPurchaseDialog(item)">
                    Добавить покупку
                  </v-btn>
                </div>
              </v-card-title>
              <v-data-table
                :headers="purchaseHeaders"
                :items="item.purchases || []"
                :loading="item.loadingPurchases"
                hide-default-footer
              >
                <template #[`item.purchased_at`]="{ item: purchase }">
                  {{ formatDate(purchase.purchased_at) }}
                </template>
                <template #[`item.actions`]="{ item: purchase }">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        color="error"
                        v-bind="attrs"
                        v-on="on"
                        @click.stop="deletePurchase(purchase)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>Удалить</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span>{{ isEditing ? 'Редактировать' : 'Создать' }} промокод</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="editedItem.name"
              label="Название"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-text-field
              v-model="editedItem.code"
              label="Код"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-textarea
              v-model="editedItem.description"
              label="Описание"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-text-field
              v-model="editedItem.links"
              label="Ссылка"
              :rules="[v => !!v || 'Обязательное поле']"
              required
            />
            <v-text-field
              v-model.number="editedItem.cost"
              label="Цена"
              type="number"
              :rules="[
                v => !!v || 'Обязательное поле',
                v => v > 0 || 'Цена должна быть больше 0'
              ]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog" :disabled="saving">Отмена</v-btn>
          <v-btn 
            color="success" 
            text 
            @click="savePromo" 
            :disabled="!valid || saving"
            :loading="saving"
          >
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="purchaseDialog" max-width="400px">
      <v-card>
        <v-card-title>Добавить промокод пользователю</v-card-title>
        <v-card-text>
          <v-form ref="purchaseForm" v-model="validPurchase">
            <div v-if="selectedUser" class="selected-user mb-4">
              <div class="d-flex align-center">
                <v-avatar size="40" class="mr-3">
                  <v-img :src="selectedUser.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-medium">{{ selectedUser.display_name }}</div>
                  <div class="text-caption text-grey">{{ selectedUser.email }}</div>
                </div>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-close" size="small" @click="selectedUser = null"></v-btn>
              </div>
            </div>
            
            <v-autocomplete
              v-if="!selectedUser"
              v-model="editedPurchase.user"
              :items="usersList"
              item-title="display_name"
              item-value="id"
              label="Выберите пользователя"
              :loading="loadingUsers"
              return-object
              clearable
              @update:search="searchUsers"
              @update:model-value="selectUser"
              class="user-autocomplete"
              :menu-props="{ 
                contentClass: 'user-autocomplete-menu',
                maxWidth: '500'
              }"
              eager
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props" class="user-list-item">
                  <template #prepend>
                    <v-avatar size="32">
                      <v-img :src="item.raw.avatar || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'" />
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ item.raw.first_name }} {{ item.raw.last_name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="closePurchaseDialog">Отмена</v-btn>
          <v-btn 
            color="success" 
            text 
            @click="savePurchase"
            :loading="savingPurchase"
            :disabled="!editedPurchase.user && !selectedUser"
          >
            Добавить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>Подтверждение удаления</v-card-title>
        <v-card-text>
          {{ deleteMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click="deleteDialog = false">Отмена</v-btn>
          <v-btn 
            color="error" 
            text 
            @click="confirmDelete"
            :loading="deleting"
          >
            Удалить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="historyDialog" max-width="800px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>История промокода</span>
          <v-btn icon @click="historyDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-data-table
            :headers="historyHeaders"
            :items="promoHistory"
            :loading="loadingHistory"
            class="history-table"
          >
            <template #[`item.user`]="{ item }">
              <v-btn
                text
                color="primary"
                variant="text"
                :to="{ name: 'users', query: { search: item.user }}"
                class="pa-0"
              >
                {{ item.user }}
              </v-btn>
            </template>
            <template #[`item.purchased_at`]="{ item }">
              {{ formatDate(item.purchased_at) }}
            </template>
            <template #[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="error"
                    size="small"
                    v-bind="attrs"
                    v-on="on"
                    @click.stop="deletePurchaseFromHistory(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Удалить</span>
              </v-tooltip>
            </template>
          </v-data-table>
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
  name: 'PromoView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const purchaseSearch = ref('')
    const loading = ref(false)
    const saving = ref(false)
    const savingPurchase = ref(false)
    const deleting = ref(false)
    const dialog = ref(false)
    const purchaseDialog = ref(false)
    const deleteDialog = ref(false)
    const isEditing = ref(false)
    const promos = ref([])
    const valid = ref(false)
    const validPurchase = ref(false)
    const form = ref(null)
    const purchaseForm = ref(null)
    const deleteMessage = ref('')
    const itemToDelete = ref(null)
    const deleteType = ref('')
    const historyDialog = ref(false)
    const loadingHistory = ref(false)
    const promoHistory = ref([])
    const usersList = ref([])
    const loadingUsers = ref(false)
    const selectedUser = ref(null)

    const headers = [
      { title: 'ID', key: 'id', width: '80px' },
      { title: 'Название', key: 'name', width: '15%' },
      { title: 'Код', key: 'code', width: '15%' },
      { title: 'Описание', key: 'description', width: '20%' },
      { title: 'Ссылка', key: 'links', width: '20%' },
      { title: 'Цена', key: 'cost', width: '100px' },
      { title: 'Количество покупок', key: 'how_much_purchased', width: '150px' },
      { title: 'Действия', key: 'actions', sortable: false, width: '120px' }
    ]

    const purchaseHeaders = [
      { title: 'ID покупки', key: 'id', width: '100px' },
      { title: 'ID пользователя', key: 'user', width: '150px' },
      { title: 'Дата покупки', key: 'purchased_at' },
      { title: 'Действия', key: 'actions', sortable: false, width: '100px' }
    ]

    const historyHeaders = [
      { title: 'ID', key: 'id', width: '100px' },
      { title: 'ID пользователя', key: 'user', width: '150px' },
      { title: 'Дата покупки', key: 'purchased_at' },
      { title: 'Действия', key: 'actions', sortable: false, width: '100px' }
    ]

    const editedItem = ref({
      id: null,
      name: '',
      code: '',
      description: '',
      links: '',
      cost: 0
    })

    const defaultItem = {
      id: null,
      name: '',
      code: '',
      description: '',
      links: '',
      cost: 0
    }

    const editedPurchase = ref({
      user: null,
      promo: null
    })

    const defaultPurchase = {
      user: null,
      promo: null
    }

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleString('ru-RU')
    }

    const fetchPromos = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/promo/')
        promos.value = Array.isArray(response.data) ? response.data : 
                      response.data.results ? response.data.results : []
      } catch {
        toast.error('Ошибка при загрузке промокодов')
        promos.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/promo/?search=${search.value}`)
          promos.value = Array.isArray(response.data) ? response.data : 
                        response.data.results ? response.data.results : []
        } catch {
          toast.error('Ошибка при поиске')
          promos.value = []
        }
        loading.value = false
      } else {
        fetchPromos()
      }
    }

    const handlePurchaseSearch = async (promoId) => {
      if (!promoId) return

      const item = promos.value.find(p => p.id === promoId)
      if (!item) return

      item.loadingPurchases = true
      try {
        const response = await axios.get(
          `/admin/promo/purchased/?promo=${promoId}${
            purchaseSearch.value ? `&search=${purchaseSearch.value}` : ''
          }`
        )
        item.purchases = Array.isArray(response.data) ? response.data :
                        response.data.results ? response.data.results : []
      } catch {
        toast.error('Ошибка при поиске покупок')
        item.purchases = []
      }
      item.loadingPurchases = false
    }

    const openCreateDialog = () => {
      isEditing.value = false
      editedItem.value = { ...defaultItem }
      dialog.value = true
    }

    const editPromo = (item) => {
      isEditing.value = true
      editedItem.value = { ...item }
      dialog.value = true
    }

    const closeDialog = () => {
      dialog.value = false
      editedItem.value = { ...defaultItem }
      form.value?.resetValidation()
    }

    const savePromo = async () => {
      if (!form.value?.validate()) return

      saving.value = true
      try {
        if (isEditing.value) {
          await axios.patch(`/admin/promo/${editedItem.value.id}/`, editedItem.value)
          toast.success('Промокод успешно обновлен')
        } else {
          await axios.post('/admin/promo/', editedItem.value)
          toast.success('Промокод успешно создан')
        }
        closeDialog()
        fetchPromos()
      } catch {
        toast.error('Ошибка при сохранении промокода')
      } finally {
        saving.value = false
      }
    }

    const deletePromo = (item) => {
      deleteType.value = 'promo'
      itemToDelete.value = item
      deleteMessage.value = `Вы действительно хотите удалить промокод "${item.name}"?`
      deleteDialog.value = true
    }

    const openPurchaseDialog = (item) => {
      editedPurchase.value = {
        user: null,
        promo: item.id
      }
      selectedUser.value = null
      usersList.value = []
      purchaseDialog.value = true
      searchUsers('a')
    }

    const closePurchaseDialog = () => {
      purchaseDialog.value = false
      editedPurchase.value = { ...defaultPurchase }
      selectedUser.value = null
      usersList.value = []
    }

    const savePurchase = async () => {
      if (!editedPurchase.value.user && !selectedUser.value) {
        toast.error('Выберите пользователя')
        return
      }

      savingPurchase.value = true
      try {
        const user = selectedUser.value || editedPurchase.value.user
        const purchaseData = {
          user: typeof user === 'object' ? user.id : user,
          promo: editedPurchase.value.promo
        }
        
        await axios.post('/admin/promo/purchased/', purchaseData)
        toast.success('Промокод успешно добавлен пользователю')
        closePurchaseDialog()
        fetchPromos()
      } catch {
        toast.error('Ошибка при добавлении промокода пользователю')
      } finally {
        savingPurchase.value = false
      }
    }

    const deletePurchase = (item) => {
      deleteType.value = 'purchase'
      itemToDelete.value = item
      deleteMessage.value = `Вы действительно хотите удалить покупку #${item.id}?`
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      deleting.value = true
      try {
        if (deleteType.value === 'promo') {
          await axios.delete(`/admin/promo/${itemToDelete.value.id}/`)
          toast.success('Промокод успешно удален')
          fetchPromos()
        } else if (deleteType.value === 'purchase') {
          await axios.delete(`/admin/promo/purchased/${itemToDelete.value.id}/`)
          toast.success('Покупка успешно удалена')
          const promoItem = promos.value.find(p => p.purchases?.some(pur => pur.id === itemToDelete.value.id))
          if (promoItem) {
            handlePurchaseSearch(promoItem.id)
          }
          fetchPromos()
        }
      } catch {
        toast.error(`Ошибка при удалении ${deleteType.value === 'promo' ? 'промокода' : 'покупки'}`)
      } finally {
        deleteDialog.value = false
        deleting.value = false
      }
    }

    const showHistory = async (item) => {
      historyDialog.value = true
      loadingHistory.value = true
      try {
        const response = await axios.get(`/admin/promo/purchased/?promo=${item.id}`)
        promoHistory.value = Array.isArray(response.data) ? response.data : 
                            response.data.results ? response.data.results : []
      } catch {
        toast.error('Ошибка при загрузке истории промокода')
        promoHistory.value = []
      } finally {
        loadingHistory.value = false
      }
    }

    const deletePurchaseFromHistory = async (item) => {
      try {
        await axios.delete(`/admin/promo/purchased/${item.id}/`)
        toast.success('Покупка успешно удалена')
        promoHistory.value = promoHistory.value.filter(p => p.id !== item.id)
        const currentPromo = promos.value.find(p => p.purchases?.some(pur => pur.id === item.id))
        if (currentPromo) {
          fetchPromos()
        }
      } catch {
        toast.error('Ошибка при удалении покупки')
      }
    }

    const searchUsers = async (query) => {
      if (!query && query !== 'a') {
        return
      }

      loadingUsers.value = true
      try {
        const searchParam = query === 'a' ? '' : query
        const response = await axios.get(`/admin/profile/?search=${searchParam}`)
        const users = Array.isArray(response.data) ? response.data : 
                     response.data.results ? response.data.results : []
        
        usersList.value = users.map(user => ({
          id: user.id,
          email: user.email,
          avatar: user.avatar,
          display_name: user.first_name + ' ' + user.last_name
        }))
      } catch {
        toast.error('Ошибка при поиске пользователей')
        usersList.value = []
      } finally {
        loadingUsers.value = false
      }
    }

    const selectUser = (user) => {
      selectedUser.value = user
      editedPurchase.value.user = user
    }

    onMounted(() => {
      fetchPromos()
    })

    return {
      search,
      purchaseSearch,
      loading,
      saving,
      savingPurchase,
      deleting,
      dialog,
      purchaseDialog,
      deleteDialog,
      isEditing,
      promos,
      headers,
      purchaseHeaders,
      editedItem,
      editedPurchase,
      selectedUser,
      valid,
      validPurchase,
      form,
      purchaseForm,
      deleteMessage,
      formatDate,
      handleSearch,
      handlePurchaseSearch,
      openCreateDialog,
      editPromo,
      closeDialog,
      savePromo,
      deletePromo,
      openPurchaseDialog,
      closePurchaseDialog,
      savePurchase,
      deletePurchase,
      confirmDelete,
      historyDialog,
      loadingHistory,
      promoHistory,
      historyHeaders,
      showHistory,
      deletePurchaseFromHistory,
      usersList,
      loadingUsers,
      searchUsers,
      selectUser
    }
  }
}
</script>

<style>
.full-width-card {
  width: 100%;
  margin: 0;
  border-radius: 0;
}

.promo-table {
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

.promo-table .v-data-table__wrapper table {
  table-layout: auto;
  width: 100%;
  margin: 0;
  border-collapse: collapse;
}

.promo-table .v-data-table__wrapper table td,
.promo-table .v-data-table__wrapper table th {
  white-space: normal;
  word-wrap: break-word;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.search-field {
  min-width: 300px;
}

.gap-4 {
  gap: 16px;
}

.user-autocomplete {
  width: 100%;
}

.user-autocomplete-menu {
  max-width: 500px !important;
  margin: 0;
  padding: 0;
}

.user-list-item {
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  width: 100%;
}

.user-list-item:last-child {
  border-bottom: none;
}

.user-list-item .v-list-item-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.user-list-item .v-list-item-subtitle {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
}

.v-list-item__prepend {
  margin-right: 12px;
}

.v-autocomplete__content {
  max-width: 500px !important;
}

.v-list {
  max-width: 500px !important;
}

.selected-user {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  padding: 12px;
  background-color: #f5f5f5;
}
</style> 