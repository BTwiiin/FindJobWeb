import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatRoom } from '../entities/chat-room.entity';
import { User } from '../entities/user.entity';
import { JobApplication } from '../entities/job-application.entity';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import { Message, MessageDocument } from './schemas/message.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private usersService: UsersService,
  ) {}

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    const [user1, user2] = await Promise.all([
      this.usersService.findOneById(user1Id),
      this.usersService.findOneById(user2Id),
    ]);

    if (!user1 || !user2) {
      throw new NotFoundException('One or both users not found');
    }

    if (user1Id === user2Id) {
      throw new ConflictException('Cannot create a conversation with yourself');
    }

    const [sortedUser1Id, sortedUser2Id] = [user1Id, user2Id].sort();

    let conversation = await this.conversationModel.findOne({
      user1Id: sortedUser1Id,
      user2Id: sortedUser2Id,
    });

    if (!conversation) {
      conversation = new this.conversationModel({
        user1Id: sortedUser1Id,
        user2Id: sortedUser2Id,
        lastMessageAt: new Date(),
      })
      await conversation.save();
    }

    return conversation;
  }

  async getConversationById(conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }
    return conversation;
  }


  async getUserConversations(userId: string): Promise<any[]> {
    console.log(`Getting conversations for user ID: ${userId}`);
    
    // Получаем беседы, где пользователь является участником
    const conversations = await this.conversationModel.find({
      $or: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    }).sort({ lastMessageAt: -1 });

    console.log(`Found ${conversations.length} conversations for user ${userId}`);
    
    // Добавляем информацию о собеседниках и последних сообщениях
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Определяем ID собеседника
        const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
        console.log(`Other user ID for conversation ${conv._id}: ${otherUserId}`);
        
        try {
          // Получаем информацию о собеседнике
          const otherUser = await this.usersService.findOneById(otherUserId);
          console.log(`Other user details:`, {
            id: otherUser.id,
            username: otherUser.username,
            firstName: otherUser.firstName,
            lastName: otherUser.lastName,
            role: otherUser.role
          });
          
          // Получаем последнее сообщение
          const lastMessage = await this.messageModel.findOne({ 
            conversationId: conv._id 
          }).sort({ createdAt: -1 });
  
          // Если есть последнее сообщение, получаем информацию об отправителе
          let senderFirstName, senderLastName, senderRole;
          if (lastMessage) {
            try {
              const sender = await this.usersService.findOneById(lastMessage.senderId);
              senderFirstName = sender.firstName;
              senderLastName = sender.lastName;
              senderRole = sender.role;
            } catch (error) {
              console.error(`Error fetching sender details for message ${lastMessage._id}:`, error);
            }
          }
  
          return {
            id: conv._id,
            otherUser: {
              id: otherUser.id,
              username: otherUser.username,
              firstName: otherUser.firstName,
              lastName: otherUser.lastName,
              role: otherUser.role
            },
            lastMessage: lastMessage ? {
              id: lastMessage._id,
              text: lastMessage.text,
              senderId: lastMessage.senderId,
              senderUsername: (lastMessage.senderId === userId) ? 'Вы' : otherUser.username,
              senderFirstName,
              senderLastName,
              senderRole,
              timestamp: lastMessage.createdAt || new Date(),
            } : null,
            updatedAt: conv.lastMessageAt,
          };
        } catch (error) {
          console.error(`Error processing conversation ${conv._id}:`, error);
          // Return a fallback conversation object if we can't get the user details
          return {
            id: conv._id,
            otherUser: {
              id: otherUserId,
              username: "Неизвестный пользователь (ошибка)",
              firstName: "",
              lastName: "",
              role: ""
            },
            lastMessage: null,
            updatedAt: conv.lastMessageAt,
          };
        }
      })
    );

    return conversationsWithDetails;
  }

  // Сохранить сообщение
  async saveMessage(data: { text: string; conversationId: string; senderId: string }): Promise<Message> {
    const { text, conversationId, senderId } = data;

    // Проверяем существование беседы
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    // Проверяем, что отправитель является участником беседы
    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      throw new NotFoundException('User is not part of this conversation');
    }

    // Создаем и сохраняем сообщение
    const newMessage = new this.messageModel({
      conversationId,
      senderId,
      text,
      read: false,
    });

    // Обновляем время последнего сообщения в беседе
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessageAt: new Date(),
    });

    return newMessage.save();
  }

  // Получить сообщения для беседы
  async getConversationMessages(conversationId: string, limit = 50): Promise<Message[]> {
    // Проверяем существование беседы
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    // Получаем сообщения
    return this.messageModel.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(limit);
  }

  // Отметить сообщения как прочитанные
  async markMessagesAsRead(conversationId: string, userId: string): Promise<number> {
    const result = await this.messageModel.updateMany(
      { 
        conversationId,
        senderId: { $ne: userId },
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    return result.modifiedCount;
  }

  // Удалить беседу для пользователя (скрыть, а не физически удалить)
  async deleteConversationForUser(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    // Определяем, какое поле удаления обновить
    const updateField = conversation.user1Id === userId ? 
      { user1Deleted: true } : 
      { user2Deleted: true };

    await this.conversationModel.findByIdAndUpdate(conversationId, updateField);
  }
  
} 