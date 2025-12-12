import { LocationId, LocationInfo, Quest, Badge, MoodConfig } from './types';

export const LOCATIONS: LocationInfo[] = [
  // Campus Locations
  {
    id: LocationId.CANTEEN,
    name: 'Main Canteen',
    description: 'Grab a bite, discuss projects, or just hang out.',
    imageUrl: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.STADIUM,
    name: 'Sports Stadium',
    description: 'Meet for a run, football match, or gym session.',
    imageUrl: 'https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.LIBRARY,
    name: 'Central Library',
    description: 'Quiet study sessions and book exchanges.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.BASKETBALL_COURT,
    name: 'Basketball Court',
    description: 'Shoot some hoops and catch the game energy.',
    imageUrl: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.COFFEE_SHOP,
    name: 'SIT Coffee Shop',
    description: 'Caffeine fix and casual conversations.',
    imageUrl: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.BACK_GATE,
    name: 'Back Gate',
    description: 'The quick exit and street food hub.',
    imageUrl: 'https://images.unsplash.com/photo-1595113316349-9fa4eb24f884?w=800&q=80',
    category: 'campus'
  },
  {
    id: LocationId.GYMNASIUM,
    name: 'Gymnasium',
    description: 'Fitness center for workouts and training.',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    category: 'campus'
  },

  // Outside Locations
  {
    id: LocationId.DD_HILLS,
    name: 'DD Hills',
    description: 'A scenic trek for nature lovers and adventurers.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    category: 'outside'
  },
  {
    id: LocationId.NANDI_HILLS,
    name: 'Nandi Hills',
    description: 'Sunrise views and weekend misty drives.',
    imageUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80',
    category: 'outside'
  },
  {
    id: LocationId.S_MALL,
    name: 'S Mall',
    description: 'Movies, shopping, and food court fun.',
    imageUrl: 'https://images.unsplash.com/photo-1581339399838-2a120c18b602?w=800&q=80',
    category: 'outside'
  },
  {
    id: LocationId.OTHER,
    name: 'Custom Destination',
    description: 'Suggest a new place! Enter name in chat.',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    category: 'outside'
  }
];

export const DEPARTMENTS = [
  'Computer Science',
  'Mechanical Eng.',
  'Civil Eng.',
  'Electrical Eng.',
  'Business Admin',
  'Architecture',
];

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduated'];

export const MYSTERY_HINTS: Record<string, { hint: string, icon: string }> = {
  [LocationId.CANTEEN]: { hint: "Where flavors meet noise and hunger finds its end.", icon: "🍔" },
  [LocationId.STADIUM]: { hint: "Where champions are forged and the ground shakes.", icon: "🏆" },
  [LocationId.LIBRARY]: { hint: "Where silence speaks volumes and wisdom sleeps.", icon: "📚" },
  [LocationId.BASKETBALL_COURT]: { hint: "Listen for the squeak of shoes and the swish of the net.", icon: "🏀" },
  [LocationId.COFFEE_SHOP]: { hint: "Follow the aroma of roasted beans to find your energy.", icon: "☕" },
  [LocationId.BACK_GATE]: { hint: "Meet me where the campus ends and the street food begins.", icon: "🚪" },
  [LocationId.GYMNASIUM]: { hint: "Where iron is lifted and sweat is earned.", icon: "🏋️" },
  [LocationId.DD_HILLS]: { hint: "A rocky climb that rewards you with the wind.", icon: "⛰️" },
  [LocationId.NANDI_HILLS]: { hint: "Chase the sunrise above the clouds.", icon: "🌅" },
  [LocationId.S_MALL]: { hint: "Lights, camera, shopping bags!", icon: "🛍️" },
  [LocationId.OTHER]: { hint: "A journey to the unknown. Check the chat!", icon: "🗺️" }
};

// --- Gamification Data ---

export const QUESTS: Quest[] = [
  {
    id: 'q_canteen_visit',
    title: 'Hungry Explorer',
    description: 'Check-in at the Main Canteen.',
    xp: 50,
    category: 'location',
    difficulty: 'easy',
    verification: 'location_check',
    targetLocationId: LocationId.CANTEEN
  },
  {
    id: 'q_library_study',
    title: 'Bookworm Mode',
    description: 'Check-in at the Library to study.',
    xp: 60,
    category: 'location',
    difficulty: 'medium',
    verification: 'location_check',
    targetLocationId: LocationId.LIBRARY
  },
  {
    id: 'q_social_chat',
    title: 'Social Butterfly',
    description: 'Send 3 messages in any location chat room.',
    xp: 80,
    category: 'social',
    difficulty: 'easy',
    verification: 'chat_count',
    targetCount: 3
  },
  {
    id: 'q_stadium_selfie',
    title: 'Field Reporter',
    description: 'Upload a photo from the Sports Stadium.',
    xp: 100,
    category: 'photo',
    difficulty: 'medium',
    verification: 'photo_upload',
    targetLocationId: LocationId.STADIUM
  },
  {
    id: 'q_connect_new',
    title: 'Networking Novice',
    description: 'Send a connection request to someone new.',
    xp: 120,
    category: 'social',
    difficulty: 'hard',
    verification: 'manual' // Simplified for demo
  },
  {
    id: 'q_group_lunch',
    title: 'Lunch Squad',
    description: 'Verify you are at the Canteen with a group.',
    xp: 150,
    category: 'group',
    difficulty: 'hard',
    verification: 'manual'
  }
];

