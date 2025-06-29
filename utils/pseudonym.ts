const adjectives = [
  'Wandering', 'Curious', 'Silent', 'Mystic', 'Local', 'Hidden', 'Anonymous',
  'Whispering', 'Gentle', 'Wise', 'Young', 'Ancient', 'Peaceful', 'Restless',
  'Thoughtful', 'Quiet', 'Bold', 'Shy', 'Creative', 'Dreaming', 'Listening',
];

const nouns = [
  'Yak', 'Scholar', 'Walker', 'Dreamer', 'Thinker', 'Observer', 'Listener',
  'Traveler', 'Student', 'Artist', 'Writer', 'Seeker', 'Wanderer', 'Voice',
  'Soul', 'Mind', 'Heart', 'Spirit', 'Echo', 'Shadow', 'Light', 'Wind',
];

export function generatePseudonym(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}