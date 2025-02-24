<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <h2>Промокоды</h2>
        <div class="d-flex align-center">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Поиск по названию и описанию"
            single-line
            hide-details
            class="mx-4"
            @input="handleSearch"
          />
          <v-btn color="primary" @click="openCreateDialog">
            Создать промокод
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="promos"
        :search="search"
        :loading="loading"
        @click:row="expandRow"
      >
        <template v-slot:expanded-row="{ columns, item }">
          <tr>
            <td :colspan="columns.length">
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
                    <v-btn color="primary" @click="openPurchaseDialog(item)">
                      Добавить покупку
                    </v-btn>
                  </div>
                </v-card-title>
                <v-data-table
                  :headers="purchaseHeaders"
                  :items="item.purchases || []"
                  hide-default-footer
                >
                  <template v-slot:item.actions="{ item: purchase }">
                    <v-btn icon small @click="deletePurchase(purchase)" color="error">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-data-table>
              </v-card>
            </td>
          </tr>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="editPromo(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon small @click="deletePromo(item)" color="error">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Диалог создания/редактирования промокода -->
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
              required
            />
            <v-textarea
              v-model="editedItem.description"
              label="Описание"
              required
            />
            <v-text-field
              v-model="editedItem.links"
              label="Ссылка"
              required
            />
            <v-text-field
              v-model.number="editedItem.cost"
              label="Цена"
              type="number"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closeDialog">Отмена</v-btn>
          <v-btn color="success" text @click="savePromo">Сохранить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог создания покупки -->
    <v-dialog v-model="purchaseDialog" max-width="500px">
      <v-card>
        <v-card-title>Добавить покупку промокода</v-card-title>
        <v-card-text>
          <v-form ref="purchaseForm" v-model="validPurchase">
            <v-text-field
              v-model.number="editedPurchase.user"
              label="ID пользователя"
              type="number"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="closePurchaseDialog">Отмена</v-btn>
          <v-btn color="success" text @click="savePurchase">Сохранить</v-btn>
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
  name: 'PromoView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const purchaseSearch = ref('')
    const loading = ref(false)
    const dialog = ref(false)
    const purchaseDialog = ref(false)
    const isEditing = ref(false)
    const promos = ref([])
    const valid = ref(false)
    const validPurchase = ref(false)
    const selectedPromo = ref(null)

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Название', key: 'name' },
      { title: 'Описание', key: 'description' },
      { title: 'Ссылка', key: 'links' },
      { title: 'Цена', key: 'cost' },
      { title: 'Количество покупок', key: 'how_much_purchased' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const purchaseHeaders = [
      { title: 'ID покупки', key: 'id' },
      { title: 'ID пользователя', key: 'user' },
      { title: 'Дата покупки', key: 'purchased_at' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const editedItem = ref({
      id: null,
      name: '',
      description: '',
      links: '',
      cost: 0
    })

    const defaultItem = {
      id: null,
      name: '',
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

    const fetchPromos = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/promo/')
        promos.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке промокодов')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/promo/?search=${search.value}`)
          promos.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
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

      try {
        const response = await axios.get(
          `/api/admin/promo/purchased/?promo=${promoId}${
            purchaseSearch.value ? `&search=${purchaseSearch.value}` : ''
          }`
        )
        item.purchases = response.data
      } catch (error) {
        toast.error('Ошибка при поиске покупок')
      }
    }

    const expandRow = (item) => {
      if (!item.purchases) {
        axios.get(`/api/admin/promo/purchased/?promo=${item.id}`)
          .then(response => {
            item.purchases = response.data
          })
          .catch(() => {
            toast.error('Ошибка при загрузке покупок')
          })
      }
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
    }

    const savePromo = async () => {
      try {
        if (isEditing.value) {
          await axios.patch(`/api/admin/promo/${editedItem.value.id}/`, editedItem.value)
          toast.success('Промокод успешно обновлен')
        } else {
          await axios.post('/api/admin/promo/', editedItem.value)
          toast.success('Промокод успешно создан')
        }
        closeDialog()
        fetchPromos()
      } catch (error) {
        toast.error('Ошибка при сохранении промокода')
      }
    }

    const deletePromo = async (item) => {
      if (confirm('Вы уверены, что хотите удалить этот промокод?')) {
        try {
          await axios.delete(`/api/admin/promo/${item.id}/`)
          toast.success('Промокод успешно удален')
          fetchPromos()
        } catch (error) {
          toast.error('Ошибка при удалении промокода')
        }
      }
    }

    const openPurchaseDialog = (promo) => {
      selectedPromo.value = promo
      editedPurchase.value = { ...defaultPurchase, promo: promo.id }
      purchaseDialog.value = true
    }

    const closePurchaseDialog = () => {
      purchaseDialog.value = false
      editedPurchase.value = { ...defaultPurchase }
      selectedPromo.value = null
    }

    const savePurchase = async () => {
      try {
        await axios.post('/api/admin/promo/purchased/', editedPurchase.value)
        toast.success('Покупка успешно создана')
        closePurchaseDialog()
        if (selectedPromo.value) {
          expandRow(selectedPromo.value)
        }
        fetchPromos()
      } catch (error) {
        toast.error('Ошибка при создании покупки')
      }
    }

    const deletePurchase = async (purchase) => {
      if (confirm('Вы уверены, что хотите удалить эту покупку?')) {
        try {
          await axios.delete(`/api/admin/promo/purchased/${purchase.id}/`)
          toast.success('Покупка успешно удалена')
          if (selectedPromo.value) {
            expandRow(selectedPromo.value)
          }
          fetchPromos()
        } catch (error) {
          toast.error('Ошибка при удалении покупки')
        }
      }
    }

    onMounted(() => {
      fetchPromos()
    })

    return {
      search,
      purchaseSearch,
      loading,
      dialog,
      purchaseDialog,
      isEditing,
      promos,
      headers,
      purchaseHeaders,
      editedItem,
      editedPurchase,
      valid,
      validPurchase,
      handleSearch,
      handlePurchaseSearch,
      expandRow,
      openCreateDialog,
      editPromo,
      closeDialog,
      savePromo,
      deletePromo,
      openPurchaseDialog,
      closePurchaseDialog,
      savePurchase,
      deletePurchase
    }
  }
}
</script> 