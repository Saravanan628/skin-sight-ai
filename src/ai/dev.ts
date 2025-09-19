'use server';
import { config } from 'dotenv';
config({ path: '.env' });

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_PRO_API_KEY') {
    console.log('✅ GEMINI_API_KEY loaded successfully.');
} else {
    console.warn('⚠️ GEMINI_API_KEY is not loaded. The app will use the free tier. Please check your .env file.');
}
