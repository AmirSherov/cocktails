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
            <v-text-field
              v-model="editedPurchase.user"
              label="ID пользователя"
              type="number"
              required
              :rules="[v => !!v || 'ID пользователя обязателен']"
            />
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
            :disabled="!validPurchase"
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
        console.log('Promo response:', response.data)
        promos.value = Array.isArray(response.data) ? response.data : 
                      response.data.results ? response.data.results : []
      } catch (error) {
        console.error('Error loading promos:', error)
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
        } catch (error) {
          console.error('Error searching:', error)
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
      } catch (error) {
        console.error('Error searching purchases:', error)
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
      } catch (error) {
        console.error('Error saving promo:', error)
        const errorMessage = error.response?.data?.detail || 'Ошибка при сохранении промокода'
        toast.error(errorMessage)
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
      purchaseDialog.value = true
    }

    const closePurchaseDialog = () => {
      purchaseDialog.value = false
      editedPurchase.value = { ...defaultPurchase }
      purchaseForm.value?.reset()
    }

    const savePurchase = async () => {
      if (!purchaseForm.value?.validate()) return

      savingPurchase.value = true
      try {
        await axios.post('/admin/promo/purchased/', editedPurchase.value)
        toast.success('Промокод успешно добавлен пользователю')
        closePurchaseDialog()
        fetchPromos() // Обновляем список для обновления счетчика покупок
      } catch (error) {
        console.error('Error adding promo to user:', error)
        const errorMessage = error.response?.data?.detail || 'Ошибка при добавлении промокода пользователю'
        toast.error(errorMessage)
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
          // Обновляем список покупок для текущего промокода
          const promoItem = promos.value.find(p => p.purchases?.some(pur => pur.id === itemToDelete.value.id))
          if (promoItem) {
            handlePurchaseSearch(promoItem.id)
          }
          fetchPromos() // Обновляем список для обновления счетчика покупок
        }
      } catch (error) {
        console.error('Error deleting:', error)
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
      } catch (error) {
        console.error('Error loading promo history:', error)
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
        // Обновляем список истории
        const currentPromo = promos.value.find(p => p.purchases?.some(pur => pur.id === item.id))
        if (currentPromo) {
          showHistory(currentPromo)
          fetchPromos() // Обновляем список для обновления счетчика покупок
        }
      } catch (error) {
        console.error('Error deleting purchase:', error)
        toast.error('Ошибка при удалении покупки')
      }
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
      deletePurchaseFromHistory
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
</style> 