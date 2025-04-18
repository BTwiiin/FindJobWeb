"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { getCurrentUser } from "@/app/actions/authActions";
import { getConversations, startConversation, getOrCreateApplicationChat, getWebSocketToken } from "@/app/actions/chatActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserSearch } from "./components/user-search";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  roomId: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    username: string;
  };
  lastMessage?: ChatMessage;
  updatedAt: Date;
}

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [showUserSearch, setShowUserSearch] = useState(false);
  const messageListRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Fetch conversations when user changes
  useEffect(() => {
    if (user && socket && isConnected) {
      console.log("User and socket available, fetching conversations");
      fetchConversations();
    }
  }, [user, socket, isConnected]);

  // Initialize socket connection and fetch user data
  useEffect(() => {
    const fetchUserAndConnect = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/auth/login");
          return;
        }
        setUser(userData);

        // Get WebSocket-specific token
        let token;
        try {
          const wsTokenResponse = await getWebSocketToken();
          token = wsTokenResponse.token;
          console.log("Obtained WebSocket token:", token.substring(0, 10) + "...");
        } catch (tokenError) {
          console.error("Failed to get WebSocket token, falling back to accessToken");
          token = userData.accessToken;
        }

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        console.log("Connecting with token:", token.substring(0, 10) + "...");

        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
          auth: { token },
          extraHeaders: {
            "Authorization": `Bearer ${token}`
          },
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketInstance.on("connect", () => {
          console.log("Connected to socket server");
          setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
          console.log("Disconnected from socket server");
          setIsConnected(false);
        });

        socketInstance.on("error", (error) => {
          console.error("Socket error:", error);
        });

        // Listen for new messages
        socketInstance.on("newMessage", (message: ChatMessage) => {
          console.log("New message received:", message);
          setMessages((prev) => {
            const conversationMessages = [...(prev[message.roomId] || [])];
            conversationMessages.push(message);
            return {
              ...prev,
              [message.roomId]: conversationMessages,
            };
          });
          
          // Update last message for conversation list
          setConversations(prev => {
            return prev.map(conv => {
              if (conv.id === message.roomId) {
                return {
                  ...conv,
                  lastMessage: message,
                  updatedAt: new Date(message.timestamp)
                };
              }
              return conv;
            });
          });
          
          // Auto-scroll to bottom
          setTimeout(() => {
            if (messageListRef.current) {
              messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }
          }, 100);
        });

        // Listen for recent messages when joining a conversation
        socketInstance.on("recentMessages", (data: { roomId: string; messages: ChatMessage[] }) => {
          console.log("Recent messages:", data);
          setMessages((prev) => ({
            ...prev,
            [data.roomId]: data.messages,
          }));
          
          // Auto-scroll to bottom
          setTimeout(() => {
            if (messageListRef.current) {
              messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
            }
          }, 100);
        });

        // Listen for user typing status
        socketInstance.on("userTyping", (data: { userId: string; username: string; roomId: string; isTyping: boolean }) => {
          if (data.userId !== userData.id) {
            setTypingUsers(prev => ({
              ...prev,
              [data.userId]: data.isTyping
            }));
          }
        });

        // Listen for user status changes (online/offline)
        socketInstance.on("userStatus", (data: { userId: string; status: 'online' | 'offline' }) => {
          console.log("User status changed:", data);
          // You could update user status in your conversations list here
        });

        setSocket(socketInstance);

        // Check if we have an application ID in the URL
        const params = new URLSearchParams(window.location.search);
        const applicationId = params.get('application');
        
        if (applicationId) {
          handleApplicationChat(applicationId);
        } else {
          // Regular chat setup - fetch user conversations
          fetchConversations();
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    };

    fetchUserAndConnect();

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Handle application-specific chat
  const handleApplicationChat = async (applicationId: string) => {
    try {
      console.log(`Handling application chat for application ID: ${applicationId}`);
      const conversation = await getOrCreateApplicationChat(applicationId);
      console.log(`Application conversation response:`, conversation);
      
      if (!conversation) {
        console.error("No conversation returned from getOrCreateApplicationChat");
        return;
      }
      
      if (!user) {
        console.error("Cannot handle application chat: No user available");
        return;
      }
      
      if (!socket) {
        console.error("Cannot handle application chat: No socket connection");
        return;
      }

      // Make sure the conversation has the expected structure
      if (!conversation.id) {
        console.error("Invalid conversation object:", conversation);
        return;
      }
      
      // Join the room and set it as active
      console.log(`Joining room ${conversation.id}`);
      socket.emit('joinRoom', { roomId: conversation.id });
      setActiveConversation(conversation.id);
      
      // Add to conversations list if not already there
      setConversations(prev => {
        const exists = prev.some(c => c.id === conversation.id);
        console.log(`Conversation ${conversation.id} exists in list: ${exists}`);
        
        if (!exists) {
          // Extract the other user info, handling potential missing properties
          let otherUser = { id: 'unknown', username: 'Unknown User' };
          
          if (conversation.user1 && conversation.user2) {
            if (conversation.user1.id === user.id) {
              otherUser = {
                id: conversation.user2.id || 'unknown',
                username: conversation.user2.username || 'Unknown User'
              };
            } else {
              otherUser = {
                id: conversation.user1.id || 'unknown',
                username: conversation.user1.username || 'Unknown User'
              };
            }
          }
          
          console.log(`Adding conversation with ${otherUser.username} to the list`);
          return [...prev, {
            id: conversation.id,
            otherUser,
            updatedAt: new Date(conversation.updatedAt || Date.now())
          }];
        }
        
        return prev;
      });
    } catch (error) {
      console.error("Error getting application chat:", error);
    }
  };

  // Fetch user conversations
  const fetchConversations = async () => {
    try {
      const conversationsData = await getConversations();
      console.log('Raw conversations data:', conversationsData);
      
      // Transform data to match our Conversation interface
      if (Array.isArray(conversationsData)) {
        const formattedConversations: Conversation[] = conversationsData.map((room: any) => {
          console.log('Processing room:', room);
          
          // Log the user data to see what's available
          console.log('Current user:', user);
          console.log('Room user1:', room.user1);
          console.log('Room user2:', room.user2);
          
          const otherUser = room.user1?.id === user?.id ? room.user2 : room.user1;
          console.log('Selected other user:', otherUser);
          
          return {
            id: room.id,
            otherUser: {
              id: otherUser?.id || 'unknown',
              username: otherUser?.username || 'Unknown User'
            },
            updatedAt: new Date(room.updatedAt)
          };
        });
        
        console.log('Formatted conversations:', formattedConversations);
        setConversations(formattedConversations);
      } else {
        console.error('Conversations data is not an array:', conversationsData);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  // Start a new conversation with a user
  const handleStartConversation = async (targetUserId: string) => {
    try {
      if (!socket) return;

      const conversation = await startConversation(targetUserId);
      
      // Check if conversation already exists in our list
      const existingConversation = conversations.find(c => c.id === conversation.id);
      if (!existingConversation) {
        const otherUser = conversation.user1.id === user?.id ? conversation.user2 : conversation.user1;
        const newConversation: Conversation = {
          id: conversation.id,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username
          },
          updatedAt: new Date(conversation.updatedAt)
        };
        
        setConversations(prev => [...prev, newConversation]);
      }
      
      // Join the room and set it as active
      socket.emit('joinRoom', { roomId: conversation.id });
      setActiveConversation(conversation.id);
      setShowUserSearch(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  // Join a conversation
  const joinConversation = (conversationId: string) => {
    if (!socket) return;

    // Leave current conversation if any
    if (activeConversation) {
      socket.emit("leaveRoom", { roomId: activeConversation });
    }

    // Join the new conversation
    socket.emit("joinRoom", { roomId: conversationId });
    setActiveConversation(conversationId);
    
    // Reset typing status
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  // Send a message
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !activeConversation || !messageText.trim() || !user) return;

    socket.emit("directMessage", {
      roomId: activeConversation,
      text: messageText.trim()
    });

    setMessageText("");
    
    // Clear typing status
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit("typing", { roomId: activeConversation, isTyping: false });
  };

  // Handle typing status
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    
    if (!socket || !activeConversation) return;
    
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { roomId: activeConversation, isTyping: true });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to clear typing status after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", { roomId: activeConversation, isTyping: false });
    }, 2000);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string | Date) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Check if a message is from the current user
  const isOwnMessage = (message: ChatMessage) => {
    return user && message.senderId === user.id;
  };

  // Get active conversation other user
  const getActiveConversationOtherUser = () => {
    if (!activeConversation) return null;
    return conversations.find(c => c.id === activeConversation)?.otherUser;
  };

  // Check if someone is typing in the active conversation
  const isAnyoneTyping = () => {
    return Object.values(typingUsers).some(status => status);
  };

  // Get the name of the person typing
  const getTypingUsernames = () => {
    const typingUserIds = Object.entries(typingUsers)
      .filter(([_, isTyping]) => isTyping)
      .map(([userId]) => userId);
    
    return conversations
      .filter(c => typingUserIds.includes(c.otherUser.id))
      .map(c => c.otherUser.username)
      .join(", ");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="min-h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Сообщения</CardTitle>
              <CardDescription>
                {isConnected ? "Подключено к серверу" : "Подключение..."}
              </CardDescription>
            </div>
            <Button onClick={() => setShowUserSearch(true)}>Новый чат</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 h-[500px]">
            {/* Conversations list */}
            <div className="border-r h-full overflow-auto p-4">
              <div className="mb-4">
                <Input 
                  type="search" 
                  placeholder="Поиск..." 
                  className="w-full"
                />
              </div>
              
              {showUserSearch && (
                <div className="mb-4">
                  <UserSearch onSelectUser={handleStartConversation} currentUserId={user?.id || ""} />
                </div>
              )}
              
              <div className="space-y-2">
                {conversations.length > 0 ? (
                  conversations
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-3 rounded-md cursor-pointer ${
                          activeConversation === conversation.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => joinConversation(conversation.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {conversation.otherUser.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{conversation.otherUser.username}</div>
                            {conversation.lastMessage && (
                              <div className="text-sm truncate">
                                {conversation.lastMessage.text}
                              </div>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <div className="text-xs opacity-70">
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>У вас пока нет сообщений</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowUserSearch(true)}
                      className="mt-2"
                    >
                      Начать новый чат
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="col-span-1 md:col-span-2 h-full flex flex-col">
              {activeConversation ? (
                <>
                  <div className="border-b p-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getActiveConversationOtherUser()?.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {getActiveConversationOtherUser()?.username}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div 
                    ref={messageListRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages[activeConversation]?.length > 0 ? (
                      messages[activeConversation].map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwnMessage(message) ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              isOwnMessage(message)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <div>{message.text}</div>
                            <div className="text-xs mt-1 opacity-70">
                              {formatTimestamp(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Нет сообщений. Начните общение!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Typing indicator */}
                  {isAnyoneTyping() && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      {getTypingUsernames()} печатает...
                    </div>
                  )}
                  
                  {/* Message input */}
                  <div className="p-4 border-t">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={handleTyping}
                        placeholder="Введите сообщение..."
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!messageText.trim()}>
                        Отправить
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-4">Выберите чат, чтобы начать общение</p>
                    <Button onClick={() => setShowUserSearch(true)}>
                      Начать новый чат
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 