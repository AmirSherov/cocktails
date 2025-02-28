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
        class="cursor-pointer"
      >
        <template v-slot:item="{ item }">
          <tr @click="handleRowClick(item)">
            <td>{{ item.id }}</td>
            <td>{{ item.subject }}</td>
            <td>{{ item.description }}</td>
            <td>
              <v-chip
                :color="item.status === 'open' ? 'success' : 'error'"
                text-color="white"
                small
              >
                {{ item.status }}
              </v-chip>
            </td>
            <td>{{ item.user?.email }}</td>
            <td>{{ item.user?.phone }}</td>
            <td>{{ item.created_at }}</td>
            <td>
              <v-btn 
                v-if="item.status === 'open'"
                color="primary" 
                small 
                @click.stop="closeTicket(item)"
              >
                Закрыть тикет
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog
      v-model="chatDialog"
      max-width="600px"
      persistent
    >
      <ticket-chat
        v-if="selectedTicket"
        :ticket="selectedTicket"
        @close="chatDialog = false"
      />
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { useToast } from 'vue-toastification'
import TicketChat from '@/components/TicketChat.vue'

export default {
  name: 'TicketsView',
  components: {
    TicketChat
  },
  setup() {
    const toast = useToast()
    const search = ref('')
    const loading = ref(false)
    const activeTab = ref(0)
    const tickets = ref([])
    const chatDialog = ref(false)
    const selectedTicket = ref(null)

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
          user: {
            ...ticket.user,
            email: ticket.user?.email || '',
            phone: ticket.user?.phone || '',
            id: ticket.user?.id
          }
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
            user: {
              ...ticket.user,
              email: ticket.user?.email || '',
              phone: ticket.user?.phone || '',
              id: ticket.user?.id
            }
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

    const handleRowClick = (item) => {
      console.log('Clicked ticket:', item)
      if (item) {
        console.log('Opening chat for ticket:', item)
        selectedTicket.value = {
          id: item.id,
          status: item.status,
          subject: item.subject,
          description: item.description,
          user: {
            id: item.user?.id,
            email: item.user?.email,
            phone: item.user?.phone,
            avatar: item.user?.avatar
          }
        }
        chatDialog.value = true
        console.log('Dialog should be open:', chatDialog.value)
        console.log('Selected ticket:', selectedTicket.value)
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
      customFilter,
      chatDialog,
      selectedTicket,
      handleRowClick
    }
  }
}
</script>

<style scoped>
.cursor-pointer >>> tbody tr {
  cursor: pointer;
}
</style> 