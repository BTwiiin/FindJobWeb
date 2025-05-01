import { io, type Socket } from "socket.io-client"
import type { ChatMessage } from "../types"

export const createChatSocket = (
  token: string,
  onConnect: () => void,
  onDisconnect: () => void,
  onNewMessage: (message: ChatMessage) => void,
  onRecentMessages: (data: { conversationId: string; messages: ChatMessage[] }) => void,
  onUserTyping: (data: { userId: string; conversationId: string; isTyping: boolean }) => void,
  onError: (error: { message: string; error?: string }) => void
): Socket => {
  // Получить IP-адрес текущего хоста
  const host = window.location.hostname
  const wsUrl = `http://${host}:3001`

  const socket = io(wsUrl, {
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
    path: "/socket.io/",
    forceNew: true,
  })

  // Настройка слушателей событий
  socket.on("connect", onConnect)
  socket.on("disconnect", onDisconnect)
  socket.on("newMessage", onNewMessage)
  socket.on("recentMessages", onRecentMessages)
  socket.on("userTyping", onUserTyping)
  socket.on("error", onError)

  return socket
}

export const cleanupSocket = (socket: Socket | null): void => {
  if (socket) {
    socket.disconnect()
  }
}

export const joinConversationRoom = (socket: Socket | null, conversationId: string): void => {
  if (!socket) return
  socket.emit("joinConversation", { conversationId })
}

export const leaveConversationRoom = (socket: Socket | null, conversationId: string): void => {
  if (!socket) return
  socket.emit("leaveConversation", { conversationId })
}

export const sendMessageToServer = (
  socket: Socket | null,
  conversationId: string,
  text: string
): void => {
  if (!socket || !text.trim()) return
  socket.emit("sendMessage", {
    conversationId,
    text,
  })
}

export const sendTypingStatus = (
  socket: Socket | null,
  conversationId: string,
  isTyping: boolean
): void => {
  if (!socket) return
  socket.emit("typing", { conversationId, isTyping })
} 