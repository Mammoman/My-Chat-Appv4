import React, { useState, useEffect, useCallback } from 'react';
import { Search02Icon, Calendar02Icon, UserIcon, FilterIcon } from 'hugeicons-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const MessageSearch = ({ onSearch, messages = [], users = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedUser, setSelectedUser] = useState('');
  const [messageType, setMessageType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);



  const handleFilterChange = useCallback((type, value) => {
    switch(type) {
      case 'date':
        setDateRange(value);
        break;
      case 'user':
        setSelectedUser(value);
        break;
      case 'type':
        setMessageType(value);
        break;
      default:
        break;  
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (!Array.isArray(messages)) return;
    
    const [startDate, endDate] = dateRange;
    
    if (!searchTerm && !startDate && !endDate && !selectedUser && messageType === 'all') {
      onSearch(null);
      return;
    }
    
    const filteredMessages = messages.filter(message => {
      const matchesText = message.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = (!startDate || !endDate) ? true : 
        (new Date(message.timestamp) >= startDate && new Date(message.timestamp) <= endDate);
      const matchesUser = !selectedUser || message.sender === selectedUser;
      const matchesType = messageType === 'all' || message.type === messageType;
  
        
      return matchesText && matchesDate && matchesUser && matchesType;
    }).map(message => ({
      ...message,
      formattedTime: formatTimestamp(message.timestamp)
    }));
    
    
    onSearch(filteredMessages);
  }, [searchTerm, dateRange, selectedUser, messageType, messages, onSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(handleSearch, 500); // Increased debounce time
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, dateRange, selectedUser, messageType]); 

  const resetSearch = useCallback(() => {
    setSearchTerm('');
    setDateRange([null, null]);
    setSelectedUser('');
    setMessageType('all');
    setShowFilters(false);
    onSearch(null);
  }, [onSearch]);


  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };


     
 

  return (
    <div className="message-search">
      <div className="search-bar">
        <Search02Icon size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Search messages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              onChange={(dates) => handleFilterChange('date', dates)}
              placeholderText="Select date range"
            />
          </div>
          
          <div className="user-filter">
            <UserIcon size={18} />
            <select 
              value={selectedUser}
              onChange={(e) => handleFilterChange('user', e.target.value)}
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
              onChange={(e) => handleFilterChange('type', e.target.value)}
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