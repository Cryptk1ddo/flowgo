import { describe, it, expect } from 'vitest';
import { calculateLevel, getXpForNextLevel, calculateTaskXp } from '../lib/gamification';
import { Task } from '../lib/types';

describe('Gamification Engine', () => {
  describe('calculateLevel', () => {
    it('should be level 0 for 0 XP', () => {
      expect(calculateLevel(0).level).toBe(0);
    });

    it('should reach level 1 at ~500 XP', () => {
      expect(calculateLevel(499).level).toBe(0);
      expect(calculateLevel(500).level).toBe(1);
    });

    it('calculates higher levels correctly', () => {
      // 500 * (2^(1/0.6)) ~= 1587
      expect(calculateLevel(1586).level).toBe(1);
      expect(calculateLevel(1587).level).toBe(2);
      // 500 * (10^(1/0.6)) ~= 23290
      expect(calculateLevel(23289).level).toBe(9);
      expect(calculateLevel(23290).level).toBe(10);
    });
  });

  describe('getXpForNextLevel', () => {
    it('should return 500 for level 0', () => {
      expect(getXpForNextLevel(0)).toBe(500);
    });

    it('should return the correct XP for the start of the next level', () => {
      expect(getXpForNextLevel(1)).toBe(1588); // ceil(1587.4)
      expect(getXpForNextLevel(9)).toBe(23290); // ceil(23289.8)
    });
  });

  describe('calculateTaskXp', () => {
    it('gives base XP for a task with no estimate', () => {
      const task: Task = { id: '1', title: 'test', priority: 1, completed: false };
      expect(calculateTaskXp(task)).toBe(10);
    });
    
    it('adds XP based on estimated minutes', () => {
      const task15: Task = { id: '1', title: 'test', priority: 1, completed: false, estimateMinutes: 15 };
      expect(calculateTaskXp(task15)).toBe(11); // 10 + ceil(15/15)

      const task35: Task = { id: '1', title: 'test', priority: 1, completed: false, estimateMinutes: 35 };
      expect(calculateTaskXp(task35)).toBe(13); // 10 + ceil(35/15) -> 10 + 3
    });
  });
});
import { describe, it, expect } from 'vitest';
import { calculateLevel, getXpForNextLevel, calculateTaskXp } from '../lib/gamification';
import { Task } from '../lib/types';

describe('Gamification Engine', () => {
  describe('calculateLevel', () => {
    it('should be level 0 for 0 XP', () => {
      expect(calculateLevel(0).level).toBe(0);
    });

    it('should reach level 1 at ~500 XP', () => {
      expect(calculateLevel(499).level).toBe(0);
      expect(calculateLevel(500).level).toBe(1);
    });

    it('calculates higher levels correctly', () => {
      expect(calculateLevel(1586).level).toBe(1);
      expect(calculateLevel(1587).level).toBe(2);
      expect(calculateLevel(23289).level).toBe(9);
      expect(calculateLevel(23290).level).toBe(10);
    });
  });

  describe('getXpForNextLevel', () => {
    it('should return 500 for level 0', () => {
      expect(getXpForNextLevel(0)).toBe(500);
    });

    it('should return the correct XP for the start of the next level', () => {
      expect(getXpForNextLevel(1)).toBe(1588);
      expect(getXpForNextLevel(9)).toBe(23290);
    });
  });

  describe('calculateTaskXp', () => {
    it('gives base XP for a task with no estimate', () => {
      const task: Task = { id: '1', title: 'test', priority: 1, completed: false };
      expect(calculateTaskXp(task)).toBe(10);
    });
    
    it('adds XP based on estimated minutes', () => {
      const task15: Task = { id: '1', title: 'test', priority: 1, completed: false, estimateMinutes: 15 };
      expect(calculateTaskXp(task15)).toBe(11);

      const task35: Task = { id: '1', title: 'test', priority: 1, completed: false, estimateMinutes: 35 };
      expect(calculateTaskXp(task35)).toBe(13);
    });
  });
});
