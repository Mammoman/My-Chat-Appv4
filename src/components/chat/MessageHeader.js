import React from 'react';
import { Call02Icon, MoreVerticalIcon, PinIcon } from 'hugeicons-react';

const MessageHeader = ({ roomData, userEmail, pinnedCount, onPinClick, isPinnedOpen }) => {
  return (
    <div className='message-header'>
      <div className="header-info">
        <h1>Welcome to: {roomData?.displayName || roomData?.name}</h1>
        <div className="header-details">
          {userEmail && <h2>User Email: {userEmail}</h2>}
          <div className="pin-info" onClick={onPinClick}>
            <PinIcon size={18} className={`header-pin-icon ${isPinnedOpen ? 'active' : ''}`} />
            <span>{pinnedCount} pinned messages</span>
          </div>
        </div>
      </div>
      <div className="header-actions">
        <span className="member-count">
          {roomData?.participants?.length || 0} members
        </span>
        <button className="action-btn"><Call02Icon className='phone-ma-btn'/></button>
        <button className="action-btn"><MoreVerticalIcon className='ellipsisV-ma-btn'/></button>
      </div>
    </div>
  );
};

export default MessageHeader;