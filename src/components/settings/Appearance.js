import React, { useState, useEffect } from 'react';
import { Moon02Icon, Sun01Icon } from 'hugeicons-react';

const Appearance = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="appearance-settings">
      <h3>Appearance Settings</h3>
      <div className="theme-selector">
        <label>Theme</label>
        <div className="theme-options">
          <button 
            className={`theme-button ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}>
            <Moon02Icon /> Light
          </button>
          <button 
            className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}>
            <Sun01Icon /> Dark
          </button>
        </div>
      </div>
      
      <div className="font-selector">
        <label>Font Size</label>
        <select>
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
};

export default Appearance;