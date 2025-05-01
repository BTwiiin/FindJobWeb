import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ru } from "date-fns/locale"
import { type Conversation } from "@/app/chat/types"

interface ConversationListProps {
  conversations: Conversation[]
  activeConversation: string | null
  joinConversation: (id: string) => void
  isMobile: boolean
  isConnected: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
}

export default function ConversationList({
  conversations,
  activeConversation,
  joinConversation,
  isMobile,
  isConnected,
  setSidebarOpen,
  sidebarOpen
}: ConversationListProps) {
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
      className={`transform transition-all duration-300 ease-in-out md:translate-x-0 absolute md:relative z-10 w-full md:w-1/3 lg:w-1/4 h-full bg-background border-r flex flex-col ${
        isMobile && !sidebarOpen ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Сообщения</h2>
          <p className="text-sm text-muted-foreground">{isConnected ? "Онлайн" : "Подключение..."}</p>
        </div>
      </div>
      <div className="overflow-auto flex-1">
        <div className="space-y-1 p-2">
          {conversations.length > 0 ? (
            conversations
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    activeConversation === conversation.id
                      ? "bg-primary/10 border-l-4 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    joinConversation(conversation.id)
                    if (isMobile) {
                      setSidebarOpen(false)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {conversation.otherUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">
                        {(() => {
                          const { firstName, lastName, username, role } = conversation.otherUser;
                          
                          // Display name
                          const displayName = firstName && lastName 
                            ? `${firstName} ${lastName}`
                            : username;
                            
                          // Check role for badge
                          const roleText = role ? 
                            (role.toUpperCase() === "EMPLOYER" ? "Компания" : 
                             role.toUpperCase() === "EMPLOYEE" ? "Соискатель" : "") 
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
                      </div>
                      {conversation.lastMessage && (
                        <div className="text-sm truncate text-muted-foreground">
                          {conversation.lastMessage.text}
                        </div>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(
                          conversation.lastMessage.timestamp ||
                            conversation.lastMessage.createdAt ||
                            new Date()
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>У вас пока нет сообщений</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 