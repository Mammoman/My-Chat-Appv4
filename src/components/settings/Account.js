
import React from 'react';

const Account = () => {
  return (
    <div className="account-settings">
      <h3>Account Settings</h3>
      {/* Add account-related fields here */}
      <label>Email</label>
      <input type="email" defaultValue="example@example.com" />
      <label>Password</label>
      <input type="password" placeholder="Change password" />
      <button>Save changes</button>
    </div>
  );
};

export default Account;