import React, { useEffect, useState, useRef } from 'react';
import { 
  addDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp, 
  query, 
  orderBy,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Call02Icon, PlusSignIcon, Cancel02Icon, MoreVerticalIcon, TelegramIcon } from 'hugeicons-react';
import ChatRequestPopup from './ChatRequestPopup';
import '../../styles/chat/MessageArea.css';
import '../../styles/chat/Reactions.css';

const Chat = ({ room }) => {
  const [roomData, setRoomData] = useState(null);
  const messageContentRef = useRef(null)
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const reactions = ['🔥', '🙌', '👍', '😊','🫠','😭'];

  const scrollToBottom = () => {
    if (messageContentRef.current) {
      messageContentRef.current.scrollTop = messageContentRef.current.scrollHeight;
    }
  };

  const handleReaction = async (messageId, reaction) => {
    try {
      const messageRef = doc(db, 'rooms', room, 'Messages', messageId);
      const messageDoc = await getDoc(messageRef);
      const currentReactions = messageDoc.data().reactions || {};
      
      // Toggle reaction for current user
      if (currentReactions[reaction]?.includes(auth.currentUser.uid)) {
        await updateDoc(messageRef, {
          [`reactions.${reaction}`]: arrayRemove(auth.currentUser.uid)
        });
      } else {
        await updateDoc(messageRef, {
          [`reactions.${reaction}`]: arrayUnion(auth.currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
  };

  useEffect(() => {
    if (!room) return;

    const fetchRoomData = async () => {
      try {
        const roomRef = doc(db, 'rooms', room);
        const roomDoc = await getDoc(roomRef);
        
        if (roomDoc.exists()) {
          setRoomData(roomDoc.data());
        }
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    };

    fetchRoomData();
  }, [room]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room) return;

    const checkRoomCreator = async () => {
      const roomRef = doc(db, 'rooms', room);
      const roomDoc = await getDoc(roomRef);
      
      if (roomDoc.exists()) {

        setIsRoomCreator(roomDoc.data().createdBy === auth.currentUser?.uid);
      }
    };

    checkRoomCreator();
  }, [room]);

  useEffect(() => {
    if (!room) return;

    const messagesRef = collection(db, 'rooms', room, 'Messages');
    const queryMessages = query(messagesRef, orderBy("createdAt"));
    
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room || newMessage === "") return;

    try {
      const messagesRef = collection(db, 'rooms', room, 'Messages');
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        user: auth.currentUser ? auth.currentUser.email : 'Guest',
        room,
        replyTo: selectedReply ? {
          id: selectedReply.id,
          text: selectedReply.text,
          user: selectedReply.user
        } : null
      });
      setNewMessage("");
      setSelectedReply(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    if (!room) return;

    const roomRef = doc(db, 'rooms', room);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      const roomData = snapshot.data();
      if (roomData?.pendingRequests?.length > 0 && roomData.createdBy === auth.currentUser?.uid) {
        const requestingUser = roomData.pendingRequests[0];
        setJoinRequest({
          uid: requestingUser.uid,
          email: requestingUser.email
        });
      }
    });

    return () => unsubscribe();
  }, [room]);


  const handleJoinRequest = async (accepted) => {
    if (!joinRequest || !room) return;

    try {
      const roomRef = doc(db, 'rooms', room);
      const roomDoc = await getDoc(roomRef);
      const roomData = roomDoc.data();

      if (accepted) {
        await updateDoc(roomRef, {
          participants: arrayUnion(joinRequest.uid),
          pendingRequests: roomData.pendingRequests.filter(
            req => req.uid !== joinRequest.uid
          )
        });
      } else {
        await updateDoc(roomRef, {
          pendingRequests: roomData.pendingRequests.filter(
            req => req.uid !== joinRequest.uid
          )
        });
      }
      setJoinRequest(null);
    } catch (error) {
      console.error("Error handling join request:", error);
    }
  };

  const handleReply = (message) => {
    setSelectedReply(message);
    messageContentRef.current?.focus();
  };

  const handleMessageClick = (messageId) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  return (
    <div className="message-area">
      {!room ? (
        <div className="no-chat-selected">
          <p>Select a chat to start messaging</p>
        </div>
      ) : (
        <>
          <div className='message-header'>
            <div className="header-info">
            <h1>Welcome to: {roomData?.displayName || roomData?.name}</h1>
              {userEmail ? (
                <>
                  <h2>User Email: {userEmail}</h2>
                 
                </>
              ) : (
                <p>User not authenticated</p>
              )}
            </div>
            <div className="header-actions">
            <span className="member-count">
                {roomData?.participants?.length || 0} members
              </span>
              <button className="action-btn"><Call02Icon className='phone-ma-btn'/></button>
              <button className="action-btn"><MoreVerticalIcon className='ellipsisV-ma-btn'/></button>


            </div>
          </div>
          
          <div className="message-content" ref={messageContentRef}> 
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.user === userEmail ? 'sent' : 'received'}`}
                onClick={() => handleMessageClick(message.id)}
              >
                <div className="message-user-avatar">
                  {message.user.charAt(0).toUpperCase()}
                </div>


                <div className="message-content-wrapper">
                  <span className="message-user-email">{message.user}</span>
                  <div className="message-bubble-wrapper">
                  <div className="message-bubble">
                    {message.replyTo && (
                      <div className="reply-content">
                        <span className="reply-user">{message.replyTo.user}</span>
                        <p className="reply-text">{message.replyTo.text}</p>
                      </div>
                    )}
                    <p>{message.text}</p>
                  </div>
                
                  <div className="reactions-container">
  <div className="reactions-popup">
    {reactions.map((reaction, index) => (
      <button
        key={reaction}
        className="reaction-btn"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={(e) => {
          e.stopPropagation();
          handleReaction(message.id, reaction);
        }}
      >
        {reaction}
      </button>
    ))}
  </div>
  
  <div className="reaction-badges">
    {message.reactions && Object.entries(message.reactions).map(([reaction, users], index) => 
      users.length > 0 && (
        <div 
        key={reaction} 
        className="reaction-badge"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <span className="reaction-emoji">{reaction}</span>
        <span className="reaction-count">{users.length}</span>
        <div className="reaction-tooltip">
          {users.join(', ')}
        </div>
      </div>
      )
    )}
  </div>
</div>

                  </div>
                
                  <span className="message-status">
                    {message.createdAt ? (
                      <span className="status-icon status-received">✓✓</span>
                    ) : (
                      <span className="status-icon status-pending">⏳</span>
                    )}
                  </span>
                                
                                {selectedMessageId === message.id && (
                  <div className="message-overlay">
                      <button 
                        className="overlay-reply-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReply(message);
                          setSelectedMessageId(null);
                        }}
                      >
                        Reply
                      </button>
                  </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        
          <form onSubmit={handleSubmit} className='message-box'>
            
            {selectedReply && (
              <div className="reply-preview">
                <div className="reply-preview-content">
                  <span className="reply-user">{selectedReply.user}</span>
                  <p className="reply-text">{selectedReply.text}</p>
                </div>
                <button 
                  type="button" 
                  className="cancel-reply" 
                  onClick={() => setSelectedReply(null)}
                >
                  <Cancel02Icon/>
                </button>
              </div>
            )}
            <div className="message-box">
              <button className="action-btn plus-btn" type="button">
                <PlusSignIcon />
              </button>
              <input
                type="text"
                className='message-input'
                placeholder='Type here...'
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
              />
              <button type='submit' className='action-btn plus-btn'>
                <TelegramIcon/>
              </button>
              </div>
          </form>
          
        
         
          {isRoomCreator && joinRequest && (
            <ChatRequestPopup
              requestingUser={joinRequest}
              onAccept={() => handleJoinRequest(true)}
              onDecline={() => handleJoinRequest(false)}
            />
          )}
        </>
      )}
    </div>
    
  );
};

export default Chat;