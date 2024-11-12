import React, { useState } from 'react';
import Profile from './Profile';
import Account from './Account';
import Appearance from './Appearance';
import UserGuide from './UserGuide';
import '../../styles/settings/Settings.css'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showUserGuide, setShowUserGuide] = useState(false);

  const handleSettingsIconClick = () => {
    setActiveTab('profile');
  };

  const handleUserGuideClick = () => {
    setShowUserGuide(true);
  };

  return (
    <>
      <div className="settings-container">
        <div className="settings-sidebar">
          <h2>Settings</h2>
          <button onClick={handleSettingsIconClick}>⚙️ Settings</button>
          <ul>
            <li onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>Profile</li>
            <li onClick={() => setActiveTab('account')} className={activeTab === 'account' ? 'active' : ''}>Account</li>
            <li onClick={() => setActiveTab('appearance')} className={activeTab === 'appearance' ? 'active' : ''}>Appearance</li>
            <li onClick={handleUserGuideClick}>UserGuide</li>
          </ul>
        </div>
        <div className="settings-content">
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'account' && <Account />}
          {activeTab === 'appearance' && <Appearance />}
        </div>
      </div>
      {showUserGuide && (
        <div className="userguide-overlay">
          <UserGuide onClose={() => setShowUserGuide(false)} />
        </div>
      )}
    </>
  );
};

export default Settings;