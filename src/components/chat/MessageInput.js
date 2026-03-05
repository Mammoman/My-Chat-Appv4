import React from 'react';
import { Cancel02Icon, StopIcon, Mic02Icon } from 'hugeicons-react';
import VoicePreview from './VoicePreview';

const MessageInput = ({
  handleSubmit,
  selectedReply,
  setSelectedReply,
  showPreview,
  previewAudio,
  cancelRecording,
  sendVoiceMessage,
  inputRef,
  newMessage,
  setNewMessage,
  isRecording,
  startRecording,
  stopRecording,
  recordingDuration,
  formatDuration,
  users, // Add users prop for mentions suggestions
  editingMessage,
  cancelEdit
}) => {
  const [mentionSuggestions, setMentionSuggestions] = React.useState([]);
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionIndex, setMentionIndex] = React.useState(0);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage, inputRef]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Mentions logic
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    // Split on whitespace to correctly handle newlines and spaces
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    console.log("[Mentions Debug] Input:", { value, cursorPosition, textBeforeCursor, lastWord, usersLength: users?.length });

    if (lastWord.startsWith('@')) {
      const searchTerm = lastWord.substring(1).toLowerCase();
      // Filter users list excluding current user if needed, for now just filter all
      const matchedUsers = (users || []).filter(usr => usr && (usr.toLowerCase().includes(searchTerm) || usr.split('@')[0].toLowerCase().includes(searchTerm)));

      console.log("[Mentions Debug] Found match:", { searchTerm, matchedUsers });

      if (matchedUsers.length > 0) {
        setMentionSuggestions(matchedUsers);
        setShowMentions(true);
        setMentionIndex(0); // Reset selection
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (userToMention) => {
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = newMessage.substring(0, cursorPosition);
    const textAfterCursor = newMessage.substring(cursorPosition);
    const wordsBeforeCursor = textBeforeCursor.split(' ');

    // Remove the partial @mention word and replace with full mention
    wordsBeforeCursor.pop();
    const newTextBeforeCursor = wordsBeforeCursor.join(' ') + (wordsBeforeCursor.length > 0 ? ' ' : '') + '@' + userToMention.split('@')[0] + ' ';

    setNewMessage(newTextBeforeCursor + textAfterCursor);
    setShowMentions(false);

    // Focus and adjust cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = newTextBeforeCursor.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => (prev + 1) % mentionSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(mentionSuggestions[mentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return; // Don't process other keys if mentions box is open
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <form onSubmit={handleSubmit} className='message-box-reply-preview'>
      {(selectedReply || editingMessage) && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <span className="reply-user">{editingMessage ? 'Editing Message' : selectedReply.user}</span>
            <p className="reply-text">
              {editingMessage ? (
                <span className='reply-voice'>Modifying your message...</span>
              ) : selectedReply.type === 'voice' ? (
                <span className='reply-voice'>🎤 Voice message</span>
              ) : (
                selectedReply.text
              )}
            </p>
          </div>
          <button
            type="button"
            className="cancel-reply"
            onClick={editingMessage ? cancelEdit : () => setSelectedReply(null)}
          >
            <Cancel02Icon className='cancel-reply-icon' />
          </button>
        </div>
      )}
      <div className="message-box">
        {showPreview ? (
          <VoicePreview
            audioUrl={previewAudio?.url}
            onCancel={cancelRecording}
            onSend={sendVoiceMessage}
          />
        ) : (
          <div className='message-input-container'>
            {showMentions && (
              <div className="mentions-dropdown" ref={dropdownRef}>
                {mentionSuggestions.map((usr, index) => (
                  <div
                    key={usr}
                    className={`mention-suggestion-item ${index === mentionIndex ? 'selected' : ''}`}
                    onClick={() => insertMention(usr)}
                    onMouseEnter={() => setMentionIndex(index)}
                  >
                    <div className="mention-suggestion-avatar">
                      {usr.charAt(0).toUpperCase()}
                    </div>
                    <span>{usr}</span>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={inputRef}
              className='message-input multiline'
              placeholder={editingMessage ? 'Edit message...' : 'Type a message...'}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              value={newMessage}
              rows={1}
            />
            {editingMessage ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="action-btn"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn save-btn"
                  style={{ backgroundColor: '#4f46e5', color: 'white', borderRadius: '16px', padding: '6px 16px', fontSize: '13px' }}
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <div className="recording-indicator">
                    <StopIcon />
                    <span className="duration">{formatDuration(recordingDuration)}</span>
                  </div>
                ) : (
                  <Mic02Icon />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;