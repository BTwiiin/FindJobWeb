import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
  allowEIO3: true
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(ChatGateway.name);

  // Храним соединения пользователей
  private userSocketMap: Map<string, Socket[]> = new Map();

  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client attempting to connect: ${client.id}`);
    try {
      // Аутентификация через токен (реализацию WsJwtGuard нужно добавить)
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
      
      this.logger.log(`Token received: ${token ? 'Yes' : 'No'}`);
      
      if (!token) {
        this.logger.error('No token provided, disconnecting client');
        client.disconnect();
        return;
      }
      
      const payload = await this.validateToken(token);
      if (!payload) {
        this.logger.error('Invalid token, disconnecting client');
        client.disconnect();
        return;
      }

      this.logger.log(`Payload validated: ${JSON.stringify(payload)}`);
      
      const userId = payload.id;
      client.data.userId = userId;

      this.logger.log(`User ID: ${userId}`);
      
      // Сохраняем сокет в карте пользователей
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, []);
      }
      this.userSocketMap.get(userId)?.push(client);
      
      // Информируем других пользователей о подключении
      this.broadcastUserStatus(userId, 'online');
      
      this.logger.log(`User ${userId} connected successfully`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`, error.stack);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const userId = client.data.userId;
    if (!userId) return;
    
    // Удаляем сокет из карты
    const userSockets = this.userSocketMap.get(userId) || [];
    const updatedSockets = userSockets.filter(socket => socket.id !== client.id);
    
    if (updatedSockets.length === 0) {
      // Если у пользователя больше нет активных соединений
      this.userSocketMap.delete(userId);
      this.broadcastUserStatus(userId, 'offline');
    } else {
      this.userSocketMap.set(userId, updatedSockets);
    }
    
    this.logger.log(`User ${userId} disconnected`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinConversation')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    const userId = client.data.userId;
    const { conversationId } = data;
    
    try {
      // Получаем сообщения беседы
      const messages = await this.chatService.getConversationMessages(conversationId);
      
      // Подписываем клиента на комнату беседы
      client.join(conversationId);
      
      // Обогащаем сообщения информацией о пользователях
      const enhancedMessages = await Promise.all(messages.map(async (message) => {
        try {
          const sender = await this.usersService.findOneById(message.senderId);
          return {
            id: message._id,
            text: message.text,
            conversationId: message.conversationId,
            senderId: message.senderId,
            createdAt: message.createdAt,
            read: message.read,
            senderUsername: sender.username,
            senderFirstName: sender.firstName,
            senderLastName: sender.lastName,
            senderRole: sender.role
          };
        } catch (error) {
          this.logger.error(`Error enhancing message ${message._id}: ${error.message}`);
          return message;
        }
      }));
      
      // Отправляем историю сообщений
      client.emit('recentMessages', {
        conversationId,
        messages: enhancedMessages
      });
      
      // Отмечаем сообщения как прочитанные
      await this.chatService.markMessagesAsRead(conversationId, userId);
    } catch (error) {
      console.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leaveConversation')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string }
  ) {
    client.leave(data.conversationId);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; text: string }
  ) {
    const userId = client.data.userId;
    const { conversationId, text } = data;
    
    try {
      // Сохраняем сообщение
      const message = await this.chatService.saveMessage({
        conversationId,
        senderId: userId,
        text
      });
      
      // Получаем информацию о пользователе
      const user = await this.usersService.findOneById(userId);
      
      // Формируем данные для отправки
      const messageData = {
        id: message._id,
        conversationId,
        text,
        senderId: userId,
        senderUsername: user.username,
        senderFirstName: user.firstName,
        senderLastName: user.lastName,
        senderRole: user.role,
        timestamp: message.createdAt
      };
      
      // Отправляем сообщение всем в комнате
      this.server.to(conversationId).emit('newMessage', messageData);
      
      // Если другой пользователь не в комнате, отправляем ему уведомление
      const conversation = await this.chatService.getConversationById(conversationId);
      const otherUserId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      
      // Проверяем, подключен ли другой пользователь к комнате
      const otherUserSockets = this.userSocketMap.get(otherUserId) || [];
      const isOtherUserInRoom = otherUserSockets.some(socket => 
        Array.from(socket.rooms).includes(conversationId)
      );
      
      if (!isOtherUserInRoom) {
        this.notifyUser(otherUserId, 'newMessage', messageData);
      }
    } catch (error) {
      client.emit('error', { 
        message: 'Failed to send message',
        error: error.message 
      });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean }
  ) {
    const userId = client.data.userId;
    const { conversationId, isTyping } = data;
    
    // Получаем информацию о пользователе из кэша или базы данных
    // и отправляем событие о печати
    this.server.to(conversationId).emit('userTyping', {
      userId,
      conversationId,
      isTyping
    });
  }

  // Вспомогательные методы
  
  private async validateToken(token: string) {
    try {
      // Use JwtService to verify token
      this.logger.log('Attempting to verify token');
      const payload = this.jwtService.verify(token);
      this.logger.log('Token verified successfully');
      return payload;
    } catch (error) {
      this.logger.error(`Token validation error: ${error.message}`, error.stack);
      return null;
    }
  }
  
  private broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    this.server.emit('userStatus', { userId, status });
  }
  
  private notifyUser(userId: string, event: string, data: any) {
    const userSockets = this.userSocketMap.get(userId) || [];
    userSockets.forEach(socket => {
      socket.emit(event, data);
    });
  }
}