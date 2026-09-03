import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `TZS ${price.toLocaleString()}`;
}

export function formatTZS(amount: number): string {
  return `TZS ${amount.toLocaleString()}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getXpLevelInfo(pts: number) {
  if (pts < 200) {
    return { 
      level: 1, 
      title: 'Mwanafunzi Mpya (Newbie)', 
      currentXp: pts,
      prevXp: 0,
      nextXp: 200, 
      neededXp: 200 - pts,
      progress: Math.min(100, Math.max(5, Math.round((pts / 200) * 100))) 
    };
  } else if (pts < 500) {
    return { 
      level: 2, 
      title: 'Junior Coder', 
      currentXp: pts,
      prevXp: 200,
      nextXp: 500, 
      neededXp: 500 - pts,
      progress: Math.min(100, Math.max(5, Math.round(((pts - 200) / 300) * 100))) 
    };
  } else if (pts < 1000) {
    return { 
      level: 3, 
      title: 'Pro Developer', 
      currentXp: pts,
      prevXp: 500,
      nextXp: 1000, 
      neededXp: 1000 - pts,
      progress: Math.min(100, Math.max(5, Math.round(((pts - 500) / 500) * 100))) 
    };
  } else if (pts < 2500) {
    return { 
      level: 4, 
      title: 'Senior Software Architect', 
      currentXp: pts,
      prevXp: 1000,
      nextXp: 2500, 
      neededXp: 2500 - pts,
      progress: Math.min(100, Math.max(5, Math.round(((pts - 1000) / 1500) * 100))) 
    };
  } else {
    return { 
      level: 5, 
      title: 'Master Engineer & Tech Lead', 
      currentXp: pts,
      prevXp: 2500,
      nextXp: 5000, 
      neededXp: 0,
      progress: 100 
    };
  }
}
