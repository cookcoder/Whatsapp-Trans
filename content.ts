import { TranslationRequest, TranslationResponse } from './types';

declare const chrome: any;

// Configuration for class selectors
// Note: WhatsApp classes change often. It is often safer to look for structure or reliable attributes.
// The selector below targets the "copyable-text" container which is standard for WA Web message bubbles.
const MESSAGE_SELECTOR = '.copyable-text'; 
const PROCESSED_ATTRIBUTE = 'data-ds-translated';
const TRANSLATION_CLASS = 'ds-translation-result';

// Debounce helper
function debounce(func: Function, wait: number) {
  let timeout: any;
  return function(...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Function to inject translated text
function injectTranslation(element: HTMLElement, translatedText: string) {
  // Check if already exists just in case
  if (element.querySelector(`.${TRANSLATION_CLASS}`)) return;

  const translationDiv = document.createElement('div');
  translationDiv.className = TRANSLATION_CLASS;
  translationDiv.innerText = translatedText;
  
  // Styling according to requirements: Red text below original
  Object.assign(translationDiv.style, {
    color: '#ff0000', // Red
    fontSize: '0.85em',
    marginTop: '4px',
    fontWeight: '500',
    lineHeight: '1.4',
    paddingTop: '4px',
    borderTop: '1px dashed rgba(255, 0, 0, 0.2)'
  });

  // Find the text container to append to. 
  // Usually the text is inside a span inside the copyable-text div.
  // We append to the message container itself to ensure it sits at the bottom.
  const textContainer = element.querySelector('span[dir="ltr"], span[dir="rtl"]') || element;
  
  // If we found a specific span, we might want to append after it, 
  // but appending to the parent container is usually safer for layout flow in WA.
  element.appendChild(translationDiv);
}

// Main processor
const processMessages = async () => {
  // Find all message containers that have not been processed
  const messages = document.querySelectorAll(`${MESSAGE_SELECTOR}:not([${PROCESSED_ATTRIBUTE}])`);

  for (const message of Array.from(messages)) {
    const el = message as HTMLElement;
    
    // Mark as processed immediately to avoid double fetching
    el.setAttribute(PROCESSED_ATTRIBUTE, 'true');

    // Extract Text. 
    // The structure is usually: .copyable-text > span > innerText
    // We try to get the closest span with text.
    const textSpan = el.querySelector('span.selectable-text span') || el.querySelector('span');
    const originalText = (textSpan as HTMLElement)?.innerText?.trim();

    if (!originalText) continue;

    // Send to background for translation
    try {
      const payload: TranslationRequest = { type: 'TRANSLATE_TEXT', text: originalText };
      
      // We use chrome.runtime.sendMessage to talk to background.js
      chrome.runtime.sendMessage(payload, (response: TranslationResponse) => {
        if (chrome.runtime.lastError) {
             console.error("Runtime error:", chrome.runtime.lastError);
             return;
        }

        if (response && response.success && response.data) {
          injectTranslation(el, response.data);
        } else {
            console.debug("Translation failed or skipped:", response?.error);
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }
};

// Create Observer
const observer = new MutationObserver(debounce(processMessages, 500));

// Start Observing
// We target the main app container. #app or document.body is safe.
const startObserver = () => {
    const target = document.body;
    if (target) {
        observer.observe(target, {
            childList: true,
            subtree: true
        });
        console.log("WhatsApp DeepSeek Translator: Observer started.");
    } else {
        setTimeout(startObserver, 1000);
    }
};

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
} else {
    startObserver();
}