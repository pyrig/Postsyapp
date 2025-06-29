interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
}

const bannedWords = [
  'hate', 'spam', 'abuse', 'harassment', 'threat', 'violence', 'kill', 'die',
  'stupid', 'idiot', 'moron', 'dumb', 'loser', 'ugly', 'fat', 'worthless',
  // Add more banned words as needed
];

const spamPatterns = [
  /(.)\1{4,}/, // Repeated characters
  /https?:\/\/[^\s]+/gi, // URLs
  /\b\d{10,}\b/g, // Long numbers (phone numbers)
  /(.{1,10})\1{3,}/g, // Repeated phrases
];

const positiveWords = [
  'love', 'hope', 'peace', 'joy', 'happy', 'grateful', 'beautiful', 'amazing',
  'wonderful', 'inspiring', 'kind', 'gentle', 'caring', 'thoughtful', 'wise',
];

export async function moderateContent(content: string): Promise<ModerationResult> {
  const lowerContent = content.toLowerCase();
  const words = lowerContent.split(/\s+/);
  
  // Check for banned words
  const bannedWordCount = bannedWords.filter(word => lowerContent.includes(word)).length;
  if (bannedWordCount > 0) {
    return {
      isAllowed: false,
      reason: 'Content contains inappropriate language. Please keep your stories positive and respectful.',
    };
  }
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return {
        isAllowed: false,
        reason: 'Content appears to be spam or contains suspicious patterns.',
      };
    }
  }
  
  // Check content length
  if (content.trim().length < 3) {
    return {
      isAllowed: false,
      reason: 'Content is too short. Please share a meaningful story.',
    };
  }

  if (content.length > 280) {
    return {
      isAllowed: false,
      reason: 'Content is too long. Please keep your story under 280 characters.',
    };
  }
  
  // Check for excessive negativity
  const negativeWords = ['terrible', 'awful', 'horrible', 'disgusting', 'pathetic'];
  const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
  const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
  
  if (negativeCount > 2 && positiveCount === 0) {
    return {
      isAllowed: false,
      reason: 'Content seems overly negative. Try sharing something more uplifting or constructive.',
    };
  }

  // Check for all caps (shouting)
  const capsWords = words.filter(word => word.length > 2 && word === word.toUpperCase()).length;
  if (capsWords > words.length * 0.5) {
    return {
      isAllowed: false,
      reason: 'Please avoid using excessive capital letters.',
    };
  }

  // Check for personal information patterns
  const personalInfoPatterns = [
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email addresses
    /\b\d{1,5}\s\w+\s(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/i, // Addresses
  ];

  for (const pattern of personalInfoPatterns) {
    if (pattern.test(content)) {
      return {
        isAllowed: false,
        reason: 'Please avoid sharing personal information like phone numbers, emails, or addresses.',
      };
    }
  }
  
  return { isAllowed: true };
}

export function getSafetyTips(): string[] {
  return [
    'Keep your stories anonymous and avoid sharing personal details',
    'Be kind and respectful to others in the community',
    'Report any inappropriate content you encounter',
    'Use hashtags to connect with others who share your interests',
    'Remember that all conversations are ephemeral and will disappear',
  ];
}

export function getContentGuidelines(): string[] {
  return [
    'Share authentic, personal experiences and observations',
    'Use descriptive language to paint a picture with your words',
    'Include relevant hashtags to help others discover your story',
    'Keep posts under 280 characters for better engagement',
    'Focus on positive, uplifting, or thought-provoking content',
  ];
}