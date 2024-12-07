import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction, Song } from '@/types';
import type { AnalyticsMetrics } from './types';

export class AnalyticsService {
  static async getMetrics(): Promise<AnalyticsMetrics> {
    try {
      const [
        revenueMetrics,
        userMetrics,
        songMetrics,
        platformMetrics,
        paymentMetrics
      ] = await Promise.all([
        this.getRevenueMetrics(),
        this.getUserMetrics(),
        this.getSongMetrics(),
        this.getPlatformDistribution(),
        this.getPaymentMethodDistribution()
      ]);

      return {
        ...revenueMetrics,
        ...userMetrics,
        ...songMetrics,
        ...platformMetrics,
        ...paymentMetrics
      };
    } catch (error) {
      console.error('Error fetching analytics metrics:', error);
      throw error;
    }
  }

  private static async getRevenueMetrics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('createdAt', '>=', Timestamp.fromDate(sevenDaysAgo)),
      where('status', '==', 'completed'),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Transaction[];

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);

    const revenueByDay = transactions.reduce((acc, t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRevenue,
      revenueByDay: Object.entries(revenueByDay).map(([date, amount]) => ({
        date,
        amount
      }))
    };
  }

  private static async getUserMetrics() {
    const [userMetricsSnapshot, usersSnapshot] = await Promise.all([
      getDocs(collection(db, 'userMetrics')),
      getDocs(collection(db, 'users'))
    ]);

    const userMetrics = userMetricsSnapshot.docs.map(doc => doc.data());
    
    const totalListeningTime = userMetrics.reduce(
      (sum, m) => sum + (m.totalListeningTime || 0),
      0
    );

    const activityByDay = userMetrics.reduce((acc, m) => {
      if (m.lastPlayed) {
        const date = new Date(m.lastPlayed.seconds * 1000).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers: usersSnapshot.size,
      totalListeningTime,
      userActivityByDay: Object.entries(activityByDay).map(([date, count]) => ({
        date,
        count
      }))
    };
  }

  private static async getSongMetrics() {
    const songsQuery = query(
      collection(db, 'songs'),
      orderBy('playCount', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(songsQuery);
    const songs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Song[];

    const genreCounts = songs.reduce((acc, song) => {
      const genre = song.genre || 'Unknown';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSongs: snapshot.size,
      topSongs: songs.map(song => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        plays: song.playCount || 0
      })),
      topGenres: Object.entries(genreCounts)
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }

  private static async getPlatformDistribution() {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map(doc => doc.data()) as Transaction[];

    const platformCounts = transactions.reduce((acc, t) => {
      const platform = t.metadata?.platform || 'Unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { platformDistribution: platformCounts };
  }

  private static async getPaymentMethodDistribution() {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map(doc => doc.data()) as Transaction[];

    const paymentMethodCounts = transactions.reduce((acc, t) => {
      const method = t.paymentDetails?.cardBrand || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { paymentMethodDistribution: paymentMethodCounts };
  }
}