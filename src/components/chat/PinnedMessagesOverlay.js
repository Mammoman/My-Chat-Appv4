import React from 'react';
import { PinIcon } from 'hugeicons-react';

const PinnedMessagesOverlay = ({ messages, onMessageClick, onClose }) => {
  const pinnedMessages = messages.filter(msg => msg.pinned);
  
  return (
    <div className="pinned-messages-overlay">
      <div className="pinned-messages-content">
        <div className="pinned-header">
          <div className="pinned-title">
            <PinIcon size={18} />
            <span>Pinned Messages ({pinnedMessages.length})</span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="pinned-list">
          {pinnedMessages.map((message) => (
            <div 
              key={message.id} 
              className="pinned-message"
              onClick={() => {
                onMessageClick(message.id);
                onClose();
              }}
            >
              <span className="pinned-by">
                Pinned by {message.pinnedBy || 'Unknown'}
              </span>
              <p className="pinned-text">
                {message.type === 'voice' ? '🎤 Voice Message' : message.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedMessagesOverlay;