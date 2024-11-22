import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [permission, setPermission] = useState(Notification.permission);

  const requestPermission = async () => {
    try {
      // Check if the browser supports notifications
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const showNotification = (title, options = {}) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }
  
    if (Notification.permission === 'granted' && document.hidden) {
      new Notification(title, {
        ...options,
        icon: options.icon || '/logo192.png',
        silent: false
      });
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted' && document.hidden) {
          new Notification(title, {
            ...options,
            icon: options.icon || '/logo192.png',
            silent: false
          });
        }
      });
    }
  };

  // Request permission when the component mounts if not already set
  useEffect(() => {
    if (permission === 'default') {
      requestPermission();
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ permission, requestPermission, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);