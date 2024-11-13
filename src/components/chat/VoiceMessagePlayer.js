import React, { useEffect, useRef, useState } from 'react';
import { PlayIcon, PauseIcon } from 'hugeicons-react';

const VoiceMessagePlayer = ({ audioUrl, duration, isSent }) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  
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
      
      ctx.fillStyle = isSent ? '#4338ca' : '#e5e7eb';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      const barWidth = (WIDTH / bufferLength) * 1.5;
      let barHeight;
      let x = 0;
      
      for(let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * HEIGHT * 0.8;
        
        ctx.fillStyle = isSent ? '#ffffff' : '#4f46e5';
        ctx.fillRect(
          x, 
          (HEIGHT - barHeight) / 2, 
          barWidth - 1, 
          barHeight
        );
        
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
  
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={`voice-message-player-container ${isSent ? 'sent' : 'received'}`}>
      <button className="play-button" onClick={togglePlay}>
        {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
      </button>
      
      <div className="waveform-container">
        <canvas ref={canvasRef} className="waveform-canvas" />
      </div>
      
      <span className="duration-display">
        {formatTime(currentTime)}
      </span>
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
};

export default VoiceMessagePlayer;
