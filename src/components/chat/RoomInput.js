import React, { useRef, useState } from 'react';
import { auth, db } from '../../config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import '../../styles/chat/RoomInput.css';

function RoomInput({ setRoom }) {
  const roomInputRef = useRef(null);
  const [roomType, setRoomType] = useState('public');
  const [showPopup, setShowPopup] = useState(false);
  const [existingRoomId, setExistingRoomId] = useState(null);
  const [error, setError] = useState('');

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
          
          setError('Join request sent to room creator');
        }
      }
    } catch (error) {
      console.error("Error joining private room:", error);
      setError('Error joining room');
    }
  };

  const createRoom = async () => {
    const roomName = roomInputRef.current.value.trim();
    if (!roomName) return;

    try {
      const roomsRef = collection(db, "rooms");
      
      const q = query(roomsRef, where("name", "==", roomName.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingRoom = querySnapshot.docs[0];
        const existingRoomData = existingRoom.data();
        
        if (existingRoomData.type === 'private') {
          setExistingRoomId(existingRoom.id);
          setShowPopup(true);
          return;
        }
        
        setRoom(existingRoom.id);
        roomInputRef.current.value = '';
        return;
      }

      const newRoom = {
        name: roomName.toLowerCase(),
        displayName: roomName,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        type: roomType,
        participants: [auth.currentUser.uid],
        isActive: true
      };

      const docRef = await addDoc(roomsRef, newRoom);
      setRoom(docRef.id);
      roomInputRef.current.value = '';
      setError('');
    } catch (error) {
      console.error("Error creating room:", error);
      setError('Error creating room, omo go beg');
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
      <input ref={roomInputRef} />
      <select className='room-type' value={roomType} onChange={(e) => setRoomType(e.target.value)}>
        <option className='room-type-option' value="public">Public Room</option>
        <option className='room-type-option' value="private">Private Room</option>
      </select>
      </div>
       
      <div className='room-btn'>
      {error && <p className="error-message">{error}</p>}
      <button className='custom-btn btn-12' onClick={createRoom}>
        <span>Created!</span><span>Create Room</span></button>
      
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
    </div>
  );
}

export default RoomInput;