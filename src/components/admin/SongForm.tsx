import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Song } from '@/types';
import Button from '@/components/ui/Button';
import MediaUpload from '@/components/ui/MediaUpload';
import { CLOUDINARY_CONFIG } from '@/config/cloudinary';
import { useAuthStore } from '@/store/authStore';

interface SongFormProps {
  song?: Song;
  onClose: () => void;
  onSuccess: () => void;
}

const SongForm: React.FC<SongFormProps> = ({ song, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: song?.title || '',
    artist: song?.artist || user?.name || '',
    album: song?.album || '',
    description: song?.description || '',
    price: song?.price || 0,
    isPremium: song?.isPremium || false,
    duration: song?.duration || 0,
  });
  
  const [audioUrl, setAudioUrl] = useState<string>(song?.audioUrl || '');
  const [coverUrl, setCoverUrl] = useState<string>(song?.coverUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!audioUrl || !coverUrl) {
        throw new Error('Both audio and cover files are required');
      }

      if (!user) {
        throw new Error('You must be logged in to add songs');
      }

      const songData = {
        ...formData,
        audioUrl,
        coverUrl,
        artistId: user.id, // Add artistId
        price: Number(formData.price) || 0,
        duration: Number(formData.duration) || 0,
        playCount: song?.playCount || 0,
        updatedAt: serverTimestamp(),
      };

      if (song) {
        await updateDoc(doc(db, 'songs', song.id), songData);
      } else {
        await addDoc(collection(db, 'songs'), {
          ...songData,
          createdAt: serverTimestamp(),
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving song:', error);
      setError(error.message || 'Failed to save song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioUploadComplete = (url: string) => {
    setAudioUrl(url);
    // Create an audio element to get duration
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setFormData(prev => ({ ...prev, duration: Math.round(audio.duration) }));
    });
  };

  const handleAudioUploadError = (error: string) => {
    setError(`Audio upload failed: ${error}`);
  };

  const handleCoverUploadComplete = (url: string) => {
    setCoverUrl(url);
  };

  const handleCoverUploadError = (error: string) => {
    setError(`Cover upload failed: ${error}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-primary-black/90 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {song ? 'Edit Song' : 'Add New Song'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Artist</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              className="w-full px-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md"
              required
              disabled={user?.role === 'artist'} // Artists can't change the artist name
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Album (Optional)</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData(prev => ({ ...prev, album: e.target.value }))}
              className="w-full px-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Audio File</label>
              <MediaUpload
                onUploadComplete={handleAudioUploadComplete}
                onError={handleAudioUploadError}
                folder={CLOUDINARY_CONFIG.folders.songs}
                accept="audio/*"
                maxSize={50 * 1024 * 1024} // 50MB
                className="h-32"
              />
              {audioUrl && (
                <audio controls className="mt-2 w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image</label>
              <MediaUpload
                onUploadComplete={handleCoverUploadComplete}
                onError={handleCoverUploadError}
                folder={CLOUDINARY_CONFIG.folders.covers}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                className="h-32"
              />
              {coverUrl && (
                <img
                  src={coverUrl}
                  alt="Cover preview"
                  className="mt-2 w-full h-32 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price: Math.max(0, Number(e.target.value) || 0)
                }))}
                className="w-full px-3 py-2 bg-primary-black/50 border border-primary-gray/30 rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    isPremium: e.target.checked 
                  }))}
                  className="form-checkbox"
                />
                <span>Premium Song</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span>
                  Saving...
                </span>
              ) : (
                song ? 'Update Song' : 'Add Song'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SongForm;