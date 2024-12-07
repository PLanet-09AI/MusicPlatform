import React, { useEffect, useState } from 'react';
import { AnalyticsService } from '@/lib/analytics/metrics';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';
import SongCard from './SongCard';

interface RecommendedSongsProps {
  onPlay: (song: Song) => void;
}

const RecommendedSongs: React.FC<RecommendedSongsProps> = ({ onPlay }) => {
  const { user } = useAuthStore();
  const [recommendations, setRecommendations] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) return;
      
      try {
        const metrics = await AnalyticsService.getMetrics();
        setRecommendations(metrics.topSongs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          playCount: song.plays,
        } as Song)));
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [user]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-primary-gray/20 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-primary-gray/20 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Recommended for You</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((song) => (
          <SongCard
            key={song.id}
            song={song}
            onPlay={() => onPlay(song)}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendedSongs;