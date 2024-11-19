import React from 'react';
import MessageSearch from './MessageSearch';
import '../../styles/chat/MessageOptionsOverlay.css';




const MessageOptionsOverlay = ({ onClose, messages = [], users = [], onSearch }) => {

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
          <div className="MessageOptions-item">
            <span>Search messages</span>
          </div>
          <div className="MessageOptions-item">
            <span>Reply</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageOptionsOverlay;