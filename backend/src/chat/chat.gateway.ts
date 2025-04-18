import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

interface DirectMessage {
  text: string;
  roomId: string;
}

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');
  
  // Track active users with their socket IDs
  private users: Map<string, { socketId: string, userId: string, username: string }> = new Map();
  
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {}
  
  afterInit(server: Server) {
    this.logger.log('Chat Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
    // Authenticate user from token
    let token = client.handshake.auth.token;
    this.logger.log(`Auth token: ${token ? token.substring(0, 15) + '...' : 'undefined'}`);
    
    // Try to extract from authorization header if not in auth
    if (!token) {
      const authHeader = client.handshake.headers.authorization;
      this.logger.log(`Auth header: ${authHeader || 'undefined'}`);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        this.logger.log(`Extracted token from header: ${token.substring(0, 15)}...`);
      }
    }
    
    if (!token) {
      this.logger.warn(`Client ${client.id} has no token`);
      client.disconnect(true);
      return;
    }
    
    try {
      this.logger.log(`Attempting to verify token for client ${client.id}`);
      
      // Get the secret from environment variables
      const secret = process.env.JWT_SECRET;
      this.logger.log(`Using JWT_SECRET: ${secret ? 'Secret found' : 'No secret found'}`);
      
      const payload = this.jwtService.verify(token, { secret });
      
      this.logger.log(`Token payload: ${JSON.stringify(payload)}`);
      
      // Check if payload has the expected format
      if (!payload || !payload.id) {
        this.logger.warn(`Invalid token payload for client ${client.id}: ${JSON.stringify(payload)}`);
        client.disconnect(true);
        return;
      }
      
      // Store user information
      client.data.user = payload;
      this.users.set(client.id, {
        socketId: client.id,
        userId: payload.id,  // Using 'id' instead of 'sub'
        username: payload.username
      });
      
      this.logger.log(`Client ${client.id} authenticated as ${payload.username} (${payload.id})`);
      
      // Mark user as online
      this.server.emit('userStatus', { 
        userId: payload.id,  // Using 'id' instead of 'sub'
        status: 'online' 
      });
      
    } catch (error) {
      this.logger.error(`Authentication error for client ${client.id}:`, error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Get user details
    const user = this.users.get(client.id);
    if (user) {
      // Remove user from tracking
      this.users.delete(client.id);
      
      // Mark user as offline
      this.server.emit('userStatus', {
        userId: user.userId,
        status: 'offline'
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { roomId } = payload;
    const userData = client.data.user;
    
    if (!userData) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }
    
    try {
      // Check if user is part of this conversation
      await this.chatService.getOtherUserInConversation(roomId, userData.id);
      
      // Join the room
      client.join(roomId);
      this.logger.log(`User ${userData.username} (${userData.id}) joined room ${roomId}`);
      
      // Send recent messages
      const messages = await this.chatService.getMessagesByRoom(roomId, 50);
      client.emit('recentMessages', {
        roomId,
        messages: messages.map(msg => ({
          id: msg.id,
          text: msg.text,
          userId: msg.userId,
          timestamp: msg.createdAt,
        })),
      });
      
    } catch (error) {
      this.logger.error(`Error joining room ${roomId}:`, error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() payload: { roomId: string },
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId } = payload;
    client.leave(roomId);
    this.logger.log(`Client ${client.id} left room ${roomId}`);
  }

  @SubscribeMessage('directMessage')
  async handleDirectMessage(
    @MessageBody() payload: DirectMessage,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { text, roomId } = payload;
    const userData = client.data.user;
    
    if (!userData) {
      client.emit('error', { message: 'Authentication required' });
      return;
    }
    
    try {
      // Save message to database
      const savedMessage = await this.chatService.saveMessage({ text, roomId, senderId: userData.id });
      
      // Get recipient user to include their details in the response
      const otherUser = await this.chatService.getOtherUserInConversation(roomId, userData.id);
      
      // Broadcast to everyone in the room
      this.server.to(roomId).emit('newMessage', {
        id: savedMessage.id,
        text,
        senderId: userData.id,
        senderUsername: userData.username,
        recipientId: otherUser.id,
        roomId,
        timestamp: savedMessage.createdAt,
      });
      
    } catch (error) {
      this.logger.error(`Error sending message:`, error);
      client.emit('error', { 
        message: 'Failed to send message', 
        details: error.message 
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ): void {
    const { roomId, isTyping } = payload;
    const userData = client.data.user;
    
    if (!userData) return;
    
    // Broadcast typing status to the room
    client.to(roomId).emit('userTyping', {
      userId: userData.id,
      username: userData.username,
      roomId,
      isTyping
    });
  }
} 