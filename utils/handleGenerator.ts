const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '0123456789';

export function generateHandle(): string {
  // Generate a handle with format: 2-3 letters + 3-4 numbers + 1-2 letters
  const firstLetters = Array.from({ length: Math.floor(Math.random() * 2) + 2 }, () => 
    LETTERS[Math.floor(Math.random() * LETTERS.length)]
  ).join('');
  
  const numbers = Array.from({ length: Math.floor(Math.random() * 2) + 3 }, () => 
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
  ).join('');
  
  const lastLetters = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, () => 
    LETTERS[Math.floor(Math.random() * LETTERS.length)]
  ).join('');
  
  return `${firstLetters}${numbers}${lastLetters}`;
}