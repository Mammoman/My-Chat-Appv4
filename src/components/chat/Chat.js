import React, { useEffect, useState, useRef }                                         from 'react';
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
  getDocs,
  writeBatch
}                                                                                     from 'firebase/firestore';
import { auth, db }                                                                   from '../../config/firebase';
import { onAuthStateChanged }                                                         from 'firebase/auth';
import ChatRequestPopup                                                               from './ChatRequestPopup';
import                                                                                '../../styles/chat/MessageArea.css';
import                                                                               '../../styles/chat/Reactions.css';
import MessageInput from './MessageInput';
import MessageHeader from './MessageHeader';
import MessageContent from './MessageContent';

import PinnedMessagesOverlay from './PinnedMessagesOverlay';



const Chat = ({ room, onError }) => {
  const [roomData, setRoomData] = useState(null);
  const messageContentRef = useRef(null)
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [users, setUsers] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [joinRequest, setJoinRequest] = useState(null);
  const [isRoomCreator, setIsRoomCreator] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const reactions = ['🔥', '😂', '🤬', '😊','🫠','😭','➕'];
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      const currentData = messageDoc.data();
      
      // Initialize reactions object if it doesn't exist
      const currentReactions = currentData.reactions || {};
      const currentUsers = currentReactions[reaction] || [];
      
      console.log('Current reactions:', currentReactions); // Debug
      console.log('Current user:', auth.currentUser.uid); // Debug
      
      // Check if user already reacted
      const userIndex = currentUsers.indexOf(auth.currentUser.email);
      
      if (userIndex > -1) {
        // Remove user's reaction
        currentUsers.splice(userIndex, 1);
      } else {
        // Add user's reaction
        currentUsers.push(auth.currentUser.email);
      }
      
      // Update the reactions in Firestore
      await updateDoc(messageRef, {
        reactions: {
          ...currentReactions,
          [reaction]: currentUsers
        }
      });

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
    setIsLoading(true); // Set loading when room changes

    const messagesRef = collection(db, 'rooms', room, 'Messages');
    const queryMessages = query(messagesRef, orderBy("createdAt"));
    
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
      setIsLoading(false);
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

    const messageToSend = newMessage;
    const replyToSend = selectedReply;
    setNewMessage("");
    setSelectedReply(null);

    try {
      const messagesRef = collection(db, 'rooms', room, 'Messages');
      
      // If replying to a message, check its current state
      let replyToData = null;
      if (replyToSend) {
        const replyMessageRef = doc(db, 'rooms', room, 'Messages', replyToSend.id);
        const replyMessageDoc = await getDoc(replyMessageRef);
        
        if (replyMessageDoc.exists()) {
          const replyMessageData = replyMessageDoc.data();
          replyToData = {
            id: replyToSend.id,
            text: replyMessageData.deleted ? "Message has been deleted" : replyToSend.text,
            user: replyToSend.user,
            type: replyToSend.type,
            deleted: replyMessageData.deleted || false
          };
        }
      }

      await addDoc(messagesRef, {
        text: messageToSend,
        type: 'text',
        createdAt: serverTimestamp(),
        user: auth.currentUser ? auth.currentUser.email : 'Guest',
        room,
        replyTo: replyToData
      });
    } catch (error) {
      console.error("Error sending message:", error);
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
      
      if (message.deleted) {
        // If message is already deleted, remove it and all references to it
        const messagesRef = collection(db, 'rooms', room, 'Messages');
        const q = query(messagesRef);
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        
        // Delete the original message
        batch.delete(messageRef);
        
        // Delete all messages that reference this message
        querySnapshot.forEach((doc) => {
          const messageData = doc.data();
          if (messageData.replyTo && messageData.replyTo.id === message.id) {
            batch.delete(doc.ref);
          }
        });
        
        await batch.commit();
      } else {
        // First deletion - mark as deleted
        await updateDoc(messageRef, {
          deleted: true,
          text: "Message has been deleted",
          reactions: {} // Clear any reactions
        });

        // Update all messages that reference this message
        const messagesRef = collection(db, 'rooms', room, 'Messages');
        const q = query(messagesRef);
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          const messageData = doc.data();
          if (messageData.replyTo && messageData.replyTo.id === message.id) {
            batch.update(doc.ref, {
              'replyTo.deleted': true,
              'replyTo.text': 'Message has been deleted'
            });
          }
        });
        await batch.commit();
      }
      
      setSelectedMessageId(null);
      
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

  const handlePinMessage = async (messageId) => {
    try {
      const messageRef = doc(db, 'rooms', room, 'Messages', messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const currentPinned = messageDoc.data().pinned || false;
        await updateDoc(messageRef, {
          pinned: !currentPinned,
          pinnedAt: !currentPinned ? serverTimestamp() : null,
          pinnedBy: !currentPinned ? auth.currentUser.email : null
        });
      }
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const handleSearch = (results) => {
    setSearchResults(results);
  };


  const pinnedCount = messages.filter(msg => msg.pinned).length;

  return (
    <div className="message-area">
           {room && (
        <>
          <MessageHeader 
              roomData={roomData}
              userEmail={userEmail}
              pinnedCount={pinnedCount}
              onPinClick={() => setIsPinnedOpen(!isPinnedOpen)}
              isPinnedOpen={isPinnedOpen}
              messages={messages}
              users={users}
              onSearch={handleSearch}
          />
          
          {isPinnedOpen && (
            <PinnedMessagesOverlay
              messages={messages}
              onMessageClick={scrollToMessage}
              onClose={() => setIsPinnedOpen(false)}
            />
          )}
          
          <MessageContent
                  messages={searchResults || messages}
                  userEmail={userEmail}
                  selectedMessageId={selectedMessageId}
                  handleMessageClick={handleMessageClick}
                  handleReply={handleReply}
                  handleDeleteMessage={handleDeleteMessage}
                  handlePinMessage={handlePinMessage}
                  handleReaction={handleReaction}
                  reactions={reactions}
                  messageContentRef={messageContentRef}
                  scrollToMessage={scrollToMessage}
                  auth={auth}
                  users={users}
                  isLoading={isLoading}
          />
          
          <MessageInput
            handleSubmit={handleSubmit}
            selectedReply={selectedReply}
            setSelectedReply={setSelectedReply}
            showPreview={showPreview}
            previewAudio={previewAudio}
            cancelRecording={cancelRecording}
            sendVoiceMessage={sendVoiceMessage}
            inputRef={inputRef}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            recordingDuration={recordingDuration}
            formatDuration={formatDuration}
          />

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