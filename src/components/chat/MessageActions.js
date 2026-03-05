import React from 'react';
import '../../styles/chat/MessageActions.css';
import { PinIcon, Delete02Icon, RepeatIcon } from 'hugeicons-react';

const MessageActions = ({
  message,
  onReply,
  onPin,
  onDelete,
  onReaction,
  reactions,
  isSelected,
  canDelete,
  isDeleted,
  isRoomCreator,
  onCloseMenu,
  onEdit
}) => {
  const handleReply = (e) => {
    e.stopPropagation();
    onReply(message);
    onCloseMenu();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this message?')) {
      onDelete(message);
      onCloseMenu();
    }
  };

  const handlePin = (e) => {
    e.stopPropagation();
    onPin(message.id);
    onCloseMenu();
  };

  return (
    <>
      {isSelected && (
        <div className="message-actions-overlay">
          <div className="reactions-row">
            {reactions.map((reaction) => (
              <button
                key={reaction}
                className="unified-reaction-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onReaction(message.id, reaction);
                  onCloseMenu();
                }}
              >
                {reaction}
              </button>
            ))}
          </div>

          <div className="actions-divider"></div>

          <div className="functional-actions-row">
            {!isDeleted && (
              <button
                className="action-button reply-button"
                onClick={handleReply}
              >
                <RepeatIcon size={16} /> Reply
              </button>
            )}
            {canDelete && !isDeleted && message.type !== 'voice' && (
              <button
                className="action-button edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(message);
                  onCloseMenu();
                }}
              >
                <PinIcon size={16} /> Edit
              </button>
            )}
            {canDelete && (
              <button
                className="action-button delete-button"
                onClick={handleDelete}
              >
                <Delete02Icon size={16} /> Delete
              </button>
            )}

            {isRoomCreator && (
              <button
                className="action-button pin-button"
                onClick={handlePin}
              >
                <PinIcon size={16} /> {message.pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageActions;