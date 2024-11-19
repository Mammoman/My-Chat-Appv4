import React from 'react';
import { Cancel02Icon } from 'hugeicons-react';
import '../../styles/chat/RoomDetailsOverlay.css';

const RoomDetailsOverlay = ({ roomData, messages, onClose }) => {
  if (!roomData) return null;

  return (
    <div className="RoomDetails-overlay">
      <div className="RoomDetails-content">
        <div className="RoomDetails-header">
          <h2>Room Details</h2>
          <button className="close-btn" onClick={onClose}>
            <Cancel02Icon />
          </button>
        </div>
        
        <div className="room-details-body">
          <div className="room-avatar-large">
            {roomData.photoURL ? (
              <img src={roomData.photoURL} alt="Room" />
            ) : (
              <div className="avatar-placeholder">
                {roomData.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="room-info-section">

            <div className="room-info-item">
            <div className="info-item">
              <label>Room Name</label>
              <span>{roomData.displayName || roomData.name}</span>
            </div>

            <div className="info-item">
              <label>Room Type</label>
              <span className={`room-type ${roomData.type}`}>
                {roomData.type}
              </span>
            </div>

            </div>
           
            <div className="info-item">
              <label>Created By</label>
              <span>{roomData.creatorEmail}</span>
            </div>

            <div className="info-grid">
              <div className="info-stat">
                <span className="stat-number">
                  {roomData.participants?.length || 0}
                </span>
                <label>Participants</label>
              </div>

              <div className="info-stat">
                <span className="stat-number">
                  {messages.length}
                </span>
                <label>Messages</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsOverlay;