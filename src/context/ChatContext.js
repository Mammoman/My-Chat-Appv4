import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);

    return (
        <ChatContext.Provider value={{ room, setRoom, messages, setMessages }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
}; 