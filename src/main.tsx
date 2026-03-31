import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function init() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    (globalThis as any).GEMINI_API_KEY = config.GEMINI_API_KEY;
  } catch (e) {
    console.error('Failed to fetch config', e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
