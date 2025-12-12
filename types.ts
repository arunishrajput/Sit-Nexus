
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  department: string;
  year: string;
  bio: string;
  avatarUrl?: string;
  interests: string[];
  currentLocationId?: string; // For "People Nearby" feature
  
  // Gamification
  xp: number;
  level: number;
  badges: string[]; // Array of Badge IDs

  // Mood System
  currentMood?: string; // Mood ID
  moodLastUpdated?: number;
}

export interface Message {
  id: string;
  roomId: string; // Can be a location ID (e.g., 'canteen') or a DM ID (e.g., 'user1_user2')
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  readBy: string[];
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  locationId: string; // 'canteen', 'stadium', 'library'
  creatorId: string;
  creatorName: string;
  startTime: number;
  participants: string[];
}

export enum LocationId {
  // Campus
  CANTEEN = 'canteen',
  STADIUM = 'stadium',
  LIBRARY = 'library',
  BASKETBALL_COURT = 'basketball_court',
  COFFEE_SHOP = 'coffee_shop',
  BACK_GATE = 'back_gate',
  GYMNASIUM = 'gymnasium',
  
  // Outside
  DD_HILLS = 'dd_hills',
  NANDI_HILLS = 'nandi_hills',
  S_MALL = 's_mall',
  OTHER = 'other_outside'
}

export interface LocationInfo {
  id: LocationId;
  name: string;
  description: string;
  imageUrl: string;
  category: 'campus' | 'outside';
}

// --- New Features Types ---

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  timestamp: number;
}

export type NotificationType = 'message' | 'connection_request' | 'connection_accepted' | 'meetup_join' | 'report_alert' | 'mystery_match' | 'quest_complete' | 'level_up' | 'mood_match';

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  link?: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string; // ID of user, message, or meetup being reported
  targetType: 'user' | 'meetup' | 'message';
  reason: string;
  timestamp: number;
  status: 'open' | 'resolved';
}

// --- Mystery Meetup Types ---

export type MysteryStatus = 'pending' | 'accepted' | 'arrived_a' | 'arrived_b' | 'completed' | 'expired' | 'declined';

export interface MysteryMeetup {
  id: string;
  userAId: string;
  userBId: string;
  locationId: string;
  hint: string;
  createdAt: number;
  expiresAt: number;
  status: MysteryStatus;
}

// --- Quest Types ---

export type QuestCategory = 'location' | 'social' | 'photo' | 'group';
export type QuestDifficulty = 'easy' | 'medium' | 'hard';
export type QuestVerification = 'manual' | 'location_check' | 'photo_upload' | 'chat_count';

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  verification: QuestVerification;
  targetLocationId?: string; // For location checks
  targetCount?: number; // For chat counts
}

export interface UserQuest {
  id: string; // Unique instance ID
  userId: string;
  questId: string;
  status: 'pending' | 'completed';
  assignedAt: number;
  completedAt?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpRequired?: number; // Condition: Reach X XP
  questCountRequired?: number; // Condition: Complete X quests
}

// --- Mood System Types ---

export interface MoodConfig {
  id: string;
  label: string;
  icon: string;
  color: string; // Tailwind color class base (e.g. 'orange', 'blue')
  description: string;
  compatibleWith: string[]; // List of Mood IDs
  suggestedLocationIds: string[];
}

export interface MoodMatch {
  user: User;
  score: number;
  reasons: string[];
}

// --- Behavior Analysis Types ---

export type ActivityType = 
  | 'mood_change' 
  | 'message_sent' 
  | 'meetup_join' 
  | 'meetup_create' 
  | 'location_enter' 
  | 'quest_complete' 
  | 'connection_made';

export interface ActivityLog {
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: number;
  metadata: Record<string, any>; // Flexible JSON data
}

export interface BehaviorAnalysisResult {
  personalityTitle: string; // e.g., "The Chill Wizard"
  summary: string;
  insights: string[];
  predictions: {
    nextMood: string;
    likelyMeetup: string;
  };
  radarChart: {
    social: number;
    stability: number;
    chaos: number;
    exploration: number;
    energy: number;
  };
  recommendedSpots: string[];
}
