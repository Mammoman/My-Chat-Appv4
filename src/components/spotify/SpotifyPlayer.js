import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getSpotifyToken, loginWithSpotify } from '../../config/spotify';


const SpotifyPlayer = ({ room }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const initializePlayer = async () => {
      const token = await getSpotifyToken();
      if (!token) return;
  
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
  
      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Chat Room Player',
          getOAuthToken: cb => {
            getSpotifyToken().then(token => cb(token));
          }
        });
  
        setPlayer(spotifyPlayer);
        
        spotifyPlayer.addListener('player_state_changed', state => {
          if (state) {
            setCurrentTrack(state.track_window.current_track);
            setIsPlaying(!state.paused);
          }
        });
  
        spotifyPlayer.connect();
      };
    };
  
    initializePlayer();
  }, []);
  const handlePlayPause = async () => {
    if (!player) return;

    if (isPlaying) {
      await player.pause();
    } else {
      await player.resume();
    }
    
    // Update room's current track
    const roomRef = doc(db, 'rooms', room);
    await updateDoc(roomRef, {
      currentTrack: currentTrack,
      isPlaying: !isPlaying
    });
  };

  return (
    <div className="spotify-player">
         {!player ? (
      <button onClick={loginWithSpotify} className="spotify-connect-btn">
        Connect to Spotify
      </button>
    ) : currentTrack && (
      <>
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name} 
          />
          <div className="track-info">
            <h3>{currentTrack.name}</h3>
            <p>{currentTrack.artists[0].name}</p>
          </div>
          <button onClick={handlePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </>
      )}
    </div>
  );
};

export default SpotifyPlayer;