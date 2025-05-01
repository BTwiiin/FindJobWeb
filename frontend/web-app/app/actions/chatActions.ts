'use server'

import { fetchWrapper } from '@/lib/fetchWrapper';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  roomId: string;
  createdAt: Date;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  user1: {
    id: string;
    username: string;
  };
  user2: {
    id: string;
    username: string;
  };
  updatedAt: Date;
}

interface User {
  id: string;
  username: string;
}

export async function getConversations() {
  try {
    const result = await fetchWrapper.get('chat/conversations');
    console.log('Conversations fetched:', result);
    return result;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
}

export async function startConversation(targetUserId: string) {
  try {
    return await fetchWrapper.post('chat/conversations', { targetUserId });
  } catch (error) {
    console.error('Error starting conversation:', error);
    throw error;
  }
}

export async function getOrCreateApplicationChat(applicationId: string, initialMessage?: string) {
  try {
    return await fetchWrapper.post('chat/application-conversation', { 
      applicationId,
      initialMessage: initialMessage || 'Ваша заявка была одобрена. Вы можете обсудить детали здесь.'
    });
  } catch (error) {
    console.error('Error creating application chat:', error);
    throw error;
  }
}

export async function getMessages(roomId: string) {
  try {
    return await fetchWrapper.get(`chat/messages/${roomId}`);
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function getWebSocketToken() {
  try {
    return await fetchWrapper.get('auth/ws-token');
  } catch (error) {
    console.error('Error fetching WebSocket token:', error);
    throw error;
  }
} 