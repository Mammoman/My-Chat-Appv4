import React, { useRef, useState }                  from 'react';
import { auth, db }                                  from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion,
  serverTimestamp
}                                                  from 'firebase/firestore';
import                                          '../../styles/chat/RoomInput.css';

function RoomInput({ setRoom, onError }) {
  const roomInputRef = useRef(null);
  const [roomType, setRoomType] = useState('public');
  const [showPopup, setShowPopup] = useState(false);
  const [existingRoomId, setExistingRoomId] = useState(null);
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  
  const showError = (message) => {
    setError(message);
    onError(message); // Pass error up to parent
  };


  const validateRoomName = (name) => {
    if (!name) return 'Room name cannot be empty';
    if (name.length < 3) return 'Room name must be at least 3 characters';
    if (name.length > 30) return 'Room name must be less than 30 characters';
    if (!/^[a-zA-Z0-9-_\s]+$/.test(name)) return 'Room name can only contain letters, numbers, spaces, hyphens and underscores';

      
  // Remove multiple spaces and trim
    const normalizedName = name.replace(/\s+/g, ' ').trim();
    if (normalizedName !== name) return 'Room name contains invalid spacing';
    return '';
  };

  const handleJoinPrivateRoom = async (roomId) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await getDoc(roomRef);

      if (!roomDoc.exists()) return;
      
      const roomData = roomDoc.data();
      
      if (roomData.type === 'private') {
        if (roomData.participants.includes(auth.currentUser.uid)) {
          setRoom(roomId);
        } else {
          // Add join request
          const requestData = {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            timestamp: new Date()
          };
          
          await updateDoc(roomRef, {
            pendingRequests: arrayUnion(requestData)
          });
          
          onError('Join request sent to room creator');
        }
      }
    } catch (error) {
      console.error("Error joining private room:", error);
      setError('Error joining room');
    }
  };



  const createRoom = async () => {

    const roomName = roomInputRef.current.value.trim();
    setIsValidating(true);
    
    const validationError = validateRoomName(roomName);
    if (validationError) {
      onError(validationError);
      setIsValidating(false);
      return;
    }
       
    try {
      const roomsRef = collection(db, "rooms");

      const q = query(roomsRef,
         where("exactName", "==", roomName),
         where("type", "==", roomType));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingRoom = querySnapshot.docs[0];
        const existingRoomData = existingRoom.data();
        
        if (existingRoomData.type === 'private') {
          setExistingRoomId(existingRoom.id);
          setShowPopup(true);
          return;
        }

        // For public rooms, add user to participants
        await updateDoc(doc(db, 'rooms', existingRoom.id), {
          participants: arrayUnion(auth.currentUser.uid)
        });
        
        setRoom(existingRoom.id);
        await addSystemMessage(existingRoom.id, `${auth.currentUser.email} has joined ${roomName}`);
        roomInputRef.current.value = '';
        return;
      }
      const newRoom = {
        name: roomName.toLowerCase(),
        exactName: roomName,
        displayName: roomName,
        uniqueId: `${roomName.toLowerCase()}_${roomType}`,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        type: roomType,
        participants: [auth.currentUser.uid],
        isActive: true,
        pendingRequests: [],
        lastMessage: null,
        isPubliclyVisible: false,
        publicVisibleAfter: roomType === 'public' ? 
          new Date(Date.now() + (24 * 60 * 60 * 1000)) : // 24 hours for public rooms
          null // No delay for private rooms
      };

      const docRef = await addDoc(roomsRef, newRoom);
      setRoom(docRef.id);
      roomInputRef.current.value = '';
      setError('');
      setIsValidating(false);
    } catch (error) {
      console.error("Error creating room:", error);
      setError('Error creating room, omo go beg');
      setIsValidating(false);

    }
  };

  const addSystemMessage = async (roomId, message) => {
    try {
      const messagesRef = collection(db, 'rooms', roomId, 'Messages');
      await addDoc(messagesRef, {
        text: message,
        type: 'system',
        createdAt: serverTimestamp(),
        user: 'system',
        room: roomId
      });
    } catch (error) {
      console.error("Error adding system message:", error);
    }
  };

  const handleExistingRoom = () => {
    handleJoinPrivateRoom(existingRoomId);
    setShowPopup(false);
    roomInputRef.current.value = '';
  };

  return (
    <div className='room'>
      <label className='room-label'>Enter Room name: </label>
      <div className='room-input'>
      <input 
      ref={roomInputRef}
      className={`room-input ${error ? 'error' : ''}`}
      type='text'
      placeholder='Enter room name'
      />
      <select
       className='room-type-select' 
       value={roomType} 
       onChange={(e) => setRoomType(e.target.value)}>
        <option className='room-type-option' value="public">Public Room</option>
        <option className='room-type-option' value="private">Private Room</option>
      </select>
      </div>
       
  
     

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <p>A private room with this name exists. Would you like to join?</p>
            <div className="popup-buttons">
              <button onClick={handleExistingRoom}>Yes</button>
              <button onClick={() => setShowPopup(false)}>No</button>
            </div>
          </div>
        </div>
      )}

          {/* Error Popup */}
          {showErrorPopup && (
        <div className="error-popup">
          <div className="error-popup-content">
            <span className="error-message">{error}</span>
          </div>
        </div>
      )}


    <div className='room-btn'>
      <button className='custom-btn btn-12' onClick={createRoom}>
        <span>Created!</span><span>Create Room</span></button>
      
      </div>

    </div>
  );
}

export default RoomInput;