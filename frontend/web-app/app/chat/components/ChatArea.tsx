import React, { useRef, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { type ChatMessage } from "../types"

interface ChatAreaProps {
  activeConversation: string | null
  messages: Record<string, ChatMessage[]>
  messageText: string
  isTyping: boolean
  typingUsers: Record<string, boolean>
  inputRef: React.RefObject<HTMLInputElement>
  isMobile: boolean
  setSidebarOpen: (open: boolean) => void
  getActiveConversationOtherUser: () => { 
    id: string; 
    username: string; 
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void
  sendMessage: (e: React.FormEvent) => void
  isOwnMessage: (message: ChatMessage) => boolean
  renderMessageStatus: (message: ChatMessage) => React.ReactNode
  getTypingUsernames: () => string
  isAnyoneTyping: () => boolean
  sidebarOpen: boolean
}

export default function ChatArea({
  activeConversation,
  messages,
  messageText,
  isTyping,
  typingUsers,
  inputRef,
  isMobile,
  setSidebarOpen,
  getActiveConversationOtherUser,
  handleTyping,
  sendMessage,
  isOwnMessage,
  renderMessageStatus,
  getTypingUsernames,
  isAnyoneTyping,
  sidebarOpen
}: ChatAreaProps) {
  const messageListRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageListRef.current && activeConversation) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, activeConversation]);
  
  // Форматирование временной метки
  const formatTimestamp = (timestamp: string | Date | undefined) => {
    try {
      if (!timestamp) {
        return "Неизвестное время"
      }

      const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

      if (isNaN(date.getTime())) {
        return "Некорректная дата"
      }

      const now = new Date()

      if (date > now) {
        return `через ${formatDistanceToNow(date, { addSuffix: false, locale: ru })}`
      }

      return formatDistanceToNow(date, { addSuffix: true, locale: ru })
    } catch (error) {
      console.error("Ошибка форматирования временной метки:", error)
      return "Некорректная дата"
    }
  }

  return (
    <div 
      className={`flex-1 h-full flex flex-col transform transition-all duration-300 ease-in-out ${
        isMobile && sidebarOpen ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      {activeConversation ? (
        <>
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-muted rounded-full">
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-medium">
                {(() => {
                  const otherUser = getActiveConversationOtherUser();
                  if (!otherUser) return "Loading...";
                  
                  // Display name
                  const displayName = otherUser.firstName && otherUser.lastName 
                    ? `${otherUser.firstName} ${otherUser.lastName}`
                    : otherUser.username;
                    
                  // Check role for badge
                  const roleText = otherUser.role ? 
                    (otherUser.role.toUpperCase() === "EMPLOYER" ? "Компания" : 
                     otherUser.role.toUpperCase() === "EMPLOYEE" ? "Соискатель" : "") 
                    : "";
                    
                  return (
                    <>
                      {displayName}
                      {roleText && 
                        <span className={`ml-1 text-xs px-1 rounded ${
                          roleText === "Компания" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}>
                          {roleText}
                        </span>
                      }
                    </>
                  );
                })()}
              </h3>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary">
                {getActiveConversationOtherUser()?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Сообщения - отдельная область прокрутки */}
          <div ref={messageListRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages[activeConversation]?.length > 0 ? (
              messages[activeConversation].map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage(message) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      isOwnMessage(message)
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted rounded-tl-none"
                    }`}
                  >
                    <div className="break-words">{message.text}</div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className="text-xs opacity-70">
                        {formatTimestamp(message.createdAt || message.timestamp || new Date())}
                      </div>
                      {renderMessageStatus(message)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div key="no-messages" className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Нет сообщений. Начните общение!</p>
              </div>
            )}
          </div>

          {/* Индикатор печати */}
          {isAnyoneTyping() && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              {getTypingUsernames()} печатает...
            </div>
          )}

          {/* Поле ввода сообщения */}
          <div className="p-3 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={messageText}
                onChange={handleTyping}
                placeholder="Введите сообщение..."
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!messageText.trim()} 
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="text-xl font-medium mb-2">Выберите беседу</h3>
            <p className="text-muted-foreground">Выберите чат из списка, чтобы начать общение</p>
          </div>
        </div>
      )}
    </div>
  )
} 