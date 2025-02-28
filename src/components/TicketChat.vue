<template>
  <v-card class="chat-container" v-if="ticket">
    <v-card-title class="chat-header">
      <v-avatar size="40" class="mr-3">
        <v-img v-if="ticket.user?.avatar" :src="ticket.user.avatar" />
        <v-icon v-else>mdi-account</v-icon>
      </v-avatar>
      <div class="user-info">
        <div class="text-subtitle-1">ID: {{ ticket.user?.id || 'Н/Д' }}</div>
        <div class="text-subtitle-2">{{ ticket.user?.email || 'Email не указан' }}</div>
      </div>
      <v-spacer></v-spacer>
      <v-btn icon @click="closeChat">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text class="chat-messages" ref="messagesContainer">
      <div v-if="messages.length === 0" class="text-center my-4 text--disabled">
        Сообщений пока нет
      </div>
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.isAdmin ? 'message-admin' : 'message-user']">
        <div class="message-content">
          {{ message.message }}
        </div>
        <div class="message-time">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="chat-input">
      <v-text-field
        v-model="newMessage"
        placeholder="Введите сообщение..."
        @keyup.enter="sendMessage"
        hide-details
        outlined
        dense
      />
      <v-btn
        color="primary"
        icon
        class="ml-2"
        @click="sendMessage"
        :disabled="!newMessage.trim()"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'TicketChat',
  props: {
    ticket: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      messages: [],
      newMessage: '',
      socket: null,
      isConnected: false,
      currentUserId: localStorage.getItem('userId')
    }
  },
  mounted() {
    if (!this.currentUserId) {
      console.error('No user ID found in localStorage')
      return
    }
    this.connectWebSocket()
  },
  beforeUnmount() {
    this.closeConnection()
  },
  methods: {
    connectWebSocket() {
      if (!this.currentUserId || !this.ticket?.id) {
        console.error('Missing required data:', {
          userId: this.currentUserId,
          ticketId: this.ticket?.id
        })
        return
      }

      const baseUrl = 'ws://109.71.246.251:8000'
      const wsUrl = `${baseUrl}/ws/support/?user_id=${this.currentUserId}&ticket_id=${this.ticket.id}`
      
      try {
        this.socket = new WebSocket(wsUrl)
        
        this.socket.onopen = () => {
          this.isConnected = true
        }
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'chat_history') {
              this.messages = data.history.map(msg => ({
                message: msg.message || '',
                isAdmin: String(msg.user_id) === String(this.currentUserId),
                timestamp: msg.timestamp || Date.now()
              }))
            } else {
              if (data.message) {
                this.messages.push({
                  message: data.message,
                  isAdmin: String(data.user_id) === String(this.currentUserId),
                  timestamp: Date.now()
                })
              }
            }
            
            this.$nextTick(() => {
              this.scrollToBottom()
            })
          } catch (error) {
            console.error('Error processing WebSocket message:', error)
          }
        }
        
        this.socket.onerror = () => {
          this.isConnected = false
        }
        
        this.socket.onclose = () => {
          this.isConnected = false
        }
      } catch (error) {
        console.error('Error creating WebSocket connection:', error)
        this.isConnected = false
      }
    },
    closeConnection() {
      if (this.socket) {
        this.socket.close()
        this.socket = null
        this.isConnected = false
      }
    },
    closeChat() {
      this.closeConnection()
      this.$emit('close')
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.isConnected || !this.currentUserId) {
        return
      }
      
      const message = {
        user_id: this.currentUserId,
        message: this.newMessage.trim()
      }
      
      try {
        this.socket.send(JSON.stringify(message))
        this.newMessage = ''
      } catch (error) {
        console.error('Error sending message:', error)
        this.connectWebSocket()
      }
    },
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 8px;
  margin: 4px 0;
}

.message-user {
  align-self: flex-start;
  background-color: #f5f5f5;
}

.message-admin {
  align-self: flex-end;
  background-color: #e3f2fd;
}

.message-content {
  word-break: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  text-align: right;
  margin-top: 4px;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}

.user-info {
  display: flex;
  flex-direction: column;
}
</style> 