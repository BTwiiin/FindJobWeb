import { Controller, Get, Post, Body, Param, UseGuards, Request, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { StartConversationDto } from './dto/start-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('rooms')
  async createRoom(@Body() createRoomDto: CreateRoomDto, @Request() req) {
    const { name, description = '', isPrivate } = createRoomDto;
    return this.chatService.createRoom(name, description, isPrivate, req.user.id);
  }

  @Get('rooms')
  async getRooms() {
    return this.chatService.getRooms();
  }

  @Get('rooms/:id')
  async getRoomById(@Param('id') id: string) {
    return this.chatService.getRoomById(id);
  }

  @Get('rooms/:id/messages')
  async getMessagesByRoom(@Param('id') roomId: string) {
    return this.chatService.getMessagesByRoom(roomId);
  }
  
  @Post('create-default-room')
  async createDefaultRoom() {
    const existingRooms = await this.chatService.getRooms();
    
    // Only create if no rooms exist
    if (existingRooms.length === 0) {
      return this.chatService.createRoom(
        'Общий чат', 
        'Комната для общения всех пользователей', 
        false, 
        ''
      );
    }
    
    return { message: 'Default room already exists' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  async startConversation(@Body() dto: StartConversationDto, @Request() req) {
    const { targetUserId } = dto;
    return this.chatService.getOrCreateDirectMessageRoom(req.user.id, targetUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getMyConversations(@Request() req) {
    const userId = req.user.id;
    console.log(`Fetching conversations for user ${userId}`);
    const conversations = await this.chatService.getDirectMessageRoomsForUser(userId);
    console.log(`Found ${conversations.length} conversations`, 
      conversations.map(conv => ({
        id: conv.id, 
        name: conv.name,
        user1: conv.user1?.username || conv.user1Id,
        user2: conv.user2?.username || conv.user2Id
      }))
    );
    return conversations;
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:roomId')
  async getConversation(@Param('roomId') roomId: string, @Request() req) {
    // This will throw an error if the user is not part of the conversation
    const messages = await this.chatService.getMessagesByRoom(roomId);
    const otherUser = await this.chatService.getOtherUserInConversation(roomId, req.user.id);
    
    return {
      roomId,
      otherUser: {
        id: otherUser.id,
        username: otherUser.username,
      },
      messages
    };
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  async createMessage(@Body() createMessageDto: any, @Request() req: any) {
    const { roomId, text } = createMessageDto;
    return this.chatService.saveMessage({
      text,
      roomId,
      senderId: req.user.id
    });
  }

  @Post('application-conversation')
  @UseGuards(JwtAuthGuard)
  async createApplicationConversation(
    @Body() data: { applicationId: string; initialMessage?: string },
    @Req() request: any
  ) {
    // Get the current user
    const currentUserId = request.user.id;
    
    // Find the application
    const application = await this.chatService['applicationRepository'].findOne({
      where: { id: data.applicationId },
      relations: ['applicant', 'jobPost', 'jobPost.employer']
    });
    
    if (!application) {
      throw new NotFoundException('Job application not found');
    }
    
    // Create or get conversation between employer and employee
    const employerId = application.jobPost.employer.id;
    const employeeId = application.applicant.id;
    
    // Verify the current user is either the employer or employee
    if (currentUserId !== employerId && currentUserId !== employeeId) {
      throw new ForbiddenException('You are not authorized to create this conversation');
    }
    
    // Get or create the conversation
    const room = await this.chatService.getOrCreateDirectMessageRoom(
      employerId, 
      employeeId, 
      `Чат по заявке: ${application.jobPost.title}`,
      `Общение по заявке на вакансию: ${application.jobPost.title}`
    );
    
    // If an initial message is provided and the current user is the employer,
    // send it automatically
    if (data.initialMessage && currentUserId === employerId) {
      await this.chatService.saveMessage({
        roomId: room.id,
        text: data.initialMessage,
        senderId: currentUserId
      });
    }
    
    return room;
  }
} 