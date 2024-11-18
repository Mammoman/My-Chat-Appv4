import React from 'react';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { PinIcon } from 'hugeicons-react';

const MessageBubble = ({ message, scrollToMessage, auth }) => {
  const isCurrentUser = auth?.currentUser?.uid === message.userId;

  if (message.deleted) {
    return (
      <div className="message-bubble deleted">
        <p className="deleted-message">Message has been deleted</p>
      </div>
    );
  }
  
  return (
    <div className="message-bubble">
      {message.pinned && (
        <div className="pin-indicator">
          <PinIcon size={16} />
        </div>
      )}

      {message.replyTo && (
        <div 
          className="reply-reference"
          onClick={(e) => {
            e.stopPropagation();
            scrollToMessage(message.replyTo.id);
          }}
        >
          <div className="reply-preview-content">
            <span className="reply-user">{message.replyTo.user}</span>
            <p className="reply-text">
              {message.replyTo.deleted ? (
                "Message has been deleted"
              ) : message.replyTo.type === 'voice' ? (
                <span>🎤 Voice message</span>
              ) : (
                message.replyTo.text
              )}
            </p>
          </div>
        </div>
      )}
      {message.type === 'voice' ? (
        <VoiceMessagePlayer 
          audioUrl={message.audioData} 
          duration={message.duration}
          isSent={isCurrentUser}
        />
      ) : (
        <p>{message.text}</p>
      )}
    </div>
  );
};

export default MessageBubble;