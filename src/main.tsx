import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ChunkErrorBoundary } from './components/ChunkErrorBoundary';
import { recoverFromStaleChunks } from './lib/chunkRecovery';
import './index.css';

recoverFromStaleChunks();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChunkErrorBoundary>
      <App />
    </ChunkErrorBoundary>
  </StrictMode>,
);
