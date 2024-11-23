import React                                                                              from 'react';
import { useState }                                                                       from 'react';
import { Settings02Icon, Folder01Icon, Logout02Icon, Home04Icon }                          from 'hugeicons-react';
import { useNavigate }                                                                    from 'react-router-dom';
import { auth }                                                                           from '../../config/firebase';
import                                                                                    '../../styles/chat/Sidebar.css';
import Settings                                                                            from '../settings/Settings';
const Sidebar = ({ signUserOut, onFilterChange }) => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [showSettings, setShowSettings] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
 
 
  
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const handleSignOut = async () => {
    try {
      await signUserOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
};

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="user-avatar">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-menu">
        <button
        className={`menu-item-all-icon ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => handleFilterClick('all')}>
          <Home04Icon />
          <p>All</p>
        </button>

        <button 
         className={`menu-item-private-icon ${activeFilter === 'private' ? 'active' : ''}`}
         onClick={() => handleFilterClick('private')}>
          <Folder01Icon className="private-icon" />
          <p>Private</p>
        </button>

        <button 
         className={`menu-item-public-icon ${activeFilter === 'public' ? 'active' : ''}`}
         onClick={() => handleFilterClick('public')}>
          <Folder01Icon className="public-icon" />
          <p>Public</p>
        </button>
         
      </div>

      <div className="sidebar-bottom">
        <button className="menu-item-settings-icon" onClick={toggleSettings}>
          <Settings02Icon />
          <p>Settings</p>
        </button>
        
        <button className="menu-item-logout-icon" onClick={handleSignOut}>
          <Logout02Icon />
          <p>Logout</p>
        </button>
      </div>
      {showSettings && (
                <div className="settings-overlay">
                    <Settings />
                    <button className="close-settings" onClick={toggleSettings}>Close</button>
                </div>
            )}
    </div>
  );
};

export default Sidebar;