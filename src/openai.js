import { SYSTEM_PROMPT } from './prompts';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function sendMessageToGPT(messages) {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    return {
      role: 'assistant',
      content: 'Пожалуйста, вставьте ваш OpenAI API ключ в файл .env, чтобы начать общение.'
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Используем более быструю модель для чата
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.choices[0].message;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return {
      role: 'assistant',
      content: 'Произошла ошибка при подключении к GPT. Проверьте консоль или API ключ.'
    };
  }
}

export async function transcribeAudio(audioBlob) {
  if (!API_KEY || API_KEY === 'your_api_key_here') return null;

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data.text;
  } catch (error) {
    console.error('Transcription Error:', error);
    return null;
  }
}

export async function generateSpeech(text) {
  if (!API_KEY || API_KEY === 'your_api_key_here') return null;

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice: 'nova', // Качественный женский голос
      })
    });

    if (!response.ok) throw new Error('Speech generation failed');
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    console.log("Speech blob created, URL:", url);
    return url;
  } catch (error) {
    console.error('Speech Synthesis Error:', error);
    alert("Ошибка при генерации озвучки: " + error.message);
    return null;
  }
}
