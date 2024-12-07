import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Play, Download, Share2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { Song } from '@/types';
import Button from '@/components/ui/Button';
import AudioPlayer from '@/components/songs/AudioPlayer';
import { formatPrice, formatDuration } from '@/lib/utils';
import PurchaseModal from '@/components/songs/PurchaseModal';

const SongDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [song, setSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        if (!id) return;
        const songDoc = await getDoc(doc(db, 'songs', id));
        if (!songDoc.exists()) {
          navigate('/browse');
          return;
        }
        setSong({ id: songDoc.id, ...songDoc.data() } as Song);
      } catch (error) {
        console.error('Error fetching song:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-blue"></div>
      </div>
    );
  }

  if (!song) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // You could add a toast notification here
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Cover Image */}
        <div className="aspect-square rounded-lg overflow-hidden">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Song Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{song.title}</h1>
            <p className="text-xl text-primary-gray">{song.artist}</p>
            {song.album && (
              <p className="text-primary-gray">Album: {song.album}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              {song.isPremium && !user && (
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                >
                  Sign in to download
                </Button>
              )}
              {song.isPremium && user && (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Purchase ({formatPrice(song.price)})
                </Button>
              )}
              {!song.isPremium && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Download
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleShare}
                className="!p-2"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-sm text-primary-gray">
              Duration: {formatDuration(song.duration)}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-primary-gray whitespace-pre-line">
              {song.description}
            </p>
          </div>
        </div>
      </div>

      {isPlaying && <AudioPlayer song={song} />}
      {showPurchaseModal && (
        <PurchaseModal
          song={song}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default SongDetails;