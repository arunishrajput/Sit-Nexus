
import { User, Message, Meetup, LocationId, Connection, Notification, Report, ConnectionStatus, MysteryMeetup, MysteryStatus, UserQuest, MoodMatch, ActivityLog, ActivityType } from '../types';
import { MYSTERY_HINTS, LOCATIONS, QUESTS, BADGES, LEVEL_THRESHOLDS, MOODS } from '../constants';
import { db, auth } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, 
  query, where, orderBy, onSnapshot, limit, deleteDoc, Timestamp 
} from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Collection References
const COLLECTIONS = {
  USERS: 'users',
  MESSAGES: 'messages',
  MEETUPS: 'meetups',
  CONNECTIONS: 'connections',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  MYSTERY: 'mystery_meetups',
  USER_QUESTS: 'user_quests',
  ACTIVITY_LOGS: 'activity_logs'
};

export class StorageService {
  
  static isDemoMode(): boolean {
    return false; // Deprecated with real DB
  }

  static async clearAllData() {
    // Admin only - requires backend functions in real app
    console.warn("Factory reset not supported in client-side Firebase.");
  }

  static async removeDemoData() {
     console.warn("Demo data removal not supported.");
  }

  static async seedDemoData(currentUserId?: string) {
     console.warn("Demo seeding not supported in production.");
  }

  // --- Auth & User ---

