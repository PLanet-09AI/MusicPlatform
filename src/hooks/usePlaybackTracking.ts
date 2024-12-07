import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ListeningMetricsService } from '@/lib/analytics/listeningMetrics';
import { getDeviceInfo } from '@/lib/utils/device';
import type { Song } from '@/types';

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  progress: number;
}

export function usePlaybackTracking(
  song: Song | null,
  audioRef: React.RefObject<HTMLAudioElement | null>
) {
  const { user } = useAuthStore();
  const sessionRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    progress: 0,
  });

  useEffect(() => {
    if (!song || !user || !audioRef.current) return;

    const audio = audioRef.current;
    let playbackTimer: number;

    const startSession = async () => {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
        const deviceInfo = getDeviceInfo();
        
        sessionRef.current = await ListeningMetricsService.trackListeningSession({
          userId: user.id,
          songId: song.id,
          artistId: song.artistId,
          startTime: startTimeRef.current,
          duration: 0,
          completed: false,
          platform: deviceInfo.platform,
          deviceInfo: deviceInfo.userAgent
        });
      }
    };

    const endSession = async (completed: boolean) => {
      if (startTimeRef.current && sessionRef.current) {
        const endTime = new Date();
        const duration = (endTime.getTime() - startTimeRef.current.getTime()) / 1000;
        
        await ListeningMetricsService.trackListeningSession({
          userId: user.id,
          songId: song.id,
          artistId: song.artistId,
          startTime: startTimeRef.current,
          endTime,
          duration,
          completed,
          platform: getDeviceInfo().platform,
          deviceInfo: getDeviceInfo().userAgent
        });

        startTimeRef.current = null;
        sessionRef.current = null;
      }
    };

    const handlePlay = () => {
      startSession();
      updatePlaybackState();
      playbackTimer = window.setInterval(updatePlaybackState, 1000);
    };

    const handlePause = () => {
      window.clearInterval(playbackTimer);
      endSession(audio.currentTime / audio.duration >= 0.9);
      updatePlaybackState();
    };

    const handleEnded = () => {
      window.clearInterval(playbackTimer);
      endSession(true);
      updatePlaybackState();
    };

    const updatePlaybackState = () => {
      if (audio) {
        setPlaybackState({
          isPlaying: !audio.paused,
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
          volume: audio.volume,
          progress: audio.duration ? (audio.currentTime / audio.duration) : 0,
        });
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', updatePlaybackState);

    return () => {
      window.clearInterval(playbackTimer);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', updatePlaybackState);
    };
  }, [song, user, audioRef.current]);

  return playbackState;
}