export const BADGES: Badge[] = [
  {
    id: 'b_starter',
    name: '1st Year Starter',
    description: 'Reach Level 2',
    icon: '🌱',
    xpRequired: 100
  },
  {
    id: 'b_social',
    name: 'Socialite',
    description: 'Complete 5 Quests',
    icon: '🗣️',
    questCountRequired: 5
  },
  {
    id: 'b_explorer',
    name: 'Campus Explorer',
    description: 'Reach Level 5',
    icon: '🧭',
    xpRequired: 500
  },
  {
    id: 'b_legend',
    name: 'SIT Legend',
    description: 'Reach Level 10',
    icon: '👑',
    xpRequired: 1500
  }
];

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

// --- Mood System ---

export const MOODS: MoodConfig[] = [
  {
    id: 'hungry',
    label: 'Hungry',
    icon: '🍕',
    color: 'orange',
    description: 'Looking for a food buddy.',
    compatibleWith: ['bored', 'chill', 'hyper'],
    suggestedLocationIds: [LocationId.CANTEEN, LocationId.COFFEE_SHOP, LocationId.BACK_GATE]
  },
  {
    id: 'study',
    label: 'Study Mode',
    icon: '📚',
    color: 'blue',
    description: 'Focusing on assignments.',
    compatibleWith: ['motivated', 'overthinking'],
    suggestedLocationIds: [LocationId.LIBRARY]
  },
  {
    id: 'chaotic',
    label: 'Chaotic',
    icon: '🔥',
    color: 'red',
    description: 'Ready for anything crazy.',
    compatibleWith: ['hyper', 'bored'],
    suggestedLocationIds: [LocationId.STADIUM, LocationId.BASKETBALL_COURT, LocationId.S_MALL]
  },
  {
    id: 'chill',
    label: 'Chill',
    icon: '🌿',
    color: 'green',
    description: 'Just relaxing, no stress.',
    compatibleWith: ['bored', 'hungry', 'sleepy'],
    suggestedLocationIds: [LocationId.CANTEEN, LocationId.COFFEE_SHOP, LocationId.NANDI_HILLS]
  },
  {
    id: 'single',
    label: 'Single & Confused',
    icon: '💔',
    color: 'pink',
    description: 'Looking to mingle (maybe).',
    compatibleWith: ['bored', 'chaotic', 'chill'],
    suggestedLocationIds: [LocationId.CANTEEN, LocationId.LIBRARY, LocationId.COFFEE_SHOP]
  },
  {
    id: 'hyper',
    label: 'Hyper',
    icon: '⚡',
    color: 'yellow',
    description: 'Too much energy!',
    compatibleWith: ['chaotic', 'hungry', 'motivated'],
    suggestedLocationIds: [LocationId.STADIUM, LocationId.BASKETBALL_COURT, LocationId.GYMNASIUM]
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    icon: '😴',
    color: 'purple',
    description: 'Need coffee or a nap.',
    compatibleWith: ['chill', 'overthinking'],
    suggestedLocationIds: [LocationId.LIBRARY, LocationId.COFFEE_SHOP]
  },
  {
    id: 'motivated',
    label: 'Motivated',
    icon: '💪',
    color: 'teal',
    description: 'Let\'s get things done.',
    compatibleWith: ['study', 'hyper'],
    suggestedLocationIds: [LocationId.LIBRARY, LocationId.GYMNASIUM]
  },
  {
    id: 'overthinking',
    label: 'Overthinking',
    icon: '☁️',
    color: 'gray',
    description: 'Head in the clouds.',
    compatibleWith: ['study', 'sleepy', 'single'],
    suggestedLocationIds: [LocationId.LIBRARY, LocationId.DD_HILLS]
  },
  {
    id: 'bored',
    label: 'Bored',
    icon: '👻',
    color: 'slate',
    description: 'Save me from boredom.',
    compatibleWith: ['chaotic', 'hungry', 'chill'],
    suggestedLocationIds: [LocationId.STADIUM, LocationId.S_MALL, LocationId.OTHER]
  }
];