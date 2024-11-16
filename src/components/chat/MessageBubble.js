import React from 'react';
import VoiceMessagePlayer from './VoiceMessagePlayer';

const MessageBubble = ({ message, scrollToMessage, auth }) => {
  const isCurrentUser = auth?.currentUser?.uid === message.userId;
  
  return (
    <div className="message-bubble">
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
              {message.replyTo.type === 'voice' ? (
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