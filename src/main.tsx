import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

async function init() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const config = await res.json();
      console.log('Server configuration loaded. Key present:', config.hasKey);
    }
  } catch (e) {
    console.error('Failed to fetch server config', e);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

init();
