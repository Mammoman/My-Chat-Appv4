import React, { useState, useEffect }                                      from 'react';
import { Moon01Icon, Search02Icon, Sun02Icon }                             from 'hugeicons-react';
import { auth }                                                            from '../../config/firebase';
import { doc,
   getDoc, 
   updateDoc, 
   arrayRemove, 
   collection, 
   getDocs, 
   addDoc,
   serverTimestamp,
   deleteDoc,
   writeBatch }                                                            from 'firebase/firestore';
import { db }                                                              from '../../config/firebase';
import DeleteRoomPopup                                                     from './DeleteRoomPopup';
import RoomInput                                                           from './RoomInput';
import                                                                     '../../styles/chat/ChatList.css';




const ChatList = ({ rooms, selectedRoom, onSelectRoom, messages, onMessageClick }) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [roomToExit, setRoomToExit] = useState(null);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('error');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
  const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (!rooms) return;
    
    // Filter rooms based on permissions and search query
    const userRooms = rooms.filter(room => {
      const matchesSearch = room.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const currentTime = new Date();
      
      // Check if user is a participant or creator
      const isParticipant = room.participants?.includes(auth.currentUser.uid);
      const isCreator = room.createdBy === auth.currentUser.uid;

      // For public rooms
      if (room.type === 'public') {
        return matchesSearch && (
          isCreator || // Always show to creator
          isParticipant || // Show to participants
          (room.publicVisibleAfter && new Date(room.publicVisibleAfter) <= currentTime) // Show if delay passed
        );
      }
      
      // For private rooms
      return matchesSearch && (isCreator || isParticipant);
    });

    setFilteredRooms(userRooms);
  }, [rooms, searchQuery]);

  const handleDeleteRoom = async (roomId) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);
      const roomData = roomDoc.data();

      if (roomData.createdBy === auth.currentUser.uid) {
        // Delete all messages in the room
        const messagesRef = collection(db, 'rooms', roomId, 'Messages');
        const messagesSnapshot = await getDocs(messagesRef);
        const batch = writeBatch(db);

        messagesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        // Deletes the room document
        batch.delete(roomRef);
        await batch.commit();

        // If this was the selected room, clear the selection
        if (selectedRoom === roomId) {
          onSelectRoom(null);
        }
      } else {
        // For non-creators, just remove themselves from participants
        await updateDoc(roomRef, {
          participants: arrayRemove(auth.currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleRoomExit = async (roomId, isCreator) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      
      // Add leave message
      const messagesRef = collection(db, 'rooms', roomId, 'Messages');
      await addDoc(messagesRef, {
        text: `${auth.currentUser.email} has left the room`,
        type: 'system',
        createdAt: serverTimestamp(),
        user: 'system',
        room: roomId
      });
  
      if (isCreator) {
        await deleteDoc(roomRef);
      } else {
        await updateDoc(roomRef, {
          participants: arrayRemove(auth.currentUser.uid)
        });
      }
      
      if (selectedRoom === roomId) {
        onSelectRoom(null);
      }
    } catch (error) {
      console.error("Error handling room exit:", error);
    }
  };

  const handleError = (errorData) => {
    if (typeof errorData === 'string') {
      setError(errorData);
      setErrorType('error');
    } else {
      setError(errorData.message);
      setErrorType(errorData.type || 'error');
    }
    
    setShowErrorPopup(true);
    
    if (window.errorTimeout) {
      clearTimeout(window.errorTimeout);
    }
    
    window.errorTimeout = setTimeout(() => {
      setShowErrorPopup(false);
      setError('');
    }, 3000);
  };



  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2 className="gradient-text">Chat Rooms</h2>
        <div className='header-buttom'>
          <div className={`search ${isSearchFocused ? 'focused' : ''}`}>
            <div className="chat-search-container">
              <Search02Icon className="search-icon" />
              <input 
              className='search-input'
                type="text" 
                placeholder="Search rooms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          </div>
          <div className={`darkmode-icon ${isDarkMode ? 'active' : ''}`}
            onClick={toggleDarkMode}
            title="Toggle dark mode">
            {!isDarkMode ? <Moon01Icon/> : <Sun02Icon className='toggle-icon-1'/>}
          </div>
        </div>
      </div>

      <div className="rooms-container">

        {filteredRooms.map((room) => (
          <div 
            key={room.id}
            className={`room-item ${selectedRoom === room.id ? 'active' : ''}`}
          >
            <div 
              className="room-content"
              onClick={() => onSelectRoom(room.id)}
            >
              <div className="room-avatar">
                <div className="avatar-placeholder" />
              </div>
              <div className="room-info">
              <h4>{room.displayName}</h4>
        <div className="room-type-info">
          <span className={`room-type-badge ${room.type}`}>
            {room.type}
                  </span>
                </div>
              </div>
            </div>
            <button 
                className="room-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  const isCreator = room.createdBy === auth.currentUser.uid;
                  if (isCreator) {
                    setRoomToDelete({ id: room.id, isCreator: true });
                  } else {
                    setRoomToExit({ id: room.id, isCreator: false });
                  }
            }}      
            >
              {room.createdBy === auth.currentUser.uid ? 'Delete' : 'Exit'}
            </button>
          </div>
        ))}
      </div>

      <div className="room-input-wrapper">
        <RoomInput 
        setRoom={onSelectRoom}
        onError={handleError}/>
      </div>

      {roomToDelete && (
        <DeleteRoomPopup
          isCreator={roomToDelete.isCreator}
          onConfirm={() => {
            handleDeleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }}
          onCancel={() => setRoomToDelete(null)}
        />
      )}

      {showErrorPopup && (
              <div className="error-popup">
                <div className={`error-popup-content ${errorType}`}>
                  <span className="error-message">{error}</span>
                </div>
              </div>
            )}
        
                {roomToExit && (
          <DeleteRoomPopup
            isCreator={false}
            onConfirm={() => {
              handleRoomExit(roomToExit.id, false);
              setRoomToExit(null);
            }}
                  onCancel={() => setRoomToExit(null)}
                />
              )}
    </div>

  );
};

export default ChatList;