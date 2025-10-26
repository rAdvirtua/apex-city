// Test script for the RAG chatbot functionality
import { getChatbotResponse } from './src/services/ragService.js';

async function testChatbot() {
  console.log('Testing Apex City AI Assistant...\n');

  const testQueries = [
    'How do I report a pothole?',
    'What is the status of my complaint?',
    'I need help with streetlights',
    'How can I check issues in my area?',
    'What can you help me with?'
  ];

  for (const query of testQueries) {
    console.log(`User: ${query}`);
    try {
      const response = await getChatbotResponse(query);
      console.log(`Bot: ${response}\n`);
    } catch (error) {
      console.error(`Error: ${error}\n`);
    }
  }
}

// Run the test
testChatbot().catch(console.error);
