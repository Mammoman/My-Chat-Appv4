import React                                                                 from 'react';
import '../../styles/chat/MessageActions.css';
import { PinIcon, Delete02Icon, RepeatIcon } from 'hugeicons-react';


const MessageActions = ({ message, onReply, onPin, onDelete, isSelected, canDelete, isDeleted, isRoomCreator }) => {
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

  const handlePin = (e) => {
    e.stopPropagation();
    onPin(message.id);
  };

  return (
    <>
      {isSelected && (
        <div className="message-actions-overlay">
          {!isDeleted && (
            <button 
              className="action-button reply-button"
              onClick={handleReply}
            >
             <RepeatIcon/> Reply
            </button>
          )}
          {canDelete && (
            <button 
              className="action-button delete-button"
              onClick={handleDelete}
            >
               <Delete02Icon/>  Delete
            </button>
          )}
          
          {isRoomCreator && (
            <button 
              className="action-button pin-button"
              onClick={handlePin}
            >
              <PinIcon/> Pin
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default MessageActions; 