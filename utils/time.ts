export function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now.getTime() - time.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) {
    return seconds < 10 ? 'just now' : `${seconds}s ago`;
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  } else {
    return time.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}