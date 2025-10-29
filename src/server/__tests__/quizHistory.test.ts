import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisStorage } from '../storage/redis';
import { Drawing, Score } from '../../shared/types/api';

const createMockRedis = () => {
  const store = new Map<string, any>();
  const sortedSets = new Map<string, Array<{ member: string; score: number }>>();

  return {
    incrBy: vi.fn(async (key: string, value: number) => {
      const current = store.get(key) || 0;
      const newValue = current + value;
      store.set(key, newValue);
      return newValue;
    }),
    hSet: vi.fn(async (key: string, data: Record<string, string>) => {
      store.set(key, data);
    }),
    hGetAll: vi.fn(async (key: string) => {
      return store.get(key) || {};
    }),
    zAdd: vi.fn(async (key: string, data: { member: string; score: number } | Array<{ member: string; score: number }>) => {
      const items = Array.isArray(data) ? data : [data];
      const existing = sortedSets.get(key) || [];

      for (const item of items) {
        const index = existing.findIndex(e => e.member === item.member);
        if (index >= 0) {
          existing[index] = item;
        } else {
          existing.push(item);
        }
      }

      existing.sort((a, b) => b.score - a.score);
      sortedSets.set(key, existing);
    }),
    zRange: vi.fn(async (key: string, start: number, end: number, options?: { by?: string; reverse?: boolean }) => {
      const items = sortedSets.get(key) || [];

      if (options?.reverse) {
        const sorted = [...items].sort((a, b) => b.score - a.score);
        const actualEnd = end === -1 ? sorted.length : end + 1;
        return sorted.slice(start, actualEnd);
      }

      const actualEnd = end === -1 ? items.length : end + 1;
      return items.slice(start, actualEnd);
    }),
    zRevRank: vi.fn(async (key: string, member: string) => {
      const items = sortedSets.get(key) || [];
      const sorted = [...items].sort((a, b) => b.score - a.score);
      const index = sorted.findIndex(item => item.member === member);
      return index >= 0 ? index : null;
    }),
    zRemRangeByRank: vi.fn(async (key: string, start: number, end: number) => {
      const items = sortedSets.get(key) || [];
      const actualEnd = end < 0 ? items.length + end + 1 : end + 1;
      items.splice(start, actualEnd - start);
      sortedSets.set(key, items);
    }),
    zCard: vi.fn(async (key: string) => {
      const items = sortedSets.get(key) || [];
      return items.length;
    }),
    watch: vi.fn(async (...keys: string[]) => {
      return {
        multi: vi.fn(async () => {}),
        hSet: vi.fn(async (key: string, data: Record<string, string>) => {
          store.set(key, data);
        }),
        zAdd: vi.fn(async (key: string, data: { member: string; score: number }) => {
          const existing = sortedSets.get(key) || [];
          const index = existing.findIndex(e => e.member === data.member);
          if (index >= 0) {
            existing[index] = data;
          } else {
            existing.push(data);
          }
          existing.sort((a, b) => b.score - a.score);
          sortedSets.set(key, existing);
        }),
        zRemRangeByRank: vi.fn(async (key: string, start: number, end: number) => {
          const items = sortedSets.get(key) || [];
          const actualEnd = end < 0 ? items.length + end + 1 : end + 1;
          items.splice(start, actualEnd - start);
          sortedSets.set(key, items);
        }),
        exec: vi.fn(async () => {
          return [true];
        }),
      };
    }),
    _store: store,
    _sortedSets: sortedSets,
  };
};

