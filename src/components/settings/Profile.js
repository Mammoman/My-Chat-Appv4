import React, { useState } from 'react';
import '../../styles/settings/Profile.css';

const Profile = () => {
  const [username, setUsername] = useState('@ddd');
  const [profilePicture, setProfilePicture] = useState('/path/to/default.jpg');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePictureChange = (newPicture) => {
    setProfilePicture(newPicture);
  };

  return (
    <div className="profile-settings">
      <h3>Profile picture</h3>
      <div className="profile-picture">
        <img src={profilePicture} alt="Profile" />
        <div className='profile-picture-option'> 
          <ProfilePictureSelector onSelect={handlePictureChange} />
        </div>
      </div>
      <label>Profile name</label>
      <input type="text" defaultValue="Dayniel" />
      <label>Username</label>
      <input type="text" value={username} onChange={handleUsernameChange} />
      <label>About me</label>
      <textarea defaultValue="What can I say?" />
      <button className="save-changes">Save changes</button>
    </div>
  );
};

const ProfilePictureSelector = ({ onSelect }) => {
  const dummyPictures = [
    '/path/to/dummy1.jpg',
    '/path/to/dummy2.jpg',
    '/path/to/dummy3.jpg',
    '/path/to/dummy4.jpg',
    '/path/to/dummy5.jpg',
  ];

  return (
    <div className="profile-picture-selector">
      {dummyPictures.map((picture, index) => (
        <img
          key={index}
          src={picture}
          alt={`Dummy ${index + 1}`}
          onClick={() => onSelect(picture)}
          style={{ cursor: 'pointer', margin: '5px', width: '50px', height: '50px' }}
        />
      ))}
    </div>
  );
};

export default Profile;