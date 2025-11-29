import { AppSettings, TranslationRequest, TranslationResponse, DeepSeekResponse } from './types';

declare const chrome: any;

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request: TranslationRequest, sender: any, sendResponse: any) => {
  if (request.type === 'TRANSLATE_TEXT') {
    handleTranslation(request.text).then(sendResponse);
    return true; // Indicates async response
  }
});

async function handleTranslation(text: string): Promise<TranslationResponse> {
  try {
    // 1. Get API Key
    const settings = await chrome.storage.local.get(['apiKey', 'isEnabled']);
    if (!settings.isEnabled || !settings.apiKey) {
      return { success: false, error: 'Extension disabled or API Key missing' };
    }

    // 2. Call DeepSeek API
    // We use the DeepSeek Chat Completions endpoint
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a translator. Translate the following user text directly into Simplified Chinese. Do not add explanations, quotes, or preambles. Just return the translated text."
          },
          {
            role: "user",
            content: text
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
        const errData = await response.text();
        console.error("DeepSeek API Error:", errData);
        return { success: false, error: `API Error: ${response.statusText}` };
    }

    const data: DeepSeekResponse = await response.json();
    const translatedText = data.choices[0]?.message?.content;

    return { success: true, data: translatedText };

  } catch (error: any) {
    console.error('Translation error:', error);
    return { success: false, error: error.message };
  }
}