import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test Gemini API Connection
 * Verifies that the API key is valid and the service is accessible
 */
async function testGeminiAPI() {
  console.log('\n🔍 Testing Gemini API Connection...\n');
  console.log('─'.repeat(50));
  
  // Check if API key exists
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY_HERE') {
    console.error('❌ Error: GEMINI_API_KEY not set in .env file');
    console.log('\n📝 Please add your API key to server/.env:');
    console.log('   1. Visit: https://makersuite.google.com/app/apikey');
    console.log('   2. Create or copy your API key');
    console.log('   3. Update GEMINI_API_KEY in server/.env\n');
    process.exit(1);
  }

  console.log(`✓ API Key found: ${process.env.GEMINI_API_KEY.substring(0, 8)}...`);
  console.log(`✓ Model: ${process.env.GEMINI_MODEL}`);
  console.log('─'.repeat(50));

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    // Send a test prompt
    console.log('\n📤 Sending test prompt to Gemini...');
    const prompt = 'Say "Hello! Gemini API is working correctly." in one sentence.';
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('\n✅ SUCCESS! Gemini API is working correctly!\n');
    console.log('─'.repeat(50));
    console.log('📨 Gemini Response:');
    console.log(`   "${text}"`);
    console.log('─'.repeat(50));
    console.log('\n✨ Your API key is valid and ready to use!\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ ERROR: Failed to connect to Gemini API\n');
    console.log('─'.repeat(50));
    
    if (error.message && error.message.includes('API key not valid')) {
      console.error('❌ Invalid API Key');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check if your API key is correct');
      console.log('   2. Visit: https://makersuite.google.com/app/apikey');
      console.log('   3. Generate a new API key if needed');
      console.log('   4. Update GEMINI_API_KEY in server/.env');
    } else if (error.message && error.message.includes('model')) {
      console.error('❌ Invalid Model Name');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check GEMINI_MODEL in server/.env');
      console.log('   2. Valid models: gemini-1.5-flash, gemini-1.5-pro, gemini-pro');
      console.log(`   3. Current model: ${process.env.GEMINI_MODEL}`);
    } else {
      console.error('❌ Connection Error:', error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify firewall settings');
      console.log('   3. Try again in a moment');
    }
    
    console.log('─'.repeat(50));
    console.log('\n');
    process.exit(1);
  }
}

// Run the test
testGeminiAPI().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
