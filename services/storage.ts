
import { User, Message, Meetup, LocationId, Connection, Notification, Report, ConnectionStatus, MysteryMeetup, MysteryStatus, Quest, UserQuest, Badge, MoodMatch, ActivityLog, ActivityType } from '../types';
import { MYSTERY_HINTS, LOCATIONS, QUESTS, BADGES, LEVEL_THRESHOLDS, MOODS } from '../constants';

const USERS_KEY = 'sit_users';
const MESSAGES_KEY = 'sit_messages';
const MEETUPS_KEY = 'sit_meetups';
const CURRENT_USER_KEY = 'sit_current_user';
const CONNECTIONS_KEY = 'sit_connections';
const NOTIFICATIONS_KEY = 'sit_notifications';
const REPORTS_KEY = 'sit_reports';
const MYSTERY_KEY = 'sit_mystery_meetups';
const USER_QUESTS_KEY = 'sit_user_quests';
const ACTIVITY_LOGS_KEY = 'sit_activity_logs';

const DEMO_USER_IDS = ['u_tech', 'u_art', 'u_gym', 'u_read', 'u_party'];

// Helper for safe parsing
const safeJsonParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key}`, e);
    return fallback;
  }
};

export class StorageService {
  static initDummyData() {
    if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(MESSAGES_KEY)) localStorage.setItem(MESSAGES_KEY, JSON.stringify([]));
    if (!localStorage.getItem(MEETUPS_KEY)) localStorage.setItem(MEETUPS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(CONNECTIONS_KEY)) localStorage.setItem(CONNECTIONS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(NOTIFICATIONS_KEY)) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(REPORTS_KEY)) localStorage.setItem(REPORTS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(MYSTERY_KEY)) localStorage.setItem(MYSTERY_KEY, JSON.stringify([]));
    if (!localStorage.getItem(USER_QUESTS_KEY)) localStorage.setItem(USER_QUESTS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(ACTIVITY_LOGS_KEY)) localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify([]));
  }

  // --- DEMO DATA TOOLS ---
  
  static isDemoMode(): boolean {
    const users = this.getUsers();
    return users.some(u => DEMO_USER_IDS.includes(u.id));
  }

  static clearAllData() {
    try {
      localStorage.clear();
      this.initDummyData();
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear data", e);
      alert("Failed to reset. Please clear browser cache manually.");
    }
  }

  static removeDemoData() {
    try {
      // 1. Remove Demo Users
      const users = this.getUsers().filter(u => !DEMO_USER_IDS.includes(u.id));
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // 2. Remove Messages
      const messages = this.getMessagesRaw().filter(m => !DEMO_USER_IDS.includes(m.senderId));
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

      // 3. Remove Meetups
      const meetups = this.getMeetups().filter(m => !DEMO_USER_IDS.includes(m.creatorId));
      localStorage.setItem(MEETUPS_KEY, JSON.stringify(meetups));

      // 4. Clean Connections
      const connections = this.getConnections().filter(c => 
        !DEMO_USER_IDS.includes(c.requesterId) && !DEMO_USER_IDS.includes(c.receiverId)
      );
      localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
      
      // 5. Check if current user was a demo user and logout if so
      const currentUser = this.getCurrentUser();
      if (currentUser && DEMO_USER_IDS.includes(currentUser.id)) {
        this.logout();
      }
      
      // Force reload to apply changes
      window.location.reload();
    } catch (e) {
      console.error("Error removing demo data:", e);
      alert("An error occurred while cleaning up demo data.");
    }
  }

  static seedDemoData(currentUserId?: string) {
    try {
      // 1. Create Diverse Users
      const demoUsers: User[] = [
        {
          id: 'u_tech',
          username: 'coder_kai',
          email: 'kai@sit.edu',
          name: 'Kai Chen',
          department: 'Computer Science',
          year: '3rd Year',
          bio: 'Living on caffeine and code. Usually at the coffee shop.',
          interests: ['Coding', 'Hackathons', 'Coffee', 'Sci-Fi'],
          avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
          xp: 1200, level: 5, badges: ['b_starter', 'b_explorer'],
          currentLocationId: LocationId.COFFEE_SHOP,
          currentMood: 'motivated'
        },
        {
          id: 'u_art',
          username: 'bella_arts',
          email: 'bella@sit.edu',
          name: 'Bella Rossi',
          department: 'Architecture',
          year: '2nd Year',
          bio: 'Capturing moments. Sketchbook always in hand.',
          interests: ['Photography', 'Sketching', 'Indie Music', 'Traveling'],
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
          xp: 850, level: 3, badges: ['b_starter'],
          currentLocationId: LocationId.DD_HILLS,
          currentMood: 'chill'
        },
        {
          id: 'u_gym',
          username: 'fit_jake',
          email: 'jake@sit.edu',
          name: 'Jake Stay',
          department: 'Mechanical Eng.',
          year: '4th Year',
          bio: 'Gym is therapy. Football captain.',
          interests: ['Fitness', 'Football', 'Cars', 'Nutrition'],
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
          xp: 2100, level: 7, badges: ['b_legend'],
          currentLocationId: LocationId.GYMNASIUM,
          currentMood: 'hyper'
        },
        {
          id: 'u_read',
          username: 'sophie_reads',
          email: 'sophie@sit.edu',
          name: 'Sophie Li',
          department: 'Civil Eng.',
          year: '1st Year',
          bio: 'Lost in a book. Quiet company appreciated.',
          interests: ['Reading', 'Writing', 'Tea', 'Poetry'],
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
          xp: 400, level: 2, badges: [],
          currentLocationId: LocationId.LIBRARY,
          currentMood: 'study'
        },
        {
          id: 'u_party',
          username: 'party_max',
          email: 'max@sit.edu',
          name: 'Max Power',
          department: 'Business Admin',
          year: '3rd Year',
          bio: 'Here for a good time, not a long time.',
          interests: ['Parties', 'Networking', 'DJing', 'Travel'],
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
          xp: 1500, level: 6, badges: ['b_social'],
          currentLocationId: LocationId.CANTEEN,
          currentMood: 'chaotic'
        }
      ];

      const currentUsers = this.getUsers();
      demoUsers.forEach(du => {
        if (!currentUsers.find(u => u.id === du.id)) {
            currentUsers.push(du);
        }
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(currentUsers));

      // 2. Create Chat History
      const messages: Message[] = [
          { id: 'm1', roomId: LocationId.CANTEEN, senderId: 'u_party', senderName: 'Max Power', text: 'Who is up for pizza?', timestamp: Date.now() - 1000000, readBy: [] },
          { id: 'm2', roomId: LocationId.CANTEEN, senderId: 'u_tech', senderName: 'Kai Chen', text: 'I need coffee first.', timestamp: Date.now() - 900000, readBy: [] },
          { id: 'm3', roomId: LocationId.LIBRARY, senderId: 'u_read', senderName: 'Sophie Li', text: 'Has anyone seen the new History edition?', timestamp: Date.now() - 500000, readBy: [] },
          { id: 'm4', roomId: LocationId.STADIUM, senderId: 'u_gym', senderName: 'Jake Stay', text: '5k run starting in 10 mins! Join up.', timestamp: Date.now() - 300000, readBy: [] },
      ];
      const existingMsgs = safeJsonParse(MESSAGES_KEY, []);
      const newMsgs = messages.filter(m => !existingMsgs.find((em: Message) => em.id === m.id));
      localStorage.setItem(MESSAGES_KEY, JSON.stringify([...existingMsgs, ...newMsgs]));

      // 3. Create Meetups
      const meetups: Meetup[] = [
          {
              id: 'demo_meetup_1',
              title: 'Weekend Football',
              description: 'Casual 5v5 game. All skill levels welcome.',
              locationId: LocationId.STADIUM,
              creatorId: 'u_gym',
              creatorName: 'Jake Stay',
              startTime: Date.now() + 86400000, // +1 day
              participants: ['u_gym', 'u_party']
          },
          {
              id: 'demo_meetup_2',
              title: 'Sketching Walk',
              description: 'Walking around campus to sketch cool spots.',
              locationId: LocationId.DD_HILLS,
              creatorId: 'u_art',
              creatorName: 'Bella Rossi',
              startTime: Date.now() + 172800000, // +2 days
              participants: ['u_art', 'u_read']
          }
      ];
      const existingMeetups = safeJsonParse(MEETUPS_KEY, []);
      const newMeetups = meetups.filter(m => !existingMeetups.find((em: Meetup) => em.id === m.id));
      localStorage.setItem(MEETUPS_KEY, JSON.stringify([...existingMeetups, ...newMeetups]));

      // 4. Create Activity Logs
      if (currentUserId) {
          const logs: ActivityLog[] = [];
          const now = Date.now();
          const oneDay = 86400000;

          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'mood_change', timestamp: now - (oneDay * 2.5), metadata: { from: 'neutral', to: 'hungry' } });
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'mood_change', timestamp: now - (oneDay * 2), metadata: { from: 'hungry', to: 'chill' } });
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'mood_change', timestamp: now - (oneDay * 1), metadata: { from: 'chill', to: 'hyper' } });
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'mood_change', timestamp: now - (oneDay * 0.5), metadata: { from: 'hyper', to: 'motivated' } });

          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'location_enter', timestamp: now - (oneDay * 2), metadata: { locationId: LocationId.CANTEEN } });
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'location_enter', timestamp: now - (oneDay * 1.5), metadata: { locationId: LocationId.LIBRARY } });
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'location_enter', timestamp: now - (oneDay * 0.2), metadata: { locationId: LocationId.STADIUM } });

          for(let i=0; i<20; i++) {
              logs.push({ 
                  id: `demo_msg_${i}`, 
                  userId: currentUserId, 
                  type: 'message_sent', 
                  timestamp: now - (Math.random() * (oneDay * 3)), 
                  metadata: { 
                      length: Math.floor(Math.random() * 60) + 5, 
                      hasEmoji: Math.random() > 0.4, 
                      roomId: Math.random() > 0.5 ? LocationId.CANTEEN : LocationId.STADIUM 
                  } 
              });
          }
          logs.push({ id: crypto.randomUUID(), userId: currentUserId, type: 'quest_complete', timestamp: now - (oneDay * 1), metadata: { questId: 'q_canteen_visit', xp: 50 } });
          
          const existingLogs = this.getUserActivityLogs(currentUserId);
          localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify([...existingLogs, ...logs]));
      }
      
      // Reload is critical here
      window.location.reload();
    } catch (e) {
      console.error("Failed to seed demo data", e);
      alert("Error injecting demo data.");
    }
  }

  // --- Activity Logging ---
  static logActivity(userId: string, type: ActivityType, metadata: Record<string, any> = {}) {
    const logs = safeJsonParse(ACTIVITY_LOGS_KEY, []) as ActivityLog[];
    
    logs.push({
      id: crypto.randomUUID(),
      userId,
      type,
      timestamp: Date.now(),
      metadata
    });
    
    const filtered = logs.length > 2000 ? logs.slice(-2000) : logs;
    localStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(filtered));
  }

  static getUserActivityLogs(userId: string): ActivityLog[] {
    const logs = safeJsonParse(ACTIVITY_LOGS_KEY, []) as ActivityLog[];
    return logs.filter(l => l.userId === userId).sort((a, b) => a.timestamp - b.timestamp);
  }

  // --- User & Location ---
  static getUsers(): User[] {
    return safeJsonParse(USERS_KEY, []) as User[];
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      const oldUser = users[existingIndex];
      if (oldUser.currentLocationId !== user.currentLocationId && user.currentLocationId) {
        this.logActivity(user.id, 'location_enter', { 
          locationId: user.currentLocationId,
          previousLocationId: oldUser.currentLocationId
        });
      }
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      this.setCurrentUser(user);
    }
  }

  static getCurrentUser(): User | null {
    return safeJsonParse(CURRENT_USER_KEY, null);
  }

  static setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  static logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  static getUsersByLocation(locationId: string): User[] {
    return this.getUsers().filter(u => u.currentLocationId === locationId);
  }

  // --- Messaging ---
  static getMessagesRaw(): Message[] {
    return safeJsonParse(MESSAGES_KEY, []) as Message[];
  }

  static getMessages(roomId: string): Message[] {
    const allMessages = this.getMessagesRaw();
    return allMessages.filter(m => m.roomId === roomId).sort((a, b) => a.timestamp - b.timestamp);
  }

  static getMessagesByUser(userId: string): Message[] {
    const all = this.getMessagesRaw();
    return all.filter(m => m.senderId === userId);
  }

  static sendMessage(message: Message): void {
    const allMessages = this.getMessagesRaw();
    allMessages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));

    this.logActivity(message.senderId, 'message_sent', {
      length: message.text.length,
      hasEmoji: /[\u{1F600}-\u{1F64F}]/u.test(message.text),
      isQuestion: message.text.includes('?'),
      roomId: message.roomId
    });
  }

  static getDmRoomId(user1Id: string, user2Id: string): string {
    return [user1Id, user2Id].sort().join('_');
  }

  // --- Meetups ---
  static getMeetups(locationId?: string): Meetup[] {
    const allMeetups = safeJsonParse(MEETUPS_KEY, []) as Meetup[];
    if (locationId) {
      return allMeetups.filter(m => m.locationId === locationId);
    }
    return allMeetups;
  }

  static createMeetup(meetup: Meetup): void {
    const allMeetups = this.getMeetups();
    allMeetups.push(meetup);
    localStorage.setItem(MEETUPS_KEY, JSON.stringify(allMeetups));

    this.logActivity(meetup.creatorId, 'meetup_create', { 
      title: meetup.title,
      locationId: meetup.locationId
    });
  }

  static joinMeetup(meetupId: string, userId: string): void {
    let allMeetups = this.getMeetups();
    let meetupTitle = '';
    let creatorId = '';
    
    allMeetups = allMeetups.map(m => {
      if (m.id === meetupId) {
        meetupTitle = m.title;
        creatorId = m.creatorId;
        if (!m.participants.includes(userId)) {
          return { ...m, participants: [...m.participants, userId] };
        }
      }
      return m;
    });
    localStorage.setItem(MEETUPS_KEY, JSON.stringify(allMeetups));

    this.logActivity(userId, 'meetup_join', { meetupId, title: meetupTitle });

    if (creatorId && creatorId !== userId) {
      const users = this.getUsers();
      const joiner = users.find(u => u.id === userId);
      this.addNotification({
        id: crypto.randomUUID(),
        userId: creatorId,
        type: 'meetup_join',
        title: 'New Attendee',
        message: `${joiner?.name || 'Someone'} joined your meetup "${meetupTitle}"`,
        read: false,
        timestamp: Date.now(),
        link: `/chat/${allMeetups.find(m => m.id === meetupId)?.locationId}`
      });
    }
  }

  // --- Connections ---
  static getConnections(): Connection[] {
    return safeJsonParse(CONNECTIONS_KEY, []) as Connection[];
  }

  static getConnectionStatus(user1Id: string, user2Id: string): ConnectionStatus | null {
    const all = this.getConnections();
    const conn = all.find(c => 
      (c.requesterId === user1Id && c.receiverId === user2Id) || 
      (c.requesterId === user2Id && c.receiverId === user1Id)
    );
    return conn ? conn.status : null;
  }

  static sendConnectionRequest(requesterId: string, receiverId: string): void {
    const all = this.getConnections();
    const newConn: Connection = {
      id: crypto.randomUUID(),
      requesterId,
      receiverId,
      status: 'pending',
      timestamp: Date.now()
    };
    all.push(newConn);
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(all));

    const users = this.getUsers();
    const requester = users.find(u => u.id === requesterId);
    this.addNotification({
      id: crypto.randomUUID(),
      userId: receiverId,
      type: 'connection_request',
      title: 'New Connection Request',
      message: `${requester?.name} wants to connect with you.`,
      read: false,
      timestamp: Date.now(),
      link: `/people`
    });
  }

  static updateConnectionStatus(requesterId: string, receiverId: string, status: ConnectionStatus): void {
    let all = this.getConnections();
    let accepted = false;
    all = all.map(c => {
      if ((c.requesterId === requesterId && c.receiverId === receiverId) || 
          (c.requesterId === receiverId && c.receiverId === requesterId)) {
        if (status === 'accepted' && c.status !== 'accepted') accepted = true;
        return { ...c, status };
      }
      return c;
    });
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(all));

    if (accepted && status === 'accepted') {
      this.logActivity(receiverId, 'connection_made', { partnerId: requesterId });
      
      const users = this.getUsers();
      const receiver = users.find(u => u.id === receiverId); 
      this.addNotification({
        id: crypto.randomUUID(),
        userId: requesterId, 
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${receiver?.name} accepted your request!`,
        read: false,
        timestamp: Date.now(),
        link: `/chat/${this.getDmRoomId(requesterId, receiverId)}`
      });
    }
  }

  // --- Notifications ---
  static getNotifications(userId: string): Notification[] {
    const all = safeJsonParse(NOTIFICATIONS_KEY, []) as Notification[];
    return all.filter(n => n.userId === userId).sort((a, b) => b.timestamp - a.timestamp);
  }

  static addNotification(notification: Notification): void {
    const all = safeJsonParse(NOTIFICATIONS_KEY, []) as Notification[];
    all.push(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  }

  static markNotificationRead(notificationId: string): void {
    let all = safeJsonParse(NOTIFICATIONS_KEY, []) as Notification[];
    all = all.map(n => n.id === notificationId ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
  }

  // --- Reports ---
  static submitReport(report: Report): void {
    const all = safeJsonParse(REPORTS_KEY, []) as Report[];
    all.push(report);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));

    const users = this.getUsers();
    const adminId = users.length > 0 ? users[0].id : 'admin';
    this.addNotification({
      id: crypto.randomUUID(),
      userId: adminId, 
      type: 'report_alert',
      title: 'New Content Report',
      message: `A new report has been submitted regarding ${report.targetType}.`,
      read: false,
      timestamp: Date.now(),
      link: '/admin'
    });
  }

  static getReports(): Report[] {
    return safeJsonParse(REPORTS_KEY, []) as Report[];
  }

  // --- Mystery ---
  static getMysteryMeetups(): MysteryMeetup[] {
    return safeJsonParse(MYSTERY_KEY, []) as MysteryMeetup[];
  }

  static findMysteryMatch(currentUserId: string): MysteryMeetup | null {
    const users = this.getUsers();
    const meetups = this.getMysteryMeetups();

    const active = meetups.find(m => 
      (m.userAId === currentUserId || m.userBId === currentUserId) && 
      ['pending', 'accepted', 'arrived_a', 'arrived_b'].includes(m.status)
    );
    if (active) return active;

    const candidates = users.filter(u => {
      if (u.id === currentUserId) return false;
      const recentMatch = meetups.find(m => 
        ((m.userAId === currentUserId && m.userBId === u.id) || (m.userAId === u.id && m.userBId === currentUserId)) &&
        m.createdAt > (Date.now() - 24 * 60 * 60 * 1000)
      );
      if (recentMatch) return false;
      const isBusy = meetups.some(m => 
        (m.userAId === u.id || m.userBId === u.id) && 
        ['pending', 'accepted', 'arrived_a', 'arrived_b'].includes(m.status)
      );
      if (isBusy) return false;
      return true;
    });

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

    meetups.push(newMystery);
    localStorage.setItem(MYSTERY_KEY, JSON.stringify(meetups));
    
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

  static updateMysteryStatus(matchId: string, status: MysteryStatus): MysteryMeetup | null {
    const meetups = this.getMysteryMeetups();
    const idx = meetups.findIndex(m => m.id === matchId);
    if (idx === -1) return null;

    if (status === 'accepted' && meetups[idx].status === 'pending') {
      meetups[idx].expiresAt = Date.now() + 25 * 60 * 1000; 
    }

    if ((status === 'arrived_a' && meetups[idx].status === 'arrived_b') || 
        (status === 'arrived_b' && meetups[idx].status === 'arrived_a')) {
       status = 'completed';
    }

    meetups[idx].status = status;
    localStorage.setItem(MYSTERY_KEY, JSON.stringify(meetups));
    return meetups[idx];
  }

  // --- Quests ---
  static getUserQuests(userId: string): UserQuest[] {
    const all = safeJsonParse(USER_QUESTS_KEY, []) as UserQuest[];
    return all.filter(q => q.userId === userId);
  }

  static assignDailyQuests(userId: string): void {
    const existing = this.getUserQuests(userId);
    const today = new Date().toDateString();
    
    if (existing.some(q => new Date(q.assignedAt).toDateString() === today)) return;

    const shuffled = [...QUESTS].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    const all = safeJsonParse(USER_QUESTS_KEY, []) as UserQuest[];
    selected.forEach(q => {
       all.push({
         id: crypto.randomUUID(),
         userId,
         questId: q.id,
         status: 'pending',
         assignedAt: Date.now()
       });
    });
    localStorage.setItem(USER_QUESTS_KEY, JSON.stringify(all));
  }

  static verifyQuest(user: User, userQuestId: string): { success: boolean, message: string } {
    const all = safeJsonParse(USER_QUESTS_KEY, []) as UserQuest[];
    const idx = all.findIndex(q => q.id === userQuestId);
    
    if (idx === -1) return { success: false, message: 'Quest not found' };
    const userQuest = all[idx];
    if (userQuest.status === 'completed') return { success: false, message: 'Already completed' };

    const questDefinition = QUESTS.find(q => q.id === userQuest.questId);
    if (!questDefinition) return { success: false, message: 'Invalid quest' };

    let verified = false;
    if (questDefinition.verification === 'location_check') {
        if (user.currentLocationId === questDefinition.targetLocationId) verified = true;
        else return { success: false, message: 'Incorrect location' };
    } else if (questDefinition.verification === 'chat_count') {
        if (this.getMessagesByUser(user.id).length >= (questDefinition.targetCount || 1)) verified = true;
        else return { success: false, message: 'Send more messages!' };
    } else verified = true;

    if (verified) {
        all[idx].status = 'completed';
        all[idx].completedAt = Date.now();
        localStorage.setItem(USER_QUESTS_KEY, JSON.stringify(all));
        this.logActivity(user.id, 'quest_complete', { questId: userQuest.questId, xp: questDefinition.xp });
        this.addXp(user.id, questDefinition.xp);
        return { success: true, message: `Completed! +${questDefinition.xp} XP` };
    }
    return { success: false, message: 'Verification failed.' };
  }

  static addXp(userId: string, amount: number): void {
    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return;

    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXp = currentXp + amount;
    
    let newLevel = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
        if (newXp >= LEVEL_THRESHOLDS[i]) newLevel = i + 1;
    }

    if (newLevel > currentLevel) {
        this.addNotification({
            id: crypto.randomUUID(),
            userId,
            type: 'level_up',
            title: 'Level Up!',
            message: `Reached Level ${newLevel}!`,
            read: false,
            timestamp: Date.now(),
            link: '/quests'
        });
    }

    const completedQuests = this.getUserQuests(userId).filter(q => q.status === 'completed');
    const newBadges = [...(user.badges || [])];
    
    BADGES.forEach(b => {
        if (!newBadges.includes(b.id)) {
            let earned = false;
            if (b.xpRequired && newXp >= b.xpRequired) earned = true;
            if (b.questCountRequired && completedQuests.length + 1 >= b.questCountRequired) earned = true;

            if (earned) {
                newBadges.push(b.id);
                this.addNotification({
                    id: crypto.randomUUID(),
                    userId,
                    type: 'quest_complete',
                    title: 'New Badge!',
                    message: `Unlocked "${b.name}"`,
                    read: false,
                    timestamp: Date.now(),
                    link: '/quests'
                });
            }
        }
    });

    const updatedUser: User = { ...user, xp: newXp, level: newLevel, badges: newBadges };
    this.saveUser(updatedUser);
  }

  // --- Moods ---
  static setMood(userId: string, moodId: string): void {
    const user = this.getUsers().find(u => u.id === userId);
    if (!user) return;
    
    const previousMood = user.currentMood;
    const updatedUser = { ...user, currentMood: moodId, moodLastUpdated: Date.now() };
    this.saveUser(updatedUser);

    this.logActivity(userId, 'mood_change', { from: previousMood || 'none', to: moodId });

    const matches = this.getMoodMatches(userId);
    if (matches.length > 0) {
      this.addNotification({
        id: crypto.randomUUID(),
        userId,
        type: 'mood_match',
        title: 'Vibe Match!',
        message: `${matches.length} people match your vibe.`,
        read: false,
        timestamp: Date.now(),
        link: '/vibes'
      });
    }
  }

  static getMoodMatches(userId: string): MoodMatch[] {
    const users = this.getUsers();
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
