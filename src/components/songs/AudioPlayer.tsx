import React, { useRef, useEffect, useState } from 'react';
import H5AudioPlayer, { RHAP_UI } from 'react-h5-audio-player';
import { Music2, Volume2, VolumeX, BarChart2 } from 'lucide-react';
import type { Song } from '@/types';
import { usePlaybackTracking } from '@/hooks/usePlaybackTracking';
import { formatDuration } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import VolumeVisualizer from '../visualizers/VolumeVisualizer';

interface AudioPlayerProps {
  song: Song | null;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ song }) => {
  const { user } = useAuthStore();
  const { volume, setVolume } = usePlayerStore();
  const playerRef = useRef<H5AudioPlayer>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (playerRef.current) {
      audioRef.current = playerRef.current.audio.current;
      if (audioRef.current) {
        audioRef.current.volume = volume;
      }
    }
  }, [volume]);

  usePlaybackTracking(song, audioRef);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted;
      audioRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
        audioRef.current.volume = 0;
      } else {
        setVolume(1);
        audioRef.current.volume = 1;
      }
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  if (!song) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-primary-black/95 backdrop-blur-sm border-t border-primary-gray/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          {/* Song Info */}
          <div className="flex items-center gap-4 min-w-[240px]">
            <div className="relative group">
              <img
                src={song.coverUrl}
                alt={song.title}
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <Music2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate text-lg">{song.title}</h4>
              <p className="text-sm text-primary-gray truncate">{song.artist}</p>
            </div>
            {user?.role === 'admin' && (
              <Link 
                to={`/analytics/songs/${song.id}`}
                className="p-2 hover:text-accent-blue transition-colors"
                title="View Analytics"
              >
                <BarChart2 className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Audio Player */}
          <div className="flex-1">
            <H5AudioPlayer
              ref={playerRef}
              src={song.audioUrl}
              onListen={handleTimeUpdate}
              onPlay={handlePlay}
              onPause={handlePause}
              showJumpControls={false}
              layout="horizontal"
              customProgressBarSection={[
                RHAP_UI.CURRENT_TIME,
                RHAP_UI.PROGRESS_BAR,
                RHAP_UI.DURATION,
              ]}
              customControlsSection={[
                RHAP_UI.MAIN_CONTROLS,
              ]}
              autoPlayAfterSrcChange={false}
              className="rhap_custom-player"
            />
          </div>

          {/* Volume Control */}
          <div 
            className="relative flex items-center gap-2 min-w-[120px]"
            onMouseEnter={() => setIsVolumeVisible(true)}
            onMouseLeave={() => setIsVolumeVisible(false)}
          >
            <button 
              onClick={toggleMute} 
              className="p-2 hover:text-accent-blue transition"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
            
            <div className={`absolute bottom-full left-0 mb-2 p-2 bg-primary-black/90 rounded-lg transition-opacity duration-200 ${
              isVolumeVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
              <div className="h-32 flex flex-col items-center gap-2">
                <VolumeVisualizer 
                  volume={volume} 
                  className="h-24 w-12"
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-full appearance-none bg-transparent cursor-pointer writing-mode-vertical"
                  style={{
                    writingMode: 'bt-lr',
                    WebkitAppearance: 'slider-vertical'
                  }}
                />
                <span className="text-xs text-primary-gray">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            <div className="text-sm text-primary-gray">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
          </div>
        </div>

        {/* Progress Mini Display */}
        <div className="h-1 w-full bg-primary-gray/20">
          <div
            className="h-full bg-accent-blue transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;