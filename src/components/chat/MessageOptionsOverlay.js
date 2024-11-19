import React, { useState } from 'react';
import MessageSearch from './MessageSearch';
import '../../styles/chat/MessageOptionsOverlay.css';
import RoomDetailsOverlay from './RoomDetailsOverlay';

const MessageOptionsOverlay = ({ onClose, messages = [], users = [], onSearch, roomData }) => {
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const handleClose = () => {
    onClose();
    onSearch(null);
  };

  const handleRoomDetailsClick = () => {
    setShowRoomDetails(true);
  };

  return (
    <>
      <div className="MessageOptions-overlay">
        <div className="MessageOptions-content">
          <div className="MessageOptions-header">
            <div className="MessageOptions-title">
              <span>Message Options</span>
            </div>
            <button className="close-btn" onClick={handleClose}>×</button>
          </div>
          <div className="MessageOptions-list">
            <MessageSearch 
              messages={messages}
              users={users}
              onSearch={onSearch}
            />
          </div>
          <div className='MessageOptions-list'>
            <span 
              className='MessageOptions-item'
              onClick={handleRoomDetailsClick}
            >
              Room Details
            </span>
          </div>
        </div>
      </div>
      {showRoomDetails && (
        <RoomDetailsOverlay 
          roomData={roomData}
          messages={messages}
          onClose={() => setShowRoomDetails(false)}
        />
      )}
    </>
  );
};

export default MessageOptionsOverlay;