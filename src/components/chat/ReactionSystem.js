import React from 'react';

const ReactionSystem = ({ message, reactions, handleReaction }) => {
  return (
    <div className="reactions-container">
      <div className="reactions-popup">
        {reactions.map((reaction, index) => (
          <button
            key={reaction}
            className="reaction-btn"
            style={{ animationDelay: `${index * 0.05}s` }}
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
            .map(([reaction, users], index) => (
              <div 
                key={reaction} 
                className="reaction-badge"
                style={{ animationDelay: `${index * 0.05}s` }}
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
  );
};

export default ReactionSystem;