const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const shapes = ['●', '■', '▲', '◆', '★', '♦', '♠', '♣', '♥', '♪'];

export function generateAvatar(pseudonym: string) {
  // Use pseudonym as seed for consistent avatar
  let hash = 0;
  for (let i = 0; i < pseudonym.length; i++) {
    hash = pseudonym.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  const shapeIndex = Math.abs(hash >> 8) % shapes.length;
  
  return {
    color: colors[colorIndex],
    shape: shapes[shapeIndex],
  };
}