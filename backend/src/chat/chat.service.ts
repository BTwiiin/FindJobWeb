import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { User } from '../entities/user.entity';
import { JobApplication } from '../entities/job-application.entity';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
  ) {}

  // Room operations
  async createRoom(name: string, description: string, isPrivate: boolean, creatorId: string): Promise<ChatRoom> {
    // Find the users to set as user1 and user2
    const creator = await this.userRepository.findOne({ where: { id: creatorId } });
    if (!creator) {
      throw new NotFoundException(`User with ID ${creatorId} not found`);
    }
    
    // For system-created rooms where we need a second user, find an admin or any user
    let secondUser = creator;
    if (creatorId) {
      const users = await this.userRepository.find({ take: 2 });
      secondUser = users.find(u => u.id !== creatorId) || creator;
    }

    const newRoom = this.chatRoomRepository.create({
      name,
      description,
      isDirectMessage: !isPrivate, // Invert since our model uses isDirectMessage
      user1: creator,
      user1Id: creator.id,
      user2: secondUser,
      user2Id: secondUser.id
    });

    return this.chatRoomRepository.save(newRoom);
  }

  async getRooms(): Promise<ChatRoom[]> {
    return this.chatRoomRepository.find({
      relations: ['creator'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getRoomById(id: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  // Get or create a direct message room between two users
  async getOrCreateDirectMessageRoom(
    user1Id: string, 
    user2Id: string, 
    name?: string,
    description?: string
  ): Promise<ChatRoom> {
    // Check if users exist
    const user1 = await this.userRepository.findOne({ where: { id: user1Id } });
    const user2 = await this.userRepository.findOne({ where: { id: user2Id } });
    
    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }
    
    if (user1Id === user2Id) {
      throw new ConflictException('Cannot create a direct message room with yourself');
    }
    
    // Sort user IDs to ensure consistent room creation regardless of who initiates
    const [sortedUser1Id, sortedUser2Id] = [user1Id, user2Id].sort();
    
    // Try to find existing room first
    let room = await this.chatRoomRepository.findOne({
      where: [
        { user1Id: sortedUser1Id, user2Id: sortedUser2Id },
        { user1Id: sortedUser2Id, user2Id: sortedUser1Id }
      ],
      relations: ['user1', 'user2']
    });
    
    // If room doesn't exist, create it
    if (!room) {
      const roomName = name || `Чат между ${user1.username} и ${user2.username}`;
      const roomDescription = description || 'Личное сообщение';
      
      room = this.chatRoomRepository.create({
        name: roomName,
        description: roomDescription,
        user1Id: sortedUser1Id,
        user2Id: sortedUser2Id,
        isDirectMessage: true
      });
      
      room = await this.chatRoomRepository.save(room);
    }
    
    return room;
  }

  // Get all direct message rooms for a user
  async getDirectMessageRoomsForUser(userId: string): Promise<ChatRoom[]> {
    console.log(`Finding direct message rooms for user ${userId}`);
    const rooms = await this.chatRoomRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      relations: ['user1', 'user2'],
      order: {
        updatedAt: 'DESC',
      },
    });
    
    console.log(`Found ${rooms.length} rooms for user ${userId}`);
    
    // Log room details for debugging
    rooms.forEach(room => {
      console.log(`Room ${room.id}:`);
      console.log(`- Name: ${room.name}`);
      console.log(`- User1: ${room.user1?.username || 'missing'} (${room.user1Id})`);
      console.log(`- User2: ${room.user2?.username || 'missing'} (${room.user2Id})`);
      console.log(`- Relations loaded: ${!!room.user1 && !!room.user2}`);
    });
    
    // If relations are missing, manually load them
    if (rooms.length > 0 && (!rooms[0].user1 || !rooms[0].user2)) {
      console.log('Relations missing, manually loading users');
      for (const room of rooms) {
        if (!room.user1) {
          const user1 = await this.userRepository.findOne({ where: { id: room.user1Id } });
          if (user1) {
            room.user1 = user1;
          }
        }
        if (!room.user2) {
          const user2 = await this.userRepository.findOne({ where: { id: room.user2Id } });
          if (user2) {
            room.user2 = user2;
          }
        }
      }
    }
    
    return rooms;
  }

  // Message operations
  async saveMessage(messageData: { text: string; roomId: string; senderId: string }): Promise<ChatMessage> {
    // First, check if the room exists
    const room = await this.chatRoomRepository.findOne({ 
      where: { id: messageData.roomId },
      relations: ['user1', 'user2'] 
    });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${messageData.roomId} not found`);
    }
    
    // Verify the user is part of this conversation
    if (room.user1Id !== messageData.senderId && room.user2Id !== messageData.senderId) {
      throw new NotFoundException(`User is not part of this conversation`);
    }

    const newMessage = this.chatMessageRepository.create({
      text: messageData.text,
      roomId: messageData.roomId,
      userId: messageData.senderId,
    });

    // Update the room's updatedAt timestamp to sort by recent activity
    await this.chatRoomRepository.update(messageData.roomId, { updatedAt: new Date() });

    return this.chatMessageRepository.save(newMessage);
  }

  async getMessagesByRoom(roomId: string, limit = 50): Promise<ChatMessage[]> {
    // Check if the room exists
    const room = await this.chatRoomRepository.findOne({ 
      where: { id: roomId },
      relations: ['user1', 'user2']
    });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return this.chatMessageRepository.find({
      where: { roomId },
      relations: ['user'],
      order: {
        createdAt: 'ASC', // Return in chronological order
      },
      take: limit,
    });
  }
  
  // Get other user in direct message conversation
  async getOtherUserInConversation(roomId: string, userId: string): Promise<User> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['user1', 'user2']
    });
    
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }
    
    if (room.user1Id === userId) {
      return room.user2;
    } else if (room.user2Id === userId) {
      return room.user1;
    } else {
      throw new NotFoundException(`User is not part of this conversation`);
    }
  }
} 