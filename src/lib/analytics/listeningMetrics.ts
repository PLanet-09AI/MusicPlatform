import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ListeningSession } from '@/types';
import type { ListeningMetrics } from './types';

export class ListeningMetricsService {
  static async trackListeningSession(session: Omit<ListeningSession, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'listeningSessions'), {
        ...session,
        startTime: Timestamp.fromDate(session.startTime),
        endTime: session.endTime ? Timestamp.fromDate(session.endTime) : null
      });

      // Update song play count
      const songRef = doc(db, 'songs', session.songId);
      await updateDoc(songRef, {
        playCount: increment(1),
        listeningHours: increment(session.duration / 3600)
      });

      return docRef.id;
    } catch (error) {
      console.error('Error tracking listening session:', error);
      throw error;
    }
  }

  // ... rest of the code remains the same
}