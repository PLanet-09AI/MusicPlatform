import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Lock } from 'lucide-react';
import { formatDuration, formatPrice } from '@/lib/utils';
import type { Song } from '@/types';
import Button from '../ui/Button';
import { usePurchaseVerification } from '@/hooks/usePurchaseVerification';
import { useAuthStore } from '@/store/authStore';

interface SongCardProps {
  song: Song;
  onPlay: () => void;
  showPurchaseModal?: () => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, onPlay, showPurchaseModal }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { hasPurchased, isLoading } = usePurchaseVerification(song.id);

  const handlePlayClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (song.isPremium && !hasPurchased) {
      showPurchaseModal?.();
      return;
    }

    onPlay();
  };

  return (
    <div className="bg-primary-black/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="aspect-square relative group">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            onClick={handlePlayClick}
            variant="ghost"
            className="text-white hover:text-accent-blue"
          >
            {song.isPremium && !hasPurchased ? (
              <Lock className="h-12 w-12" />
            ) : (
              <Play className="h-12 w-12" />
            )}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Link to={`/songs/${song.id}`}>
          <h3 className="font-semibold truncate hover:text-accent-blue transition">
            {song.title}
          </h3>
        </Link>
        <p className="text-sm text-primary-gray truncate">{song.artist}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm">
            {song.isPremium ? (
              hasPurchased ? (
                <span className="text-accent-blue">Purchased</span>
              ) : (
                formatPrice(song.price)
              )
            ) : (
              'Free'
            )}
          </span>
          <span className="text-sm text-primary-gray">
            {formatDuration(song.duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SongCard;