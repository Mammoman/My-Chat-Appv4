import React from 'react';
import { Call02Icon, MoreVerticalIcon } from 'hugeicons-react';

const MessageHeader = ({ roomData, userEmail }) => {
  return (
    <div className='message-header'>
      <div className="header-info">
        <h1>Welcome to: {roomData?.displayName || roomData?.name}</h1>
        {userEmail ? (
          <h2>User Email: {userEmail}</h2>
        ) : (
          <p>User not authenticated</p>
        )}
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