  static async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as User;
      // Update local storage for fast session check (optional, but good for persistence logic in App.tsx)
      localStorage.setItem('sit_current_user', JSON.stringify(userData));
      return userData;
    } else {
      throw new Error("User profile not found.");
    }
  }

  static async signup(email: string, password: string, userData: Partial<User>): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    const newUser: User = {
      ...userData as User,
      id: uid,
      email: email,
      xp: 0,
      level: 1,
      badges: []
    };

    await setDoc(doc(db, COLLECTIONS.USERS, uid), newUser);
    localStorage.setItem('sit_current_user', JSON.stringify(newUser));
    return newUser;
  }

  static logout(): void {
    signOut(auth);
    localStorage.removeItem('sit_current_user');
  }

  static getCurrentUser(): User | null {
    // Quick sync check for UI flickering, but App.tsx should verify with Auth
    const stored = localStorage.getItem('sit_current_user');
    return stored ? JSON.parse(stored) : null;
  }

  static async getUser(userId: string): Promise<User | null> {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    return snap.exists() ? snap.data() as User : null;
  }

  static async getUsers(): Promise<User[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => d.data() as User);
  }

  static async saveUser(user: User): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
    
    // Update local cache if it's the current user
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      localStorage.setItem('sit_current_user', JSON.stringify(user));
    }
  }

  // --- Activity Logging ---
  static async logActivity(userId: string, type: ActivityType, metadata: Record<string, any> = {}) {
    await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOGS), {
      userId,
      type,
      metadata,
      timestamp: Date.now()
    });
  }

  static async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITY_LOGS), 
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
  }

  // --- Messaging ---
  
  // Real-time listener
  static subscribeToMessages(roomId: string, callback: (msgs: Message[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.MESSAGES),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      callback(msgs);
    });
  }

  static async getMessagesRaw(): Promise<Message[]> {
    // Helper for non-realtime needs
    const snap = await getDocs(collection(db, COLLECTIONS.MESSAGES));
    return snap.docs.map(d => d.data() as Message);
  }

  static async getMessagesByUser(userId: string): Promise<Message[]> {
     const q = query(collection(db, COLLECTIONS.MESSAGES), where('senderId', '==', userId));
     const snap = await getDocs(q);
     return snap.docs.map(d => d.data() as Message);
  }

  static async sendMessage(message: Message): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.MESSAGES, message.id), message);
    this.logActivity(message.senderId, 'message_sent', {
      length: message.text.length,
      roomId: message.roomId
    });
  }

  static getDmRoomId(user1Id: string, user2Id: string): string {
    return [user1Id, user2Id].sort().join('_');
  }

  // --- Meetups ---
  static async getMeetups(locationId?: string): Promise<Meetup[]> {
    let q;
    if (locationId) {
      q = query(collection(db, COLLECTIONS.MEETUPS), where('locationId', '==', locationId));
    } else {
      q = collection(db, COLLECTIONS.MEETUPS);
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Meetup));
  }

  static async createMeetup(meetup: Meetup): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.MEETUPS, meetup.id), meetup);
    this.logActivity(meetup.creatorId, 'meetup_create', { title: meetup.title });
  }

  static async joinMeetup(meetupId: string, userId: string): Promise<void> {
    const meetupRef = doc(db, COLLECTIONS.MEETUPS, meetupId);
    const snap = await getDoc(meetupRef);
    if (!snap.exists()) return;

    const meetup = snap.data() as Meetup;
    if (!meetup.participants.includes(userId)) {
      const updatedParticipants = [...meetup.participants, userId];
      await updateDoc(meetupRef, { participants: updatedParticipants });
      
      this.logActivity(userId, 'meetup_join', { meetupId, title: meetup.title });
      
      // Notify creator
      if (meetup.creatorId !== userId) {
        const user = await this.getUser(userId);
        this.addNotification({
            id: crypto.randomUUID(),
            userId: meetup.creatorId,
            type: 'meetup_join',
            title: 'New Attendee',
            message: `${user?.name || 'Someone'} joined ${meetup.title}`,
            read: false,
            timestamp: Date.now(),
            link: `/chat/${meetup.locationId}`
        });
      }
    }
  }

  // --- Connections ---
  static async getConnections(userId: string): Promise<Connection[]> {
    // Firestore doesn't support OR queries easily for this structure, fetch both sides
    const q1 = query(collection(db, COLLECTIONS.CONNECTIONS), where('requesterId', '==', userId));
    const q2 = query(collection(db, COLLECTIONS.CONNECTIONS), where('receiverId', '==', userId));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const c1 = snap1.docs.map(d => d.data() as Connection);
    const c2 = snap2.docs.map(d => d.data() as Connection);
    
    return [...c1, ...c2];
  }

  static async sendConnectionRequest(requesterId: string, receiverId: string): Promise<void> {
    const newConn: Connection = {
      id: crypto.randomUUID(),
      requesterId,
      receiverId,
      status: 'pending',
      timestamp: Date.now()
    };
    await setDoc(doc(db, COLLECTIONS.CONNECTIONS, newConn.id), newConn);

    const requester = await this.getUser(requesterId);
    this.addNotification({
      id: crypto.randomUUID(),
      userId: receiverId,
      type: 'connection_request',
      title: 'New Connection',
      message: `${requester?.name} wants to connect.`,
      read: false,
      timestamp: Date.now(),
      link: '/people'
    });
  }

  static async updateConnectionStatus(connectionId: string, status: ConnectionStatus): Promise<void> {
     await updateDoc(doc(db, COLLECTIONS.CONNECTIONS, connectionId), { status });
  }

  // --- Notifications ---
  static subscribeToNotifications(userId: string, callback: (notes: Notification[]) => void) {
    const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS), 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => d.data() as Notification));
    });
  }

  static async addNotification(notification: Notification): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notification.id), notification);
  }

  static async markNotificationRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), { read: true });
  }

  // --- Reports ---
  static async submitReport(report: Report): Promise<void> {
    await setDoc(doc(db, COLLECTIONS.REPORTS, report.id), report);
  }

  static async getReports(): Promise<Report[]> {
    const snap = await getDocs(collection(db, COLLECTIONS.REPORTS));
    return snap.docs.map(d => d.data() as Report);
  }

  // --- Mystery ---
  static async findMysteryMatch(currentUserId: string): Promise<MysteryMeetup | null> {
    // In a real backend, this is a transaction. For client-side simulation:
    // 1. Check for active mystery
    const qActive = query(
        collection(db, COLLECTIONS.MYSTERY), 
        where('status', 'in', ['pending', 'accepted', 'arrived_a', 'arrived_b'])
    );
    const activeSnap = await getDocs(qActive);
    const existing = activeSnap.docs.map(d => d.data() as MysteryMeetup).find(m => m.userAId === currentUserId || m.userBId === currentUserId);
    
    if (existing) return existing;

    // 2. Find a partner (simplified: random user)
    const users = await this.getUsers();
    const candidates = users.filter(u => u.id !== currentUserId);
    if (candidates.length === 0) return null;

    const matchUser = candidates[Math.floor(Math.random() * candidates.length)];
    const validLocations = LOCATIONS.filter(l => l.category === 'campus');
    const location = validLocations[Math.floor(Math.random() * validLocations.length)];
    const hintData = MYSTERY_HINTS[location.id];

    const newMystery: MysteryMeetup = {
      id: crypto.randomUUID(),
      userAId: currentUserId,
      userBId: matchUser.id,
      locationId: location.id,
      hint: hintData ? hintData.hint : "A secret place...",
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 15 * 60 * 1000 
    };

    await setDoc(doc(db, COLLECTIONS.MYSTERY, newMystery.id), newMystery);
    
    // Notify Partner
    this.addNotification({
        id: crypto.randomUUID(),
        userId: matchUser.id,
        type: 'mystery_match',
        title: 'Mystery Meetup Found!',
        message: 'Someone wants to meet you!',
        read: false,
        timestamp: Date.now(),
        link: '/mystery'
    });

    return newMystery;
  }

  static async updateMysteryStatus(matchId: string, status: MysteryStatus): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.MYSTERY, matchId), { status });
  }

  // --- Quests ---
  static async getUserQuests(userId: string): Promise<UserQuest[]> {
    const q = query(collection(db, COLLECTIONS.USER_QUESTS), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as UserQuest);
  }

  static async assignDailyQuests(userId: string): Promise<void> {
    const existing = await this.getUserQuests(userId);
    const today = new Date().toDateString();
    
    if (existing.some(q => new Date(q.assignedAt).toDateString() === today)) return;

    const shuffled = [...QUESTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    for (const q of selected) {
       const uq: UserQuest = {
         id: crypto.randomUUID(),
         userId,
         questId: q.id,
         status: 'pending',
         assignedAt: Date.now()
       };
       await setDoc(doc(db, COLLECTIONS.USER_QUESTS, uq.id), uq);
    }
  }

  static async verifyQuest(user: User, userQuestId: string): Promise<{ success: boolean, message: string }> {
    const questDoc = await getDoc(doc(db, COLLECTIONS.USER_QUESTS, userQuestId));
    if (!questDoc.exists()) return { success: false, message: 'Quest not found' };
    
    const userQuest = questDoc.data() as UserQuest;
    if (userQuest.status === 'completed') return { success: false, message: 'Already completed' };

    const questDefinition = QUESTS.find(q => q.id === userQuest.questId);
    if (!questDefinition) return { success: false, message: 'Invalid quest def' };

    let verified = false;
    // Simplification for async verification
    if (questDefinition.verification === 'location_check') {
        if (user.currentLocationId === questDefinition.targetLocationId) verified = true;
        else return { success: false, message: 'Incorrect location' };
    } else if (questDefinition.verification === 'chat_count') {
        const msgs = await this.getMessagesByUser(user.id);
        if (msgs.length >= (questDefinition.targetCount || 1)) verified = true;
        else return { success: false, message: 'Send more messages!' };
    } else verified = true;

    if (verified) {
        await updateDoc(doc(db, COLLECTIONS.USER_QUESTS, userQuestId), {
            status: 'completed',
            completedAt: Date.now()
        });
        
        await this.addXp(user.id, questDefinition.xp);
        return { success: true, message: `Completed! +${questDefinition.xp} XP` };
    }
    return { success: false, message: 'Verification failed.' };
  }

  static async addXp(userId: string, amount: number): Promise<void> {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    
    const user = userSnap.data() as User;
    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXp = currentXp + amount;
    
    let newLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (newXp >= LEVEL_THRESHOLDS[i]) newLevel = i + 1;
    }

    await updateDoc(userRef, { xp: newXp, level: newLevel });
  }

  // --- Moods ---
  static async setMood(userId: string, moodId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    await this.logActivity(userId, 'mood_change', { from: user.currentMood || 'none', to: moodId });
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
        currentMood: moodId,
        moodLastUpdated: Date.now()
    });
  }

  static async getMoodMatches(userId: string): Promise<MoodMatch[]> {
    const users = await this.getUsers();
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser || !currentUser.currentMood) return [];

    const currentMoodConfig = MOODS.find(m => m.id === currentUser.currentMood);
    if (!currentMoodConfig) return [];

    const matches: MoodMatch[] = [];

    users.forEach(u => {
      if (u.id === userId || !u.currentMood) return;

      let score = 0;
      const reasons: string[] = [];

      if (u.currentMood === currentUser.currentMood) {
        score += 60;
        reasons.push('Same Vibe');
      } else if (currentMoodConfig.compatibleWith.includes(u.currentMood)) {
        score += 20;
        reasons.push('Compatible');
      } else {
        score -= 10;
      }

      if (u.department === currentUser.department) {
        score += 10;
        reasons.push('Same Dept');
      }
      if (u.year === currentUser.year) score += 5;

      if (score > 100) score = 100;
      if (score > 0) matches.push({ user: u, score, reasons });
    });

    return matches.sort((a, b) => b.score - a.score);
  }
}
