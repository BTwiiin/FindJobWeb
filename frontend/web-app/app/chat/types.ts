export interface ChatMessage {
  id: string
  text: string
  senderId: string
  senderUsername: string
  senderFirstName?: string
  senderLastName?: string
  senderRole?: string
  conversationId: string
  createdAt?: Date
  timestamp?: Date
  status?: "sending" | "delivered" | "error"
  tempId?: string
}

export interface Conversation {
  id: string
  otherUser: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    role?: string
  }
  lastMessage?: ChatMessage
  updatedAt: Date
} 