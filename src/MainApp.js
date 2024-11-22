import React, { useState, useEffect } from 'react';
import { Auth } from './components/auth/Auth';
import Cookies from 'universal-cookie';
import Chat from './components/chat/Chat';
import ChatList from './components/chat/ChatList';
import Sidebar from './components/chat/Sidebar';
import { signOut } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './App.css';
import { useNotifications } from './components/chat/NotificationContext';

const cookies = new Cookies();

const MainApp = () => {
  const { showNotification } = useNotifications();
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  const signUserOut = async () => {
    await signOut(auth);
    cookies.remove("auth-token");
    setIsAuth(false);
    setRoom(null);
  };

  useEffect(() => {
    const roomsRef = collection(db, "rooms");
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRooms(roomsData);
    });

    return () => unsubscribe();
  }, []);

  if (!isAuth) {
    return <Auth setIsAuth={setIsAuth} />;
  }

  return (

  
      
      <div className="mainpage-container ">
      <Sidebar 
      signUserOut={signUserOut} 
      onFilterChange={setActiveFilter}  />
      
        <ChatList 
        rooms={rooms} 
        selectedRoom={room} 
        onSelectRoom={setRoom} 
        setRoom={setRoom} 
        activeFilter={activeFilter} 
        showNotification={showNotification}  />
        <div className="chat-area">
          {room ? (
            <Chat room={room} showNotification={showNotification} />
          ) : (
            <div className="no-chat-selected">
              <p>Select a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>
  );
}

export default MainApp; 