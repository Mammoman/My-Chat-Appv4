import React from 'react';
import '../../styles/chat/ChatRequestPopup.css';

const ChatRequestPopup = ({ requestingUser, onAccept, onDecline }) => {
  return (
    <div className="chat-request-popup">
      <div className="chat-request-content">
        <div className="user-profile">
          <div className="avatar-placeholder">
            {requestingUser.email[0].toUpperCase()}
          </div>
          <div className="user-info">
            <h3>Chat Request</h3>
            <p>{requestingUser.email}</p>
          </div>
        </div>
        <p className="request-message">
          would like to join this private chat room
        </p>
        <div className="request-buttons">
          <button className="accept-btn" onClick={onAccept}>Accept</button>
          <button className="decline-btn" onClick={onDecline}>Decline</button>
        </div>
      </div>
    </div>
  );
};

export default ChatRequestPopup;