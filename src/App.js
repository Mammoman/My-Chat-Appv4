import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainApp from './MainApp';
import { useEffect } from 'react';
import { NotificationProvider } from './components/chat/NotificationContext';

const App = () => {


  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="/callback" element={<div>Connecting to Spotify...</div>} /> */}
          <Route path="/" element={<MainApp />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;
