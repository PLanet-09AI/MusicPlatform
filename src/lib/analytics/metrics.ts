import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction, Song, User } from '@/types';
import type { AnalyticsMetrics } from './types';

export class AnalyticsService {
  static async getFeaturedArtists(): Promise<Array<User & { topSong?: Song; totalPlays: number }>> {
    try {
      // Get artists
      const artistsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'artist')
      );
      
      const artistsSnapshot = await getDocs(artistsQuery);
      const artists = artistsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as User[];

      if (artists.length === 0) {
        return [];
      }

      // Get songs for each artist
      const artistsWithSongs = await Promise.all(
        artists.map(async (artist) => {
          const songsQuery = query(
            collection(db, 'songs'),
            where('artistId', '==', artist.id),
            orderBy('playCount', 'desc'),
            limit(1)
          );
          
          const songsSnapshot = await getDocs(songsQuery);
          const allSongsQuery = query(
            collection(db, 'songs'),
            where('artistId', '==', artist.id)
          );
          
          const allSongsSnapshot = await getDocs(allSongsQuery);
          const totalPlays = allSongsSnapshot.docs.reduce(
            (sum, doc) => sum + (doc.data().playCount || 0),
            0
          );

          return {
            ...artist,
            topSong: songsSnapshot.docs[0] ? {
              id: songsSnapshot.docs[0].id,
              ...songsSnapshot.docs[0].data(),
              createdAt: songsSnapshot.docs[0].data().createdAt?.toDate(),
              updatedAt: songsSnapshot.docs[0].data().updatedAt?.toDate()
            } as Song : undefined,
            totalPlays
          };
        })
      );

      // Sort by total plays and filter out artists without songs
      return artistsWithSongs
        .filter(artist => artist.topSong)
        .sort((a, b) => b.totalPlays - a.totalPlays)
        .slice(0, 4);
    } catch (error) {
      console.error('Error fetching featured artists:', error);
      throw error;
    }
  }

  static async getMetrics(userId?: string): Promise<AnalyticsMetrics> {
    try {
      // Base queries
      const transactionsQuery = userId 
        ? query(collection(db, 'transactions'), where('artistId', '==', userId))
        : query(collection(db, 'transactions'));

      const songsQuery = userId
        ? query(collection(db, 'songs'), where('artistId', '==', userId))
        : query(collection(db, 'songs'));

      // Fetch data
      const [transactionsSnapshot, songsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(transactionsQuery),
        getDocs(songsQuery),
        getDocs(collection(db, 'users'))
      ]);

      const transactions = transactionsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate()
      })) as Transaction[];

      const songs = songsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Song[];

      const users = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate()
      })) as User[];

      // Calculate metrics
      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalUsers = users.length;
      const totalSongs = songs.length;
      const totalListeningTime = songs.reduce((sum, s) => sum + (s.listeningHours || 0), 0);

      // Group transactions by date
      const revenueByDay = transactions.reduce((acc, t) => {
        if (t.createdAt) {
          const date = t.createdAt.toISOString().split('T')[0];
          acc[date] = (acc[date] || 0) + (t.amount || 0);
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate platform distribution
      const platformDistribution = transactions.reduce((acc, t) => {
        const platform = t.metadata?.platform || 'Unknown';
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get top songs
      const topSongs = songs
        .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
        .slice(0, 5)
        .map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          plays: song.playCount || 0,
          hours: song.listeningHours || 0
        }));

      // Calculate genre distribution
      const genreCounts = songs.reduce((acc, song) => {
        const genre = song.genre || 'Unknown';
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topGenres = Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalRevenue,
        totalUsers,
        totalSongs,
        totalListeningTime,
        revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({ date, amount })),
        userActivityByDay: [], // This would need session data to be accurate
        listeningHoursByDay: [], // This would need session data to be accurate
        listeningHoursByTime: new Array(24).fill(0), // This would need session data to be accurate
        topSongs,
        topGenres,
        platformDistribution,
        paymentMethodDistribution: {},
        ...(userId && {
          artistMetrics: {
            totalRevenue,
            totalPlays: songs.reduce((sum, s) => sum + (s.playCount || 0), 0),
            totalListeningHours: totalListeningTime,
            songPerformance: songs.map(song => ({
              id: song.id,
              title: song.title,
              plays: song.playCount || 0,
              hours: song.listeningHours || 0,
              revenue: transactions
                .filter(t => t.songId === song.id)
                .reduce((sum, t) => sum + (t.amount || 0), 0)
            }))
          }
        })
      };
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      throw error;
    }
  }
}