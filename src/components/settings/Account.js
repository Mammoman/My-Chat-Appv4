
import React                                                              from 'react';
import                                                                      '../../styles/settings/Account.css';

const Account = () => {
  return (
    <div className="account-settings">
      <h3>Account Stats</h3>
      {/* Add account-related fields here */}

      <label>Email</label>
      <input 
      type="email" 
      defaultValue="...@gmail.com" 
      />

      <label>Password</label>
      <input 
      type="password" 
      placeholder="Change password" 
      />

      <button>Save changes</button>


      <div className="Account-info-grid">
              <div className="Account-info-stat">
              <label>Total Rooms Created</label>
                <span className="Account-stat-number">
                              0
                </span>
                
              </div>

              <div className="Account-info-stat">
                <span className="Account-stat-number">
                0
          </span>
          <label>Total Messages Sent</label>
        </div>

        <div className="Account-info-stat">
                <span className="Account-stat-number">
                              0
                </span>
                <label> Rooms Joined</label>
              </div>

              <div className="Account-info-stat">
                <span className="Account-stat-number">
                              0
                </span>
                <label> Rooms Participated</label>
              </div>
      </div>

    </div>
  );
};

export default Account;