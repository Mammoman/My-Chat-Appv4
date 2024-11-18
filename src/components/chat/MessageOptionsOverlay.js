import React from 'react';
import '../../styles/chat/MessageOptionsOverlay.css';

const MessageOptionsOverlay = ({ onClose }) => {
     
  
  return (
    <div className="MessageOptions-overlay">
      <div className="MessageOptions-content">
        <div className="MessageOptions-header">
          <div className="MessageOptions-title">
            <span>Message Options</span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="MessageOptions-list">
            <div className="MessageOptions-item">
                <span>Delete</span>
            </div>
            <div className="MessageOptions-item">
                <span>Pin</span>
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