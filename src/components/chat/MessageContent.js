import React, { useState, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import MessageActions from './MessageActions';
import MessageSearch from './MessageSearch';
import LoadingAnimation from '../common/LoadingAnimation';
import DateDivider from './DateDivider';
import { formatMessageDate } from '../../utils/dateUtils';

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
  isLoading,
  room
}) => {
  const groupMessagesByDate = () => {
    let currentDate = null;
    let lastReadTimestamp = localStorage.getItem(`lastRead_${room}`) || 0;
    let hasUnreadDividerBeenAdded = false;
    const groupedMessages = [];

    messages.forEach(message => {
      const messageDate = message.createdAt ? formatMessageDate(message.createdAt) : '';
      const messageTimestamp = message.createdAt?.seconds || 0;
      
      if (!hasUnreadDividerBeenAdded && 
          messageTimestamp > lastReadTimestamp && 
          message.user !== auth.currentUser?.email) {
        groupedMessages.push({
          type: 'unread',
          count: messages.filter(m => 
            m.createdAt?.seconds > lastReadTimestamp && 
            m.user !== auth.currentUser?.email
          ).length
        });
        hasUnreadDividerBeenAdded = true;
      }
      
      if (messageDate && messageDate !== currentDate) {
        groupedMessages.push({
          type: 'date',
          date: messageDate
        });
        currentDate = messageDate;
      }
      
      groupedMessages.push({
        type: 'message',
        data: message
      });
    });

    return groupedMessages;
  };

  useEffect(() => {
    return () => {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.createdAt) {
        localStorage.setItem(`lastRead_${room}`, lastMessage.createdAt.seconds);
      }
    };
  }, [messages, room]);

  return (
    <div className="message-content" ref={messageContentRef}>
      {isLoading ? (
        <LoadingAnimation />
      ) : (
        <div className="messages-container">
          {groupMessagesByDate().map((item, index) => (
            item.type === 'date' ? (
              <DateDivider key={`date-${index}`} date={item.date} />
            ) : item.type === 'unread' ? (
              <div key={`unread-${index}`} className="unread-divider">
                <span>{item.count} new messages</span>
              </div>
            ) : (
              <div 
                key={item.data.id} 
                id={`message-${item.data.id}`}
                className={`message ${item.data.user === userEmail ? 'sent' : 'received'}`}
                onClick={() => handleMessageClick(item.data.id)}
              >
                <div className="message-user-avatar">
                  {item.data.user.charAt(0).toUpperCase()}
                </div>
                <div className="message-content-wrapper">
                  <span className="message-user-email">{item.data.user}</span>
                  <div className="message-bubble-wrapper">
                    <MessageBubble 
                      message={item.data}
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
                              handleReaction(item.data.id, reaction);
                            }}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                      <div className="reaction-badges">
                        {item.data.reactions && 
                          Object.entries(item.data.reactions)
                            .filter(([_, users]) => users && users.length > 0)
                            .map(([reaction, users]) => (
                              <div 
                                key={reaction} 
                                className="reaction-badge"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReaction(item.data.id, reaction);
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
                </div>
                <span className="message-status">
                  {item.data.createdAt ? (
                    <span className="status-icon status-received">✓✓</span>
                  ) : (
                    <span className="status-icon status-pending">⏳</span>
                  )}
                </span>
                {(item.data.deleted ? item.data.user === auth.currentUser?.email : true) && (
                  <MessageActions 
                    message={item.data}
                    onReply={handleReply}
                    onDelete={handleDeleteMessage}
                    onPin={handlePinMessage}
                    isSelected={selectedMessageId === item.data.id}
                    canDelete={item.data.user === auth.currentUser?.email}
                    isDeleted={item.data.deleted}
                    isRoomCreator={item.data.user === auth.currentUser?.email}
                  />
                )}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageContent;