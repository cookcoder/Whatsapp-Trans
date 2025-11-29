export interface AppSettings {
  apiKey: string;
  isEnabled: boolean;
}

export interface TranslationRequest {
  type: 'TRANSLATE_TEXT';
  text: string;
}

export interface TranslationResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface DeepSeekResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
