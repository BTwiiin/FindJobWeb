"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { type Socket } from "socket.io-client"
import { getCurrentUser } from "@/app/actions/authActions"
import { getConversations, getOrCreateApplicationChat, getWebSocketToken } from "@/app/actions/chatActions"
import { Card, CardContent } from "@/components/ui/card"
import type { User } from "@/types"
import JobSearchHeaderClient from "@/app/components/JobSearchHeaderClient"
import { AuthErrorHandler } from "@/components/auth-error-handler"
import { useMobile } from "@/app/hooks/use-mobile"

import ConversationList from "./components/ConversationList"
import ChatArea from "./components/ChatArea"
import { type ChatMessage, type Conversation } from "./types"
import { createChatSocket, joinConversationRoom, sendMessageToServer, sendTypingStatus } from "./components/ChatSocket"

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({})
  const [messageText, setMessageText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const isMobile = useMobile()

  // Автоматически закрывать сайдбар на мобильных устройствах при выборе беседы
  useEffect(() => {
    if (isMobile && activeConversation) {
      setSidebarOpen(false)
    }
  }, [activeConversation, isMobile])

  // Автоматически открывать сайдбар на десктопе
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(true)
    }
  }, [isMobile])

  // Загружать беседы при изменении пользователя
  useEffect(() => {
    if (user && socket && isConnected) {
      fetchConversations()
    }
  }, [user, socket, isConnected])

  // Инициализация соединения с сокетом и загрузка данных пользователя
  useEffect(() => {
    const fetchUserAndConnect = async () => {
      try {
        setIsLoading(true)
        const userData = await getCurrentUser()
        if (!userData) {
          router.push("/auth/login")
          return
        }
        setUser(userData)

        // Получить токен для WebSocket
        let token
        try {
          const wsTokenResponse = await getWebSocketToken()
          token = wsTokenResponse.token
        } catch (tokenError) {
          token = userData.accessToken
        }

        if (!token) {
          setError("Токен аутентификации не найден")
          return
        }

        // Создаем сокет и настраиваем обработчики событий
        const socketInstance = createChatSocket(
          token,
          // onConnect
          () => setIsConnected(true),
          // onDisconnect
          () => setIsConnected(false),
          // onNewMessage
          (message: ChatMessage) => {
            // Убедимся, что у нас есть объект Date для timestamp
            const messageWithFixedDate: ChatMessage = {
              ...message,
              createdAt:
                message.createdAt instanceof Date
                  ? message.createdAt
                  : message.createdAt
                    ? new Date(message.createdAt)
                    : message.timestamp instanceof Date
                      ? message.timestamp
                      : message.timestamp
                        ? new Date(message.timestamp)
                        : new Date(),
            }

            setMessages((prev) => {
              const conversationMessages = prev[message.conversationId] || []

              // Проверяем на дубликаты
              const isDuplicate = conversationMessages.some((m) => m.id === message.id)
              if (isDuplicate) {
                return prev
              }

              return {
                ...prev,
                [message.conversationId]: [...conversationMessages, messageWithFixedDate],
              }
            })
          },
          // onRecentMessages
          (data: { conversationId: string; messages: ChatMessage[] }) => {
            // Преобразуем строковые timestamp в объекты Date если нужно
            const messagesWithFixedDates = data.messages.map((message) => ({
              ...message,
              createdAt:
                message.createdAt instanceof Date
                  ? message.createdAt
                  : message.createdAt
                    ? new Date(message.createdAt)
                    : message.timestamp instanceof Date
                      ? message.timestamp
                      : message.timestamp
                        ? new Date(message.timestamp)
                        : new Date(),
            }))

            setMessages((prev) => ({
              ...prev,
              [data.conversationId]: messagesWithFixedDates,
            }))
          },
          // onUserTyping
          (data: { userId: string; conversationId: string; isTyping: boolean }) => {
            if (data.userId !== userData.id) {
              setTypingUsers((prev) => ({
                ...prev,
                [data.userId]: data.isTyping,
              }))
            }
          },
          // onError
          (error: { message: string; error?: string }) => {
            setError(`Ошибка сокета: ${error.message}`)
          }
        )

        setSocket(socketInstance)

        // Проверяем, есть ли ID заявки в URL
        const params = new URLSearchParams(window.location.search)
        const applicationId = params.get("application")

        if (applicationId) {
          handleApplicationChat(applicationId)
        } else {
          // Обычная настройка чата - загружаем беседы пользователя
          fetchConversations()
        }

        setIsLoading(false)
      } catch (error) {
        setError("Ошибка инициализации чата: " + (error as Error).message)
        setIsLoading(false)
      }
    }

    fetchUserAndConnect()

    // Функция очистки
    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  // Обработка чата для конкретной заявки
  const handleApplicationChat = async (applicationId: string) => {
    try {
      const conversation = await getOrCreateApplicationChat(applicationId)
      console.log("Conversation data:", conversation)

      if (!conversation) {
        setError("Не получена беседа от getOrCreateApplicationChat")
        return
      }

      if (!user) {
        setError("Невозможно обработать чат заявки: Пользователь недоступен")
        return
      }

      if (!socket) {
        setError("Невозможно обработать чат заявки: Нет соединения с сокетом")
        return
      }

      // Убедимся, что беседа имеет ожидаемую структуру
      if (!conversation.id) {
        setError("Неверный объект беседы")
        return
      }

      // Присоединяемся к комнате и устанавливаем ее как активную
      joinConversationRoom(socket, conversation.id)
      setActiveConversation(conversation.id)

      // Добавляем в список бесед, если ее там еще нет
      setConversations((prev) => {
        const exists = prev.some((c) => c.id === conversation.id)

        if (!exists) {
          // Получаем информацию о другом пользователе из отдельно добавленного поля otherUser
          // или извлекаем его из user1/user2
          let otherUser = { 
            id: "unknown", 
            username: "Неизвестный пользователь",
            firstName: "",
            lastName: "", 
            role: ""
          }

          if (conversation.otherUser) {
            // Используем готовое поле otherUser, если оно есть
            otherUser = conversation.otherUser
          } else if (conversation.user1 && conversation.user2) {
            // Иначе находим другого пользователя среди user1 и user2
            if (conversation.user1.id === user.id) {
              otherUser = conversation.user2
            } else {
              otherUser = conversation.user1
            }
          }

          console.log("Using other user data:", otherUser)

          return [
            ...prev,
            {
              id: conversation.id,
              otherUser,
              updatedAt: new Date(conversation.updatedAt || Date.now()),
            },
          ]
        }

        return prev
      })
    } catch (error) {
      setError("Ошибка получения чата заявки: " + (error as Error).message)
    }
  }

  // Загрузка бесед пользователя
  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const conversationsData = await getConversations()
      console.log("Raw conversations data:", JSON.stringify(conversationsData))

      // Преобразуем данные в соответствии с нашим интерфейсом Conversation
      if (Array.isArray(conversationsData)) {
        const formattedConversations: Conversation[] = conversationsData.map((room: any) => {
          // Определяем, кто является другим пользователем
          const otherUser = room.otherUser || (room.user1?.id === user?.id ? room.user2 : room.user1)
          console.log("Processing conversation with otherUser:", JSON.stringify(otherUser))

          return {
            id: room.id,
            otherUser: {
              id: otherUser?.id || "unknown",
              username: otherUser?.username || "Неизвестный пользователь",
              firstName: otherUser?.firstName || "",
              lastName: otherUser?.lastName || "",
              role: otherUser?.role || ""
            },
            lastMessage: room.lastMessage,
            updatedAt: new Date(room.updatedAt),
          }
        })

        console.log("Formatted conversations:", JSON.stringify(formattedConversations))
        setConversations(formattedConversations)
      } else {
        setError("Данные бесед не являются массивом")
      }
      setIsLoading(false)
    } catch (error) {
      setError("Ошибка загрузки бесед: " + (error as Error).message)
      setIsLoading(false)
    }
  }

  // Присоединение к беседе
  const joinConversation = (conversationId: string) => {
    if (!socket) return

    // Покидаем текущую беседу, если она есть
    if (activeConversation) {
      socket.emit("leaveConversation", { conversationId: activeConversation })
    }

    // Присоединяемся к новой беседе
    joinConversationRoom(socket, conversationId)
    setActiveConversation(conversationId)

    // Сбрасываем статус печати
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Фокусируемся на поле ввода
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Отправка сообщения
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!socket || !activeConversation || !messageText.trim() || !user) return

    const messageContent = messageText.trim()

    // Отправляем сообщение на сервер
    sendMessageToServer(socket, activeConversation, messageContent)
    setMessageText("")

    // Очищаем статус печати
    setIsTyping(false)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    sendTypingStatus(socket, activeConversation, false)
  }

  // Обработка статуса печати
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value)

    if (!socket || !activeConversation) return

    if (!isTyping) {
      setIsTyping(true)
      sendTypingStatus(socket, activeConversation, true)
    }

    // Очищаем предыдущий таймаут
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Устанавливаем новый таймаут для очистки статуса печати через 2 секунды
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingStatus(socket, activeConversation, false)
    }, 2000)
  }

  // Получить другого пользователя активного разговора
  const getActiveConversationOtherUser = (): { 
    id: string; 
    username: string;
    firstName?: string;
    lastName?: string; 
    role?: string;
  } | null => {
    if (!activeConversation) return null
    return conversations.find((c) => c.id === activeConversation)?.otherUser || null
  }

  // Проверить, является ли сообщение от текущего пользователя
  const isOwnMessage = (message: ChatMessage): boolean => {
    return Boolean(user && message.senderId === user.id)
  }

  // Проверить, печатает ли кто-то в активном разговоре
  const isAnyoneTyping = () => {
    return Object.values(typingUsers).some((status) => status)
  }

  // Получить имя печатающего пользователя
  const getTypingUsernames = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => userId)

    return conversations
      .filter((c) => typingUserIds.includes(c.otherUser.id))
      .map((c) => c.otherUser.username)
      .join(", ")
  }

  // Отображение статуса сообщения
  const renderMessageStatus = (message: ChatMessage) => {
    if (!isOwnMessage(message)) return null

    switch (message.status) {
      case "sending":
        return <span className="text-xs text-muted-foreground ml-1">Отправка...</span>
      case "delivered":
        return <span className="text-xs text-muted-foreground ml-1">✓</span>
      case "error":
        return <span className="text-xs text-red-500 ml-1">Ошибка отправки</span>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p>Загрузка чата...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AuthErrorHandler error={error} />
      <JobSearchHeaderClient user={user} />
      <div className="container mx-auto py-2 px-2 h-[calc(100vh-80px)]">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="flex h-full relative">
              {/* Only hide on non-mobile as we'll animate it */}
              <ConversationList
                conversations={conversations}
                activeConversation={activeConversation}
                joinConversation={joinConversation}
                isMobile={isMobile}
                isConnected={isConnected}
                setSidebarOpen={setSidebarOpen}
                sidebarOpen={sidebarOpen}
              />

              <ChatArea
                activeConversation={activeConversation}
                messages={messages}
                messageText={messageText}
                isTyping={isTyping}
                typingUsers={typingUsers}
                inputRef={inputRef}
                isMobile={isMobile}
                setSidebarOpen={setSidebarOpen}
                getActiveConversationOtherUser={getActiveConversationOtherUser}
                handleTyping={handleTyping}
                sendMessage={sendMessage}
                isOwnMessage={isOwnMessage}
                renderMessageStatus={renderMessageStatus}
                getTypingUsernames={getTypingUsernames}
                isAnyoneTyping={isAnyoneTyping}
                sidebarOpen={sidebarOpen}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
