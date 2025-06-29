interface ModerationResult {
  isAllowed: boolean;
  reason?: string;
}

const bannedWords = [
  'hate', 'spam', 'abuse', 'harassment', 'threat', 'violence',
  // Add more banned words as needed
];

const spamPatterns = [
  /(.)\1{4,}/, // Repeated characters
  /https?:\/\/[^\s]+/gi, // URLs
  /\b\d{10,}\b/g, // Long numbers (phone numbers)
];

export async function moderateContent(content: string): Promise<ModerationResult> {
  const lowerContent = content.toLowerCase();
  
  // Check for banned words
  for (const word of bannedWords) {
    if (lowerContent.includes(word)) {
      return {
        isAllowed: false,
        reason: 'Content contains inappropriate language',
      };
    }
  }
  
  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return {
        isAllowed: false,
        reason: 'Content appears to be spam',
      };
    }
  }
  
  // Check content length
  if (content.length < 3) {
    return {
      isAllowed: false,
      reason: 'Content is too short',
    };
  }
  
  // Basic sentiment analysis (simplified)
  const toxicWords = ['stupid', 'idiot', 'moron', 'dumb'];
  const toxicCount = toxicWords.filter(word => lowerContent.includes(word)).length;
  
  if (toxicCount > 2) {
    return {
      isAllowed: false,
      reason: 'Content contains toxic language',
    };
  }
  
  return { isAllowed: true };
}