describe('Quiz History Tests', () => {
  let mockRedis: any;
  let storage: RedisStorage;

  beforeEach(() => {
    mockRedis = createMockRedis();
    storage = new RedisStorage(mockRedis as any);
  });

  describe('Phase 7.2: Quiz History Storage', () => {
    it('should save quiz history when score is submitted', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        hint: 'Meows',
        strokes: [
          {
            points: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
            color: '#000000',
            width: 5,
            timestamp: 0,
          },
        ],
        totalStrokes: 1,
      };

      const drawingId = await storage.saveDrawing(drawing);

      const score: Omit<Score, 'id'> = {
        drawingId,
        userId: 'test-user',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      await storage.saveScore(score);

      const historyKey = `user:${score.userId}:quiz-history`;
      const historyItems = mockRedis._sortedSets.get(historyKey);

      expect(historyItems).toBeDefined();
      expect(historyItems.length).toBe(1);

      const historyEntry = JSON.parse(historyItems[0].member);
      expect(historyEntry.drawingId).toBe(drawingId);
      expect(historyEntry.score).toBe(850);
      expect(historyEntry.baseScore).toBe(700);
      expect(historyEntry.timeBonus).toBe(150);
    });

    it('should retrieve quiz history for user', async () => {
      const drawing1: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawing2: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Dog',
        strokes: [],
        totalStrokes: 8,
      };

      const drawingId1 = await storage.saveDrawing(drawing1);
      const drawingId2 = await storage.saveDrawing(drawing2);

      const score1: Omit<Score, 'id'> = {
        drawingId: drawingId1,
        userId: 'test-user',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      const score2: Omit<Score, 'id'> = {
        drawingId: drawingId2,
        userId: 'test-user',
        score: 650,
        baseScore: 500,
        timeBonus: 150,
        elapsedTime: 41,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1000,
      };

      await storage.saveScore(score1);
      await storage.saveScore(score2);

      const history = await storage.getQuizHistory('test-user', 1, 10);

      expect(history.entries.length).toBe(2);
      expect(history.total).toBe(2);
      expect(history.entries[0].drawingAnswer).toBe('Dog');
      expect(history.entries[1].drawingAnswer).toBe('Cat');
    });

    it('should handle empty quiz history', async () => {
      const history = await storage.getQuizHistory('non-existent-user', 1, 10);

      expect(history.entries.length).toBe(0);
      expect(history.total).toBe(0);
    });

    it('should support pagination', async () => {
      const drawing1: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawing2: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Dog',
        strokes: [],
        totalStrokes: 8,
      };

      const drawing3: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Bird',
        strokes: [],
        totalStrokes: 12,
      };

      const drawingId1 = await storage.saveDrawing(drawing1);
      const drawingId2 = await storage.saveDrawing(drawing2);
      const drawingId3 = await storage.saveDrawing(drawing3);

      await storage.saveScore({
        drawingId: drawingId1,
        userId: 'test-user',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      });

      await storage.saveScore({
        drawingId: drawingId2,
        userId: 'test-user',
        score: 650,
        baseScore: 500,
        timeBonus: 150,
        elapsedTime: 41,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1000,
      });

      await storage.saveScore({
        drawingId: drawingId3,
        userId: 'test-user',
        score: 450,
        baseScore: 400,
        timeBonus: 50,
        elapsedTime: 55,
        viewedStrokes: 6,
        submittedAt: Date.now() + 2000,
      });

      const page1 = await storage.getQuizHistory('test-user', 1, 2);
      expect(page1.entries.length).toBe(2);
      expect(page1.total).toBe(3);
      expect(page1.entries[0].drawingAnswer).toBe('Bird');
      expect(page1.entries[1].drawingAnswer).toBe('Dog');

      const page2 = await storage.getQuizHistory('test-user', 2, 2);
      expect(page2.entries.length).toBe(1);
      expect(page2.total).toBe(3);
      expect(page2.entries[0].drawingAnswer).toBe('Cat');
    });

    it('should include rank in quiz history', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      await storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 800,
        timeBonus: 200,
        elapsedTime: 40,
        viewedStrokes: 2,
        submittedAt: Date.now(),
      });

      await storage.saveScore({
        drawingId,
        userId: 'user2',
        score: 900,
        baseScore: 700,
        timeBonus: 200,
        elapsedTime: 40,
        viewedStrokes: 3,
        submittedAt: Date.now() + 100,
      });

      await storage.saveScore({
        drawingId,
        userId: 'test-user',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now() + 200,
      });

      const history = await storage.getQuizHistory('test-user', 1, 10);

      expect(history.entries.length).toBe(1);
      expect(history.entries[0].rank).toBeGreaterThanOrEqual(1);
      expect(history.entries[0].rank).toBeLessThanOrEqual(5);
    });
  });

  describe('Phase 7.3: Global Ranking Storage', () => {
    it('should store global ranking in Redis sorted set', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      const score: Omit<Score, 'id'> = {
        drawingId,
        userId: 'player1',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      await storage.saveScore(score);

      const globalLeaderboardKey = 'global:leaderboard';
      const leaderboardItems = mockRedis._sortedSets.get(globalLeaderboardKey);

      expect(leaderboardItems).toBeDefined();
      expect(leaderboardItems?.some(item => item.member === 'player1')).toBe(true);
    });

    it('should store player stats in Redis hash', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      const score: Omit<Score, 'id'> = {
        drawingId,
        userId: 'player1',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      await storage.saveScore(score);

      const playerStatsKey = 'player:player1:stats';
      const playerStats = mockRedis._store.get(playerStatsKey);

      expect(playerStats).toBeDefined();
      expect(playerStats.totalScore).toBe('850');
      expect(playerStats.quizCount).toBe('1');
    });

    it('should update global ranking atomically with score submission', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 500,
        baseScore: 400,
        timeBonus: 100,
        elapsedTime: 50,
        viewedStrokes: 6,
        submittedAt: Date.now(),
      });

      let globalLeaderboard = mockRedis._sortedSets.get('global:leaderboard');
      let player1Entry = globalLeaderboard?.find(item => item.member === 'player1');
      expect(player1Entry?.score).toBe(500);

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1000,
      });

      globalLeaderboard = mockRedis._sortedSets.get('global:leaderboard');
      player1Entry = globalLeaderboard?.find(item => item.member === 'player1');
      expect(player1Entry?.score).toBe(1000);
    });

    it('should calculate score difference when updating', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 500,
        baseScore: 400,
        timeBonus: 100,
        elapsedTime: 50,
        viewedStrokes: 6,
        submittedAt: Date.now(),
      });

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1000,
      });

      const playerStats = mockRedis._store.get('player:player1:stats');
      expect(playerStats.totalScore).toBe('1000');
    });

    it('should increment quiz count only for first-time quiz answers', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 500,
        baseScore: 400,
        timeBonus: 100,
        elapsedTime: 50,
        viewedStrokes: 6,
        submittedAt: Date.now(),
      });

      let playerStats = mockRedis._store.get('player:player1:stats');
      expect(playerStats.quizCount).toBe('1');

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1000,
      });

      playerStats = mockRedis._store.get('player:player1:stats');
      expect(playerStats.quizCount).toBe('1');
    });

    it('should support multiple players in global ranking', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      for (let i = 0; i < 3; i++) {
        await storage.saveScore({
          drawingId,
          userId: `player${i}`,
          score: 1000 - i * 100,
          baseScore: 700 - i * 50,
          timeBonus: 300 - i * 50,
          elapsedTime: 30 + i * 10,
          viewedStrokes: 3 + i,
          submittedAt: Date.now() + i * 1000,
        });
      }

      const globalLeaderboard = mockRedis._sortedSets.get('global:leaderboard');
      expect(globalLeaderboard?.length).toBe(3);
      expect(globalLeaderboard?.[0].member).toBe('player0');
      expect(globalLeaderboard?.[0].score).toBe(1000);
    });

    it('should retrieve global leaderboard with pagination', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      for (let i = 0; i < 60; i++) {
        await storage.saveScore({
          drawingId,
          userId: `player${i}`,
          score: 1000 - i * 10,
          baseScore: 700 - i * 5,
          timeBonus: 300 - i * 5,
          elapsedTime: 30 + i,
          viewedStrokes: 3,
          submittedAt: Date.now() + i * 100,
        });
      }

      const globalLeaderboard50 = await storage.getGlobalRanking(50);
      expect(globalLeaderboard50.entries.length).toBeLessThanOrEqual(50);

      const globalLeaderboard10 = await storage.getGlobalRanking(10);
      expect(globalLeaderboard10.entries.length).toBeLessThanOrEqual(10);
    });

    it('should include all required fields in global leaderboard entry', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      await storage.saveScore({
        drawingId,
        userId: 'player1',
        score: 850,
        baseScore: 700,
        timeBonus: 150,
        elapsedTime: 45,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      });

      const globalLeaderboard = await storage.getGlobalRanking(50);
      const player1Entry = globalLeaderboard.entries.find(e => e.userId === 'player1');

      expect(player1Entry).toBeDefined();
      expect(player1Entry?.userId).toBe('player1');
      expect(player1Entry?.totalScore).toBe(850);
      expect(player1Entry?.quizCount).toBe(1);
      expect(player1Entry?.rank).toBeDefined();
      expect(player1Entry?.lastUpdated).toBeDefined();
    });

    it('should handle concurrent score submissions for global ranking', async () => {
      const drawing: Omit<Drawing, 'id'> = {
        createdBy: 'test-creator',
        createdAt: Date.now(),
        answer: 'Cat',
        strokes: [],
        totalStrokes: 10,
      };

      const drawingId = await storage.saveDrawing(drawing);

      const scores = Array.from({ length: 5 }, (_, i) => ({
        drawingId,
        userId: `player${i}`,
        score: 1000 - i * 100,
        baseScore: 700 - i * 50,
        timeBonus: 300 - i * 50,
        elapsedTime: 30 + i * 10,
        viewedStrokes: 3 + i,
        submittedAt: Date.now() + i * 100,
      }));

      await Promise.all(scores.map(score => storage.saveScore(score)));

      const globalLeaderboard = mockRedis._sortedSets.get('global:leaderboard');
      expect(globalLeaderboard?.length).toBe(5);
    });
  });
});
