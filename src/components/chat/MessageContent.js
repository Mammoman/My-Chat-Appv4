import React, { useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageActions from './MessageActions';
import MessageSearch from './MessageSearch';
import LoadingAnimation from '../common/LoadingAnimation';



const MessageContent = ({
  messages,
  userEmail,
  selectedMessageId,
  handleMessageClick,
  handleReply,
  handleDeleteMessage,
  handlePinMessage,
  handleReaction,
  reactions,
  messageContentRef,
  scrollToMessage,
  auth,
  users,
  isLoading
}) => {


  
  return (
    <div className="message-content" ref={messageContentRef}>
        {isLoading ? (
        <LoadingAnimation />
      ) : (
         
      <div className="messages-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            id={`message-${message.id}`}
            className={`message ${message.user === userEmail ? 'sent' : 'received'}`}
            onClick={() => handleMessageClick(message.id)}
          >
            <div className="message-user-avatar">
              {message.user.charAt(0).toUpperCase()}
            </div>
            <div className="message-content-wrapper">
              <span className="message-user-email">{message.user}</span>
              <div className="message-bubble-wrapper">
                <MessageBubble 
                  message={message}
                  scrollToMessage={scrollToMessage}
                  auth={auth}
                />
                
                <div className="reactions-container">
                  <div className="reactions-popup">
                    {reactions.map((reaction) => (
                      <button
                        key={reaction}
                        className="reaction-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(message.id, reaction);
                        }}
                      >
                        {reaction}
                      </button>
                    ))}
                  </div>
                  
                  <div className="reaction-badges">
                    {message.reactions && 
                      Object.entries(message.reactions)
                        .filter(([_, users]) => users && users.length > 0)
                        .map(([reaction, users]) => (
                          <div 
                            key={reaction} 
                            className="reaction-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReaction(message.id, reaction);
                            }}
                          >
                            <span className="reaction-emoji">{reaction}</span>
                            <span className="reaction-count">{users.length}</span>
                            <div className="reaction-tooltip">
                              {users.join(', ')}
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
              
              <span className="message-status">
                {message.createdAt ? (
                  <span className="status-icon status-received">✓✓</span>
                ) : (
                  <span className="status-icon status-pending">⏳</span>
                )}
              </span>
              
              {(message.deleted ? message.user === auth.currentUser?.email : true) && (
                <MessageActions 
                  message={message}
                  onReply={handleReply}
                  onDelete={handleDeleteMessage}
                  onPin={handlePinMessage}
                  isSelected={selectedMessageId === message.id}
                  canDelete={message.user === auth.currentUser?.email}
                  isDeleted={message.deleted}
                  isRoomCreator={message.user === auth.currentUser?.email}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div> 
  );
};


export default MessageContent;