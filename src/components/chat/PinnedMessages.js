import React from 'react';
import { PinIcon } from 'hugeicons-react';

const PinnedMessages = ({ messages, onMessageClick }) => {
  const pinnedMessages = messages.filter(msg => msg.pinned);
  
  if (pinnedMessages.length === 0) return null;
  
  return (
    <div className="pinned-messages">
      <div className="pinned-header">
        <PinIcon size={18} />
        <span>Pinned Messages ({pinnedMessages.length})</span>
      </div>
      <div className="pinned-list">
        {pinnedMessages.map((message) => (
          <div 
            key={message.id} 
            className="pinned-message"
            onClick={() => onMessageClick(message.id)}
            title="Click to scroll to message"
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
  );
};

export default PinnedMessages;