import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { CloudinaryService } from './cloudinary';
import type { Song } from '@/types';

export interface SongInput {
  title: string;
  artist: string;
  album?: string;
  description: string;
  price: number;
  isPremium: boolean;
  duration: number;
  audioFile?: File;
  coverFile?: File;
}

export class SongService {
  static async create(input: SongInput, onProgress?: (audio: number, cover: number) => void): Promise<string> {
    try {
      if (!input.audioFile || !input.coverFile) {
        throw new Error('Audio and cover files are required');
      }

      // Upload files to Cloudinary
      const [audioUrl, coverUrl] = await Promise.all([
        CloudinaryService.uploadFile({
          folder: 'musichub/songs',
          fileName: input.audioFile.name,
          file: input.audioFile,
          onProgress: (progress) => onProgress?.(progress, 0),
          metadata: {
            title: input.title,
            artist: input.artist,
          },
        }),
        CloudinaryService.uploadFile({
          folder: 'musichub/covers',
          fileName: input.coverFile.name,
          file: input.coverFile,
          onProgress: (progress) => onProgress?.(100, progress),
        }),
      ]);

      // Create song document
      const songRef = await addDoc(collection(db, 'songs'), {
        ...input,
        audioUrl,
        coverUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return songRef.id;
    } catch (error) {
      console.error('Error creating song:', error);
      throw new Error('Failed to create song. Please try again.');
    }
  }

  static async update(
    songId: string, 
    input: Partial<SongInput>, 
    onProgress?: (audio: number, cover: number) => void
  ): Promise<void> {
    try {
      const updates: Partial<Song> = { ...input };
      
      // Handle file updates if provided
      if (input.audioFile) {
        updates.audioUrl = await CloudinaryService.uploadFile({
          folder: 'musichub/songs',
          fileName: input.audioFile.name,
          file: input.audioFile,
          onProgress: (progress) => onProgress?.(progress, 100),
          metadata: {
            title: input.title || '',
            artist: input.artist || '',
          },
        });
      }

      if (input.coverFile) {
        updates.coverUrl = await CloudinaryService.uploadFile({
          folder: 'musichub/covers',
          fileName: input.coverFile.name,
          file: input.coverFile,
          onProgress: (progress) => onProgress?.(100, progress),
        });
      }

      // Update song document
      await updateDoc(doc(db, 'songs', songId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating song:', error);
      throw new Error('Failed to update song. Please try again.');
    }
  }

  static async delete(songId: string): Promise<void> {
    try {
      const songRef = doc(db, 'songs', songId);
      const songDoc = await getDocs(songRef);
      const songData = songDoc.data() as Song;

      // Delete files from Cloudinary
      if (songData.audioUrl) {
        await CloudinaryService.deleteFile(
          CloudinaryService.getPublicIdFromUrl(songData.audioUrl)
        );
      }
      if (songData.coverUrl) {
        await CloudinaryService.deleteFile(
          CloudinaryService.getPublicIdFromUrl(songData.coverUrl)
        );
      }

      // Delete song document
      await deleteDoc(songRef);
    } catch (error) {
      console.error('Error deleting song:', error);
      throw new Error('Failed to delete song. Please try again.');
    }
  }

  static async getByUser(userId: string): Promise<Song[]> {
    try {
      // Get user's transactions
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );
      
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const songIds = transactionsSnapshot.docs.map(doc => doc.data().songId);

      // Get songs
      const songsQuery = query(
        collection(db, 'songs'),
        where('__name__', 'in', songIds)
      );

      const songsSnapshot = await getDocs(songsQuery);
      return songsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];
    } catch (error) {
      console.error('Error getting user songs:', error);
      throw new Error('Failed to get user songs. Please try again.');
    }
  }
}