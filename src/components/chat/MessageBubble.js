import React from 'react';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { PinIcon } from 'hugeicons-react';

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const formatMessageText = (text) => {
  if (!text) return '';

  // Escape HTML first to prevent XSS
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Format Bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Format Italics: *text* (only if not already matched as bold)
  formatted = formatted.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Format Code inline: `code`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>');

  // Auto-link URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formatted = formatted.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>');

  // Highlight @mentions
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  formatted = formatted.replace(mentionRegex, '<span class="mention-highlight">@$1</span>');

  return formatted;
};

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
        <div className="reply-reference"
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
        <div className="voice-message">
          <VoiceMessagePlayer
            audioUrl={message.audioData}
            duration={message.duration}
            isSent={isCurrentUser}
          />
          <span className="serverTimestamp">{formatTimestamp(message.createdAt)}</span>
        </div>
      ) : (
        <>
          <p dangerouslySetInnerHTML={{ __html: formatMessageText(message.text) }} />
          <span className="serverTimestamp">
            {message.edited && <span style={{ fontSize: '10px', fontStyle: 'italic', marginRight: '4px' }}>(edited)</span>}
            {formatTimestamp(message.createdAt)}
          </span>
        </>
      )}
    </div>
  );
};

export default MessageBubble;