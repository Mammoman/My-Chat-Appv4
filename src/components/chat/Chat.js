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
  deleteDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Call02Icon, PlusSignIcon, Cancel02Icon, MoreVerticalIcon, TelegramIcon, StopIcon, Mic02Icon } from 'hugeicons-react';
import ChatRequestPopup from './ChatRequestPopup';
import '../../styles/chat/MessageArea.css';
import '../../styles/chat/Reactions.css';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import MessageActions from './MessageActions';
import VoicePreview from './VoicePreview';

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
  const reactions = ['🔥', '🙌', '🤬', '😊','🫠','😭'];
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  const MAX_DURATION = 60; // Maximum duration in seconds

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

        // Prevent scroll position change
    const messageElement = document.getElementById(`message-${messageId}`);
    const currentScroll = messageElement?.parentElement?.scrollTop;
      
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


       // Restore scroll position
    if (messageElement?.parentElement && currentScroll) {
      messageElement.parentElement.scrollTop = currentScroll;
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
    const lastMessage = messages[messages.length - 1];
    const shouldScroll = lastMessage?.user === auth.currentUser?.email && 
                        lastMessage?.createdAt === null;
    
    if (shouldScroll) {
      scrollToBottom();
    }
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

    // Clear message and reply state immediately
    const messageToSend = newMessage;
    const replyToSend = selectedReply;
    setNewMessage("");
    setSelectedReply(null);

    try {
      const messagesRef = collection(db, 'rooms', room, 'Messages');
      await addDoc(messagesRef, {
        text: messageToSend,
        type: 'text',
        createdAt: serverTimestamp(),
        user: auth.currentUser ? auth.currentUser.email : 'Guest',
        room,
        replyTo: replyToSend ? {
          id: replyToSend.id,
          text: replyToSend.text,
          user: replyToSend.user,
          type: replyToSend.type
        } : null
      });
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore the message if sending fails
      setNewMessage(messageToSend);
      setSelectedReply(replyToSend);
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
    if ( message.type === 'voice') {
      setSelectedReply({
        id: message.id,
        text: message.type === 'voice' ? '🎤 Voice message' : message.text,
        user: message.user,
        type: message.type
      });
      messageContentRef.current?.focus();
    }  else {
      setSelectedReply({
        id: message.id,
        text: message.text,
        user: message.user,
        type: message.type || 'text'  // Default to 'text' for normal messages
      });
    }; 
       
       // Focus the input immediately
  setTimeout(() => {
    inputRef.current?.focus();
  }, 0);

  };


  const scrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight');
      setTimeout(() => messageElement.classList.remove('highlight'), 2000);
    }
  };


  const handleDeleteMessage = async (message) => {
    try {
      const messageElement = document.getElementById(`message-${message.id}`);
      const currentScroll = messageElement?.parentElement?.scrollTop;
      
      const messageRef = doc(db, 'rooms', room, 'Messages', message.id);
      await deleteDoc(messageRef);
      setSelectedMessageId(null);
      
      // Restore scroll position after a short delay to allow for DOM updates
      setTimeout(() => {
        if (messageElement?.parentElement && currentScroll) {
          messageElement.parentElement.scrollTop = currentScroll;
        }
      }, 50);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };




  const handleMessageClick = (messageId) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setRecordingDuration(0);
      setShowPreview(false);
      setPreviewAudio(null);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudio({ blob: audioBlob, url: audioUrl });
        setShowPreview(true);
      };

      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const cancelRecording = () => {
    setShowPreview(false);
    setPreviewAudio(null);
    setRecordingDuration(0);
  };

  const sendVoiceMessage = async () => {
    if (!previewAudio) return;

    // Store reply state before clearing
    const replyToSend = selectedReply;
    setSelectedReply(null);
    setShowPreview(false);

    const reader = new FileReader();
    reader.readAsDataURL(previewAudio.blob);
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      
      try {
        const messagesRef = collection(db, 'rooms', room, 'Messages');
        await addDoc(messagesRef, {
          type: 'voice',
          audioData: base64Audio,
          duration: recordingDuration,
          createdAt: serverTimestamp(),
          user: auth.currentUser.email,
          room,
          replyTo: replyToSend ? {
            id: replyToSend.id,
            text: replyToSend.text,
            user: replyToSend.user,
            type: replyToSend.type
          } : null
        });
        
        // Reset states after successful send
        setPreviewAudio(null);
        setRecordingDuration(0);
      } catch (error) {
        console.error("Error sending voice message:", error);
        // Restore states if sending fails
        setSelectedReply(replyToSend);
        setShowPreview(true);
      }
    };
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                id={`message-${message.id}`}
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
                      <div 
                        className="reply-reference"
                        onClick={(e) => {
                          e.stopPropagation();
                          scrollToMessage(message.replyTo.id);
                        }}
                      >
                        <div className="reply-preview-content">
                          <span className="reply-user">{message.replyTo.user}</span>
                          <p className="reply-text">
                            {message.replyTo.type === 'voice' ? (
                              <span>🎤 Voice message</span>
                            ) : (
                              message.replyTo.text
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                    {message.type === 'voice' ? (
                      <VoiceMessagePlayer 
                        audioUrl={message.audioData} 
                        duration={message.duration}
                        isSent={message.userId === auth.currentUser?.uid}
                      />
                    ) : (
                      <p>{message.text}</p>
                    )}
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
                                
                                <MessageActions 
                                  message={message}
                                  onReply={(msg) => {
                                    handleReply(msg);
                                    setSelectedMessageId(null);
                                  }}
                                  onDelete={handleDeleteMessage}
                                  isSelected={selectedMessageId === message.id}
                                  canDelete={message.user === auth.currentUser?.email}
                                />
                </div>
              </div>
            ))}
          </div>
        
          <form onSubmit={handleSubmit} className='message-box'>
            
            {selectedReply && (
              <div className="reply-preview">
                <div className="reply-preview-content">
                  <span className="reply-user">{selectedReply.user}</span>
                  <p className="reply-text">
                    {selectedReply.type === 'voice' ? (
                      <span>🎤 Voice message</span>
                    ) : (
                      selectedReply.text
                    )}
                  </p>
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
              {showPreview ? (
                     <VoicePreview 
                     audioUrl={previewAudio?.url}
                     onCancel={cancelRecording}
                     onSend={sendVoiceMessage}
                   />
              ) : (
                <>
                  <input
                   ref={inputRef}
                    type="text"
                    className='message-input'
                    placeholder='Type here...'
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  />
                  <button 
                    type="button" 
                    className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <div className="recording-indicator">
                        <StopIcon />
                        <span className="duration">{formatDuration(recordingDuration)}</span>
                      </div>
                    ) : (
                      <Mic02Icon />
                    )}
                  </button>
                </>
              )}
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