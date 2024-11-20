import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../../styles/settings/Account.css';
import LoadingAnimation from '../common/LoadingAnimation';

const Account = (messages) => {

  const [isLoading, setIsLoading] = useState(true); 
  const [roomDisplay, setRoomDisplay] = useState(false);
  const [roomsCreated, setRoomsCreated] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalPublicRooms, setTotalPublicRooms] = useState(0);
  const [totalPrivateRooms, setTotalPrivateRooms] = useState(0);
  const [createdPrivateRooms, setCreatedPrivateRooms] = useState(0);
  const [createdPublicRooms, setCreatedPublicRooms] = useState(0);

  useEffect(() => {
    const fetchUserStats = async () => {
      const userId = auth.currentUser.uid;

      const roomsRef = collection(db, 'rooms');
      const roomsQuery = query(roomsRef, where('createdBy', '==', userId));
      const roomsSnapshot = await getDocs(roomsQuery);
      setRoomsCreated(roomsSnapshot.size);

      let totalRoomsCount = 0;
      const allRoomsRef = collection(db, 'rooms'); // Declare only once
      const allRoomsSnapshot = await getDocs(allRoomsRef);

      // Count the total rooms the user is a participant in
      allRoomsSnapshot.docs.forEach(doc => {
        const roomData = doc.data();
        if (roomData.participants?.includes(auth.currentUser.uid)) {
          totalRoomsCount++;
        }
      });

      // Set the total rooms count
      setTotalRooms(totalRoomsCount);

      let messagesCount = 0;
      for (const roomDoc of roomsSnapshot.docs) {
        const messagesRef = collection(db, 'rooms', roomDoc.id, 'Messages');
        const messagesSnapshot = await getDocs(messagesRef);
        messagesCount += messagesSnapshot.size; // Count messages for each room
      }
      setTotalMessages(messagesCount); // Set the total messages count
  

      let createdPublicCount = 0;
      let createdPrivateCount = 0;
      roomsSnapshot.docs.forEach(doc => {
        if (doc.data().type === 'public') {
          createdPublicCount++;
        } else if (doc.data().type === 'private') {
          createdPrivateCount++;
        }
      });
      setCreatedPublicRooms(createdPublicCount);
      setCreatedPrivateRooms(createdPrivateCount);

      let publicCount = 0;
      let privateCount = 0;
      allRoomsSnapshot.docs.forEach(doc => {
        const roomData = doc.data();
        if (roomData.participants?.includes(userId)) {
          if (roomData.type === 'public') {
            publicCount++;
          } else if (roomData.type === 'private') {
            privateCount++;
          }
        }
      });
      setTotalPublicRooms(publicCount);
      setTotalPrivateRooms(privateCount);

      setIsLoading(false);
    };

    fetchUserStats();
  }, []);

  return (
    
    <div className="account-settings">
       {isLoading ? (
      <LoadingAnimation />
    ) : (
      <>
    
      <h3>Account Stats</h3>
     
      <label>Email</label>
      <input type="email" defaultValue="...@gmail.com" />
      <label>Password</label>
      <input type="password" placeholder="Change password" />
      <button>Save changes</button>
      <div className="Account-info-grid">
        <div className="Account-info-stat">
          <label>Rooms Created</label>
          <span 
          className="Account-stat-number">
            {roomsCreated}</span>
        </div>

        <div className="Account-info-stat">
          <label>Rooms Participant Of</label>
          <span 
          className="Account-stat-number">
            {totalRooms}</span>
        </div>

        <div className='Account-info-stat-overlay'>
          <div className="Account-info-stat">
            <span 
            className="Account-stat-number 
            public-room-count">
              {createdPublicRooms}</span>
            <label>Public Rooms</label>
          </div>

          <div className="Account-info-stat">
            <span 
            className="Account-stat-number
             private-room-count">
              {createdPrivateRooms}</span>
            <label>Private Rooms</label>
          </div>
        </div>


        <div className='Account-info-stat-overlay'>
          <div className="Account-info-stat">
            <span
             className="Account-stat-number 
             public-room-count">
              {totalPublicRooms}</span>
            <label>Total Public Rooms</label>
          </div>

          <div className="Account-info-stat">
            <span 
            className="Account-stat-number 
            private-room-count">
              {totalPrivateRooms}</span>
            <label>Total Private Rooms</label>
          </div>
        </div>
      </div>

      <div className="Account-info-stat">
            <span 
            className="Account-stat-number">{totalMessages}</span>
            <label>Total Messages </label>
          </div>

          </>

        )}
    </div>
  );
};

export default Account;