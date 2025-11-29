import React, { useState, useEffect } from 'react';
import { AppSettings } from './types';

declare const chrome: any;

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    // Load settings from chrome storage on mount
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['apiKey', 'isEnabled'], (result: any) => {
        if (result.apiKey) setApiKey(result.apiKey);
        if (result.isEnabled !== undefined) setIsEnabled(result.isEnabled);
      });
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setStatus('Please enter a valid API Key.');
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      const settings: AppSettings = { apiKey, isEnabled };
      chrome.storage.local.set(settings, () => {
        setStatus('Settings saved successfully!');
        setTimeout(() => setStatus(''), 2000);
      });
    } else {
      setStatus('Storage API not available (Dev mode).');
    }
  };

  return (
    <div className="w-[350px] p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800">DeepSeek Translator</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DeepSeek API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for translation service.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Enable Translation</span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              isEnabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
        >
          Save Settings
        </button>

        {status && (
          <div className={`text-center text-xs font-medium py-1 ${status.includes('success') ? 'text-green-600' : 'text-red-500'}`}>
            {status}
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
         <p className="text-xs text-gray-400">Works on WhatsApp Web</p>
      </div>
    </div>
  );
};

export default App;