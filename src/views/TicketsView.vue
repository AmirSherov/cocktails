<template>
  <v-container>
    <v-card>
      <v-card-title>
        <h2>Тикеты</h2>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск по описанию и другим полям"
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

      <v-data-table
        :headers="headers"
        :items="filteredTickets"
        :search="search"
        :custom-filter="customFilter"
        :loading="loading"
      >
        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            :color="item.status === 'open' ? 'success' : 'error'"
            text-color="white"
            small
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn 
            v-if="item.status === 'open'"
            color="primary" 
            small 
            @click="closeTicket(item)"
          >
            Закрыть тикет
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
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
      { title: 'Тема', key: 'subject' },
      { title: 'Описание', key: 'description' },
      { title: 'Статус', key: 'status' },
      { title: 'Email пользователя', key: 'user.email' },
      { title: 'Телефон', key: 'user.phone' },
      { title: 'Дата создания', key: 'created_at' },
      { title: 'Действия', key: 'actions', sortable: false }
    ]

    const filteredTickets = computed(() => {
      return tickets.value.filter(ticket => 
        activeTab.value === 0 ? ticket.status === 'open' : ticket.status === 'close'
      )
    })

    const fetchTickets = async () => {
      loading.value = true
      try {
        const response = await axios.get('/admin/sup/')
        console.log('Response data:', response.data)
        tickets.value = Array.isArray(response.data) ? response.data : response.data.results || []
        tickets.value = tickets.value.map(ticket => ({
          ...ticket,
          created_at: new Date(ticket.created_at).toLocaleString('ru-RU'),
          'user.email': ticket.user?.email || '',
          'user.phone': ticket.user?.phone || ''
        }))
      } catch (error) {
        console.error('Error loading tickets:', error)
        toast.error('Ошибка при загрузке тикетов')
        tickets.value = []
      }
      loading.value = false
    }

    const handleSearch = async () => {
      if (search.value) {
        loading.value = true
        try {
          const response = await axios.get(`/admin/sup/?search=${search.value}`)
          tickets.value = Array.isArray(response.data) ? response.data : response.data.results || []
          tickets.value = tickets.value.map(ticket => ({
            ...ticket,
            created_at: new Date(ticket.created_at).toLocaleString('ru-RU'),
            'user.email': ticket.user?.email || '',
            'user.phone': ticket.user?.phone || ''
          }))
        } catch (error) {
          console.error('Error searching tickets:', error)
          toast.error('Ошибка при поиске')
          tickets.value = []
        }
        loading.value = false
      } else {
        fetchTickets()
      }
    }

    const closeTicket = async (item) => {
      try {
        await axios.patch(`/admin/sup/${item.id}/`, { status: 'close' })
        toast.success('Тикет успешно закрыт')
        fetchTickets()
      } catch (error) {
        console.error('Error closing ticket:', error)
        toast.error('Ошибка при закрытии тикета')
      }
    }

    const customFilter = (value, search, item) => {
      if (item.description && item.description.toLowerCase().includes(search.toLowerCase())) {
        return true
      }
      return value != null &&
        search != null &&
        typeof value === 'string' &&
        value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
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
      filteredTickets,
      handleSearch,
      closeTicket,
      customFilter
    }
  }
}
</script> 