import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, RotateCcw } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  label?: string;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  label = 'Enregistrement vocal',
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Playback prevented:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`p-3 rounded-2xl bg-white border border-[#CDBDF2] flex items-center gap-3 shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center flex-shrink-0 shadow-xs hover:scale-105 transition-transform"
        title={isPlaying ? 'Mettre en pause' : 'Écouter'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 ml-0.5 fill-current" />
        )}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#1B2A7A] flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-[#1B2A7A]" />
            {label}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>
        </div>

        {/* Barre de lecture */}
        <div className="w-full h-1.5 bg-[#FFF6E3] rounded-full overflow-hidden border border-[#FFE15C]/40">
          <div
            className="h-full bg-[#1B2A7A] rounded-full transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {currentTime > 0 && (
        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
            }
          }}
          className="text-gray-400 hover:text-[#1B2A7A] p-1 transition-colors"
          title="Recommencer la lecture"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
};
