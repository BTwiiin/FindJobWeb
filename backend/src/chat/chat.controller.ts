import { Controller, Get, Post, Body, Param, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { ApplyingService } from '../applying/applying.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
    private readonly applyingService: ApplyingService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  async startConversation(@Body() dto: StartConversationDto, @Request() req) {
    const { targetUserId } = dto;
    return this.chatService.getOrCreateConversation(req.user.id, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getMyConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:conversationId')
  async getConversation(@Param('conversationId') conversationId: string, @Request() req) {
    // Получаем сообщения
    const messages = await this.chatService.getConversationMessages(conversationId);
    
    // Получаем все беседы пользователя
    const conversations = await this.chatService.getUserConversations(req.user.id);
    
    // Находим нужную беседу
    const conversation = conversations.find(conv => conv.id.toString() === conversationId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation not found or you are not a participant');
    }
    
    // Отмечаем сообщения как прочитанные
    await this.chatService.markMessagesAsRead(conversationId, req.user.id);
    
    return {
      id: conversationId,
      otherUser: conversation.otherUser,
      messages
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages')
  async createMessage(@Body() dto: SendMessageDto, @Request() req) {
    return this.chatService.saveMessage({
      text: dto.text,
      conversationId: dto.conversationId,
      senderId: req.user.id
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('application-conversation')
  async createApplicationConversation(
    @Body() data: { applicationId: string; initialMessage?: string },
    @Request() request
  ) {
    // Get application data using the ApplyingService
    const application = await this.getApplicationData(data.applicationId, request.user.id, request.user.role === 'employer');
    
    if (!application) {
      throw new NotFoundException('Job application not found');
    }
    
    const employerId = application.jobPost.employer.id;
    const employeeId = application.applicantId;
    
    // Проверяем, что текущий пользователь - это работодатель или соискатель
    if (request.user.id !== employerId && request.user.id !== employeeId) {
      throw new ForbiddenException('You are not authorized to create this conversation');
    }
    
    // Создаем или получаем беседу
    const conversation = await this.chatService.getOrCreateConversation(employerId, employeeId);
    
    // Если есть начальное сообщение, отправляем его (от любого пользователя - работодателя или соискателя)
    if (data.initialMessage) {
      await this.chatService.saveMessage({
        conversationId: conversation._id?.toString() || '',
        text: data.initialMessage,
        senderId: request.user.id
      });
    }
    
    // Получаем детали пользователей для возврата полной информации
    const employer = await this.usersService.findOneById(employerId);
    const employee = await this.usersService.findOneById(employeeId);
    
    // Определяем, кто является собеседником для текущего пользователя
    const otherUser = request.user.id === employerId ? employee : employer;
    
    // Возвращаем обогащенную информацию о беседе
    return {
      id: conversation._id,
      user1: {
        id: employer.id,
        username: employer.username,
        firstName: employer.firstName,
        lastName: employer.lastName,
        role: employer.role
      },
      user2: {
        id: employee.id,
        username: employee.username,
        firstName: employee.firstName,
        lastName: employee.lastName,
        role: employee.role
      },
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        role: otherUser.role
      },
      updatedAt: conversation.lastMessageAt
    };
  }
  
  // Updated method to get application data using ApplyingService
  private async getApplicationData(applicationId: string, userId: string, isEmployer: boolean) {
    try {
      return await this.applyingService.findOne(applicationId, userId, isEmployer);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        return null;
      }
      throw error;
    }
  }
}