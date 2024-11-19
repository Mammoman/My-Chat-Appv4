import React from 'react';

const DateDivider = ({ date }) => {
  return (
    <div className="date-divider">
      <div className="date-line"></div>
      <span className="date-text">{date}</span>
      <div className="date-line"></div>
    </div>
  );
};

export default DateDivider;