import React, { useState, useEffect } from 'react';
import { Auth } from './components/auth/Auth';
import Cookies from 'universal-cookie';
import Chat from './components/chat/Chat';
import ChatList from './components/chat/ChatList';
import Sidebar from './components/chat/Sidebar';
import { signOut } from 'firebase/auth';
import { auth, db } from './config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const cookies = new Cookies();

const MainApp = () => {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"));
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState([]);

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

  
      
      <div className="main-container">
      <Sidebar signUserOut={signUserOut} />
      
        <ChatList rooms={rooms} selectedRoom={room} onSelectRoom={setRoom} setRoom={setRoom} />
        <div className="chat-area">
          {room && (
            <Chat room={room} />
          )}
        </div>
      </div>
      
  );
};

export default MainApp; 