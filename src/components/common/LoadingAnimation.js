import React from 'react';
import '../../styles/common/LoadingAnimation.css';

const LoadingAnimation = () => {
  return (
    <div className="message-loading-container">
      <div className="message-loading">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;