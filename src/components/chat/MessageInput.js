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
  formatDuration
}) => {
  return (
    <form onSubmit={handleSubmit} className='message-box-reply-preview'>
      {selectedReply && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <span className="reply-user">{selectedReply.user}</span>
            <p className="reply-text">
              {selectedReply.type === 'voice' ? (
                <span className='reply-voice'>🎤 Voice message</span>
              ) : (
                selectedReply.text
              )}
            </p>
          </div>
          <button 
            type="button" 
            className="cancel-reply" 
            onClick={() => setSelectedReply(null)}
          >
            <Cancel02Icon className='cancel-reply-icon'/>
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
            <input
              ref={inputRef}
              type="text"
              className='message-input'
              placeholder='Type here...'
              onChange={(e) => setNewMessage(e.target.value)}
              value={newMessage}
            />
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
          </div>
        )}
      </div>
    </form>
  );
};

export default MessageInput;