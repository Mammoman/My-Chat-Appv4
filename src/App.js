import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './MainApp';
import { useEffect } from 'react';
import { handleSpotifyCallback } from './config/spotify';
import { NotificationProvider } from './components/chat/NotificationContext';

const App = () => {
  useEffect(() => {
    if (window.location.pathname === '/callback') {
      handleSpotifyCallback().then(() => {
        window.location.href = '/';
      });
    }
  }, []);

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/callback" element={<div>Connecting to Spotify...</div>} />
          <Route path="/" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;
