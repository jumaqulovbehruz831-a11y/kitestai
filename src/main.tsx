import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientApiInterceptor } from './services/clientApiInterceptor';

// Enable universal API routing for both GitHub Pages & Node server
initClientApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
