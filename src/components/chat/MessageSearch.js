import React, { useState, useEffect, useCallback } from 'react';
import { Search02Icon, Calendar02Icon   , UserIcon, FilterIcon } from 'hugeicons-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const MessageSearch = ({ onSearch, messages = [], users= []}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedUser, setSelectedUser] = useState('');
  const [messageType, setMessageType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);




 
  const handleSearch = useCallback(() => {
    if (!Array.isArray(messages)) return;
    
    const [startDate, endDate] = dateRange;
    
    if (!searchTerm && !startDate && !endDate && !selectedUser && messageType === 'all') {
      onSearch(null); // Reset search if no filters active
      return;
    }
    
    const filteredMessages = messages.filter(message => {
      const matchesText = message.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || !endDate) ? true : 
        (new Date(message.timestamp) >= startDate && new Date(message.timestamp) <= endDate);
      const matchesUser = !selectedUser || message.sender === selectedUser;
      const matchesType = messageType === 'all' || message.type === messageType;
      
      return matchesText && matchesDate && matchesUser && matchesType;
    });
    
    onSearch(filteredMessages);
  }, [searchTerm, dateRange, selectedUser, messageType, messages, onSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300); // Add debounce to prevent too many updates

    return () => clearTimeout(debounceTimer);
  }, [handleSearch]);


  return (
    <div className="message-search">
      <div className="search-bar">
        <Search02Icon size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
         
          }}
        />
        <button 
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterIcon size={20} />
        </button>
      </div>
      
      {showFilters && (
        <div className="search-filters">
          <div className="date-filter">
            <Calendar02Icon size={18} />
            <DatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={(dates) => setDateRange(dates)}
              placeholderText="Select date range"
            />
          </div>
          
          <div className="user-filter">
            <UserIcon size={18} />
            <select 
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          
          <div className="type-filter">
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
              <option value="file">Files</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSearch;