import React from 'react';
import '../../styles/chat/MessageActions.css';

const MessageActions = ({ message, onReply, isSelected }) => {
  const handleReply = (e) => {
    e.stopPropagation();
    onReply(message);
  };

  return (
    <>
      {isSelected && (
        <div className="message-actions-overlay">
          <button 
            className="action-button reply-button"
            onClick={handleReply}
          >
            Reply
          </button>
          {/* Add other action buttons here */}
        </div>
      )}
    </>
  );
};

export default MessageActions; 