import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/snake" element={<App />} />
        <Route path="/flappybird" element={<App />} />
        <Route path="*" element={<Navigate to="/snake" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
