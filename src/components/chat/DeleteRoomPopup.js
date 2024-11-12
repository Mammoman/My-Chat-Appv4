import React from 'react';
import '../../styles/chat/DeleteRoomPopup.css';

const DeleteRoomPopup = ({ isCreator, onConfirm, onCancel }) => {
  return (
    <div className="delete-room-popup">
      <div className="delete-room-content">
        <h3 className="delete-room-title">
          {isCreator ? 'Delete Room' : 'Exit Room'}
        </h3>
        <p className="delete-room-text">
          {isCreator 
            ? 'Are you sure you want to delete this room? This action cannot be undone.'
            : 'Are you sure you want to exit this room?'}
        </p>
        <div className="delete-room-buttons">
          <button className="delete-room-button cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-room-button confirm" onClick={onConfirm}>
            {isCreator ? 'Delete' : 'Exit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRoomPopup;