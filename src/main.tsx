import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function init() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      (globalThis as any).GEMINI_API_KEY = config.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    } else {
      (globalThis as any).GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {
    console.error('Failed to fetch config, falling back to VITE_GEMINI_API_KEY', e);
    (globalThis as any).GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
