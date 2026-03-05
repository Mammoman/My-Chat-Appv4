import React from 'react';
import MessageSearch from './MessageSearch';
import '../../styles/chat/MessageOptionsOverlay.css';

const MessageOptionsOverlay = ({ onClose, onOpenRoomDetails, messages = [], users = [], onSearch, roomData }) => {
  const handleClose = () => {
    onClose();
    onSearch(null);
  };

  return (
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
            onClick={onOpenRoomDetails}
          >
            Room Details
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageOptionsOverlay;