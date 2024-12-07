export interface AnalyticsMetrics {
  totalRevenue: number;
  totalUsers: number;
  totalSongs: number;
  totalListeningTime: number;
  revenueByDay: { date: string; amount: number }[];
  userActivityByDay: { date: string; amount: number }[];
  listeningHoursByDay: { date: string; hours: number }[];
  listeningHoursByTime: number[];
  topSongs: Array<{ id: string; title: string; artist: string; plays: number; hours: number }>;
  topGenres: Array<{ genre: string; count: number }>;
  platformDistribution: Record<string, number>;
  paymentMethodDistribution: Record<string, number>;
  artistMetrics?: {
    totalRevenue: number;
    totalPlays: number;
    totalListeningHours: number;
    songPerformance: Array<{
      id: string;
      title: string;
      plays: number;
      hours: number;
      revenue: number;
    }>;
  };
}

export interface ListeningMetrics {
  totalHours: number;
  hourlyDistribution: number[];
  dailyDistribution: number[];
  averageSessionDuration: number;
  completionRate: number;
  uniqueListeners: number;
}