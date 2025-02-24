<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h2>Тикеты</h2>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
          class="mx-4"
          @input="handleSearch"
        />
      </v-card-title>

      <v-tabs v-model="activeTab">
        <v-tab>Открытые тикеты</v-tab>
        <v-tab>Закрытые тикеты</v-tab>
      </v-tabs>

      <v-tabs-items v-model="activeTab">
        <v-tab-item>
          <v-data-table
            :headers="headers"
            :items="openTickets"
            :search="search"
            :loading="loading"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn color="primary" small @click="closeTicket(item)">
                Закрыть тикет
              </v-btn>
            </template>
          </v-data-table>
        </v-tab-item>

        <v-tab-item>
          <v-data-table
            :headers="headers"
            :items="closedTickets"
            :search="search"
            :loading="loading"
          >
          </v-data-table>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

export default {
  name: 'TicketsView',
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const activeTab = ref(0)
    const tickets = ref([])

    const headers = [
      { title: 'ID', key: 'id' },
      { title: 'Статус', key: 'status' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const openTickets = computed(() => {
      return tickets.value.filter(ticket => ticket.status !== 'close')
    })

    const closedTickets = computed(() => {
      return tickets.value.filter(ticket => ticket.status === 'close')
    })

    const fetchTickets = async () => {
      loading.value = true
      try {
        const response = await axios.get('/api/admin/sup/')
        tickets.value = response.data
      } catch (error) {
        toast.error('Ошибка при загрузке тикетов')
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/api/admin/sup/?search=${search.value}`)
          tickets.value = response.data
        } catch (error) {
          toast.error('Ошибка при поиске')
        }
        loading.value = false
      } else {
        fetchTickets()
      }
    }

    const closeTicket = async (item) => {
      try {
        await axios.patch(`/api/admin/sup/${item.id}/`, { status: 'close' })
        toast.success('Тикет успешно закрыт')
        fetchTickets()
      } catch (error) {
        toast.error('Ошибка при закрытии тикета')
      }
    }

    onMounted(() => {
      fetchTickets()
    })

    return {
      search,
      loading,
      activeTab,
      tickets,
      headers,
      openTickets,
      closedTickets,
      handleSearch,
      closeTicket
    }
  }
}
</script> 