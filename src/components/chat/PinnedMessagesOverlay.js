import React from 'react';
import { PinIcon } from 'hugeicons-react';
import '../../styles/chat/PinnedMessagesOverlay.css';

const PinnedMessagesOverlay = ({ messages, onMessageClick, onUnpin, onClose }) => {
  const pinnedMessages = messages
    .filter(msg => msg.pinned)
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeA - timeB;
    });

  return (
    <div className="pinned-messages-overlay">
      <div className="pinned-messages-content">
        <div className="pinned-header">
          <div className="pinned-title">
            <PinIcon className='pin-icon' size={18} />
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
              <div className="pinned-message-header">
                <span className="pinned-by">
                  Pinned by {message.pinnedBy || 'Unknown'}
                </span>
                <button
                  className="unpin-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(message.id);
                  }}
                >
                  Unpin
                </button>
              </div>
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