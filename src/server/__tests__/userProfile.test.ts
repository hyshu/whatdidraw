import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
  reddit: {
    getUserByUsername: vi.fn(),
    getUserById: vi.fn(),
  },
}));

import { getUserProfile, getUserProfiles, getUsernameFromId } from '../handlers/userProfile';
import { redis as mockRedis, reddit as mockReddit } from '@devvit/web/server';

describe('Phase 7.1: User Profile Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsernameFromId', () => {
    it('should return anonymous for anonymous userId', async () => {
      const result = await getUsernameFromId('anonymous');
      expect(result).toBe('anonymous');
    });

    it('should return anonymous for empty userId', async () => {
      const result = await getUsernameFromId('');
      expect(result).toBe('anonymous');
    });

    it('should fetch username from Reddit for t2_ prefixed userId', async () => {
      mockReddit.getUserById.mockResolvedValue({
        username: 'testuser',
      });

      const result = await getUsernameFromId('t2_12345');
      expect(mockReddit.getUserById).toHaveBeenCalledWith('t2_12345');
      expect(result).toBe('testuser');
    });

    it('should return userId directly if not t2_ prefixed', async () => {
      const result = await getUsernameFromId('testuser');
      expect(result).toBe('testuser');
      expect(mockReddit.getUserById).not.toHaveBeenCalled();
    });

    it('should handle error when fetching username', async () => {
      mockReddit.getUserById.mockRejectedValue(new Error('User not found'));

      const result = await getUsernameFromId('t2_invalid');
      expect(result).toBe('anonymous');
    });
  });

  describe('getUserProfile', () => {
    it('should return cached profile if available', async () => {
      const cachedProfile = {
        userId: 'testuser',
        displayName: 'u/testuser',
        avatarUrl: 'https://example.com/avatar.png',
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedProfile));

      const result = await getUserProfile('testuser');
      expect(result).toEqual(cachedProfile);
      expect(mockRedis.get).toHaveBeenCalledWith('cache:avatar:testuser');
      expect(mockReddit.getUserByUsername).not.toHaveBeenCalled();
    });

    it('should fetch avatar from Reddit if not cached', async () => {
      mockRedis.get.mockResolvedValue(null);

      const mockUser = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/snoovatar.png'),
      };
      mockReddit.getUserByUsername.mockResolvedValue(mockUser);

      const result = await getUserProfile('testuser');

      expect(result.userId).toBe('testuser');
      expect(result.displayName).toBe('u/testuser');
      expect(result.avatarUrl).toBe('https://example.com/snoovatar.png');
      expect(mockReddit.getUserByUsername).toHaveBeenCalledWith('testuser');
      expect(mockUser.getSnoovatarUrl).toHaveBeenCalled();
    });

    it('should cache fetched profile with 1 hour TTL', async () => {
      mockRedis.get.mockResolvedValue(null);

      const mockUser = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/snoovatar.png'),
      };
      mockReddit.getUserByUsername.mockResolvedValue(mockUser);

      await getUserProfile('testuser');

      expect(mockRedis.set).toHaveBeenCalledWith(
        'cache:avatar:testuser',
        expect.any(String),
        expect.objectContaining({
          expiration: expect.any(Date),
        })
      );

      const setCalls = mockRedis.set.mock.calls[0];
      const expirationDate = setCalls[2].expiration;
      const expectedExpiration = Date.now() + 3600 * 1000;
      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(expectedExpiration - 1000);
      expect(expirationDate.getTime()).toBeLessThanOrEqual(expectedExpiration + 1000);
    });

    it('should return profile without avatarUrl if Reddit fetch fails', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockReddit.getUserByUsername.mockRejectedValue(new Error('User not found'));

      const result = await getUserProfile('nonexistent');

      expect(result.userId).toBe('nonexistent');
      expect(result.displayName).toBe('u/nonexistent');
      expect(result.avatarUrl).toBeUndefined();
    });

    it('should handle cache read errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const mockUser = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/snoovatar.png'),
      };
      mockReddit.getUserByUsername.mockResolvedValue(mockUser);

      const result = await getUserProfile('testuser');

      expect(result.userId).toBe('testuser');
      expect(result.displayName).toBe('u/testuser');
      expect(result.avatarUrl).toBe('https://example.com/snoovatar.png');
    });

    it('should handle cache write errors gracefully', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockRedis.set.mockRejectedValue(new Error('Redis write error'));

      const mockUser = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/snoovatar.png'),
      };
      mockReddit.getUserByUsername.mockResolvedValue(mockUser);

      const result = await getUserProfile('testuser');

      expect(result.userId).toBe('testuser');
      expect(result.displayName).toBe('u/testuser');
      expect(result.avatarUrl).toBe('https://example.com/snoovatar.png');
    });

    it('should format displayName with u/ prefix', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockReddit.getUserByUsername.mockResolvedValue(null);

      const result = await getUserProfile('player123');

      expect(result.displayName).toBe('u/player123');
    });
  });

  describe('getUserProfiles', () => {
    it('should fetch profiles for multiple users', async () => {
      mockRedis.get.mockResolvedValue(null);

      const mockUser1 = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/avatar1.png'),
      };
      const mockUser2 = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/avatar2.png'),
      };

      mockReddit.getUserByUsername
        .mockResolvedValueOnce(mockUser1)
        .mockResolvedValueOnce(mockUser2);

      const result = await getUserProfiles(['user1', 'user2']);

      expect(result.size).toBe(2);
      expect(result.get('user1')?.userId).toBe('user1');
      expect(result.get('user1')?.avatarUrl).toBe('https://example.com/avatar1.png');
      expect(result.get('user2')?.userId).toBe('user2');
      expect(result.get('user2')?.avatarUrl).toBe('https://example.com/avatar2.png');
    });

    it('should handle errors for individual users', async () => {
      mockRedis.get.mockResolvedValue(null);

      const mockUser = {
        getSnoovatarUrl: vi.fn().mockResolvedValue('https://example.com/avatar.png'),
      };

      mockReddit.getUserByUsername
        .mockResolvedValueOnce(mockUser)
        .mockRejectedValueOnce(new Error('User not found'));

      const result = await getUserProfiles(['user1', 'user2']);

      expect(result.size).toBe(2);
      expect(result.get('user1')?.avatarUrl).toBe('https://example.com/avatar.png');
      expect(result.get('user2')?.avatarUrl).toBeUndefined();
    });
  });
});
