export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'artist' | 'user';
  createdAt: Date;
  artistProfile?: {
    bio: string;
    genres: string[];
    socialLinks: {
      website?: string;
      twitter?: string;
      instagram?: string;
      spotify?: string;
    };
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album?: string;
  description: string;
  coverUrl: string;
  audioUrl: string;
  price: number;
  isPremium: boolean;
  duration: number;
  genre?: string;
  createdAt: Date;
  updatedAt: Date;
  playCount?: number;
  listeningHours?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  songId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: Date;
  paymentDetails: {
    paymentIntentId: string;
    paymentMethodId: string;
    paymentMethodType: string;
    last4: string;
    cardBrand?: string;
  };
  metadata: {
    songTitle: string;
    songArtist: string;
    userEmail: string;
    userName: string;
    purchaseType: 'premium' | 'standard';
    platform: string;
    deviceInfo: string;
    ipAddress?: string;
    listeningDuration?: number;
  };
  refundStatus?: 'none' | 'pending' | 'completed';
  refundReason?: string;
  refundedAt?: Date;
}

export interface ListeningSession {
  id: string;
  userId: string;
  songId: string;
  artistId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  platform: string;
  deviceInfo: string;
}