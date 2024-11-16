import { auth, db } from './firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';


const CLIENT_ID = '38b68bad4c774264bf09a8465911d215';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPE = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

export const loginWithSpotify = () => {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
  window.location.href = authUrl;
};

export const handleSpotifyCallback = async () => {
  try {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (!accessToken) {
      console.error('No access token found');
      return null;
    }

    if (!auth.currentUser) {
      console.error('No authenticated user');
      return null;
    }

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: auth.currentUser.email,
        createdAt: serverTimestamp(),
        spotifyToken: accessToken,
        spotifyTokenTimestamp: Date.now()
      });
    } else {
      await updateDoc(userRef, {
        spotifyToken: accessToken,
        spotifyTokenTimestamp: Date.now()
      });
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error in handleSpotifyCallback:', error);
    return null;
  }
};

export const getSpotifyToken = async () => {
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  
  if (!userData?.spotifyToken) return null;
  
  // Check if token is expired (tokens last 1 hour)
  const tokenAge = Date.now() - userData.spotifyTokenTimestamp;
  if (tokenAge > 3600000) {
    // Token expired, need to re-authenticate
    loginWithSpotify();
    return null;
  }
  
  return userData.spotifyToken;
};