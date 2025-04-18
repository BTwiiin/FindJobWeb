/**
 * This script sets up the chat feature by:
 * 1. Running the migrations to create the chat tables
 * 2. Creating a default chat room if none exists
 */

import axios from 'axios';

async function setupChat() {
  try {
    console.log('Setting up chat feature...');

    // Create default chat room
    console.log('Creating default chat room...');
    const response = await axios.post('http://localhost:3001/chat/create-default-room');
    console.log('Response:', response.data);

    console.log('Chat setup completed successfully!');
  } catch (error) {
    console.error('Error setting up chat:', error.response?.data || error.message);
  }
}

setupChat();