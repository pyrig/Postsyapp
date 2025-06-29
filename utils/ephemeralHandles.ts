const ADJECTIVES = [
  'Whispering', 'Silent', 'Curious', 'Thoughtful', 'Gentle', 'Wise', 'Mysterious',
  'Wandering', 'Quiet', 'Peaceful', 'Dreaming', 'Listening', 'Observing', 'Reflecting',
  'Pondering', 'Musing', 'Contemplating', 'Wondering', 'Seeking', 'Exploring'
];

const NOUNS = [
  'Voice', 'Echo', 'Whisper', 'Soul', 'Mind', 'Spirit', 'Shadow', 'Light',
  'Breeze', 'Thought', 'Dream', 'Vision', 'Spark', 'Flame', 'Wave', 'Star',
  'Moon', 'Sun', 'Cloud', 'Rain', 'Wind', 'River', 'Ocean', 'Mountain'
];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateEphemeralHandle(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  
  return `${adjective} ${noun} ${letter}`;
}

export function generateConversationHandles(): { user: string; other: string } {
  const handles = new Set<string>();
  
  while (handles.size < 2) {
    handles.add(generateEphemeralHandle());
  }
  
  const [user, other] = Array.from(handles);
  return { user, other };
}