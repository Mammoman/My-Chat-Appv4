import React, { useState } from 'react';
import { Call02Icon, MoreVerticalIcon, PinIcon, AtIcon } from 'hugeicons-react';
import MessageOptionsOverlay from './MessageOptionsOverlay';

const MessageHeader = ({ roomData,
  userEmail,
  pinnedCount,
  onPinClick,
  isPinnedOpen,
  messages = [],
  users = [],
  onSearch,
  mentionsCount,
  onMentionsClick,
  isMentionsOpen
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleOptionsClick = () => {
    setShowOptions(!showOptions);
  };

  const handleClose = () => {
    setShowOptions(false);
    onSearch(null);
  };


  return (
    <div className='message-header'>
      <div className="header-info">
        <h1>Welcome to: {roomData?.displayName || roomData?.name}</h1>
        <div className="header-details">
          {userEmail && <h2>User Email: {userEmail}</h2>}
          <div className="header-badges">
            <div className="pin-info" onClick={onPinClick}>
              <PinIcon size={18} className={`header-pin-icon ${isPinnedOpen ? 'active' : ''}`} />
              <span>{pinnedCount} pinned messages</span>
            </div>
            <div className="mention-info" onClick={onMentionsClick}>
              <AtIcon size={18} className={`header-mention-icon ${isMentionsOpen ? 'active' : ''}`} />
              <span>{mentionsCount} mentions</span>
            </div>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <span className="member-count">
          {roomData?.participants?.length || 0} members
        </span>
        <button className="action-btn"><Call02Icon className='phone-ma-btn' /></button>
        <div className="options-container">
          <button
            className="action-btn"
            onClick={handleOptionsClick}
          >
            <MoreVerticalIcon className='ellipsisV-ma-btn' />
          </button>
          {showOptions && (
            <MessageOptionsOverlay
              onClose={handleClose}
              messages={messages}
              users={users}
              onSearch={onSearch}
              roomData={roomData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;