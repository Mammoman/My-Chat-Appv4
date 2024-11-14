import React from 'react';
import '../../styles/chat/MessageActions.css';

const MessageActions = ({ message, onReply, onDelete, isSelected, canDelete }) => {
  const handleReply = (e) => {
    e.stopPropagation();
    onReply(message);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message);
    }
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
          {canDelete && (
            <button 
              className="action-button delete-button"
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default MessageActions; 