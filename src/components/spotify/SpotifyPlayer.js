import React, { useState, useEffect } from 'react';
import { auth, db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getSpotifyToken } from '../../config/spotify';


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
          getOAuthToken: cb => cb('BQCryZ0c2kanc1z4kEE4bDCABxFYwe7ha2ck98kNoVWPTSUpWCyLBN97f5N4Ea2uu6pGNkTUbNEtpBqyCq2kD78zxug5gLliipHUb06qOK_qljssRrTTwRlLDYTRluvRlej_JMwthX00prlgB3jkePY9BFLZsxv-nEuxnjDFZpLm6bNOOw0OUuvILmveDUAnjgJl3ueHg-bbnvUyvEvZF8HClCwcty_3lyZzf5fwIHjz22PpWmPLWVEVED7GT3jjnk2yfK4tq1RxA0Cxx-QV5RagOP7-2wmf')
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
      {currentTrack && (
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