import React, { useEffect, useRef, useState }                                                  from 'react';
import { PlayIcon, PauseIcon }                                   from 'hugeicons-react';
import                                                                                         '../../styles/chat/VoiceMessagePlayer.css'; 

const VoiceMessagePlayer = ({ audioUrl, duration, isSent }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  
  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      
      sourceRef.current = audioContextRef.current.createMediaElementSource(audio);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!canvas) return;
      
      requestAnimationFrame(draw);
      
      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / bufferLength) * 1.2;
      let barHeight;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * HEIGHT * 0.7;
        
        const gradient = ctx.createLinearGradient(0, HEIGHT - barHeight, 0, HEIGHT);
        
        if (isSent) {
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
        } else {
          gradient.addColorStop(0, '#4f46e5');
          gradient.addColorStop(1, '#818cf8');
        }
        
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.roundRect(
          x,
          (HEIGHT - barHeight) / 2,
          barWidth - 1,
          barHeight,
          3
        );
        ctx.fill();
        
        x += barWidth + 1;
      }
    };
    
    draw();
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isSent]);
  
  const togglePlay = async () => {
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
   
  const togglePlaybackSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    audioRef.current.playbackRate = newSpeed;
    setPlaybackRate(newSpeed);
  };

  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`message-bubble voice-message ${isSent ? 'sent' : 'received'}`}>
      <div className="voice-message-player-container">
        <button className="play-button" onClick={togglePlay}>
          {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        
        <div className="waveform-container">
          <canvas ref={canvasRef} className="waveform-canvas" />
        </div>
        
        <span className="duration-display">
          {formatTime(currentTime)}
        </span>

        <button className="speed-button" onClick={togglePlaybackSpeed}>
          {playbackRate}x
        </button>
        
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

      
      </div>
    </div>
  );
};

export default VoiceMessagePlayer;
