import React, { useState } from 'react';
import { Call02Icon, MoreVerticalIcon, PinIcon, AtIcon } from 'hugeicons-react';
import MessageOptionsOverlay from './MessageOptionsOverlay';
import RoomDetailsOverlay from './RoomDetailsOverlay';

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
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const handleOptionsClick = () => {
    setShowOptions(!showOptions);
  };

  const handleCloseOptions = () => {
    setShowOptions(false);
    onSearch(null);
  };

  const handleOpenRoomDetails = () => {
    setShowOptions(false); // Close the dropdown menu
    setShowRoomDetails(true); // Open the room details modal
  };


  return (
    <div className='message-header'>
      <div className="header-info">
        <div className="header-title-group">
          <h1>{roomData?.displayName || roomData?.name}</h1>
          {userEmail && <h2>{userEmail}</h2>}
        </div>
        <div className="header-badges">
          <div className="pin-info" onClick={onPinClick}>
            <PinIcon size={16} className={`header-pin-icon ${isPinnedOpen ? 'active' : ''}`} />
            <span>{pinnedCount} pinned</span>
          </div>
          <div className="mention-info" onClick={onMentionsClick}>
            <AtIcon size={16} className={`header-mention-icon ${isMentionsOpen ? 'active' : ''}`} />
            <span>{mentionsCount} mentions</span>
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
              onClose={handleCloseOptions}
              onOpenRoomDetails={handleOpenRoomDetails}
              messages={messages}
              users={users}
              onSearch={onSearch}
              roomData={roomData}
            />
          )}
        </div>
      </div>
      {showRoomDetails && (
        <RoomDetailsOverlay
          roomData={roomData}
          messages={messages}
          onClose={() => setShowRoomDetails(false)}
        />
      )}
    </div>
  );
};

export default MessageHeader;