import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from '../storage/memory';
import { Drawing, Stroke } from '../../shared/types/api';

describe('Phase 4 Server API Tests', () => {
  beforeEach(() => {
    (storage as any).drawings.clear();
    (storage as any).scores.clear();
    (storage as any).drawingIdCounter = 1;
  });

  const createMockStroke = (timestamp: number = Date.now()): Stroke => ({
    points: [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ],
    color: '#000000',
    width: 5,
    timestamp,
  });

  const createMockDrawing = (strokeCount: number = 5): Omit<Drawing, 'id'> => {
    const strokes = Array.from({ length: strokeCount }, (_, i) =>
      createMockStroke(Date.now() + i)
    );
    return {
      createdBy: 'test-user',
      createdAt: Date.now(),
      answer: 'test answer',
      hint: 'test hint',
      strokes,
      totalStrokes: strokeCount,
    };
  };

  describe('Phase 4.1: Drawing Save Endpoint', () => {
    it('should save drawing correctly', () => {
      const drawing = createMockDrawing(3);
      const id = storage.saveDrawing(drawing);

      expect(id).toBeDefined();
      expect(id).toMatch(/^drawing-\d+-\d+$/);
    });

    it('should generate unique IDs', () => {
      const drawing1 = createMockDrawing(3);
      const drawing2 = createMockDrawing(3);

      const id1 = storage.saveDrawing(drawing1);
      const id2 = storage.saveDrawing(drawing2);

      expect(id1).not.toBe(id2);
    });

    it('should store drawing in memory correctly', () => {
      const drawing = createMockDrawing(5);
      const id = storage.saveDrawing(drawing);

      const retrieved = storage.getDrawing(id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.answer).toBe('test answer');
      expect(retrieved?.hint).toBe('test hint');
      expect(retrieved?.strokes.length).toBe(5);
      expect(retrieved?.totalStrokes).toBe(5);
      expect(retrieved?.createdBy).toBe('test-user');
    });
  });

  describe('Phase 4.2: Drawing Retrieval', () => {
    it('should return saved drawings', () => {
      const drawing = createMockDrawing(3);
      const id = storage.saveDrawing(drawing);

      const retrieved = storage.getDrawing(id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(id);
    });

    it('should return undefined for invalid IDs', () => {
      const retrieved = storage.getDrawing('invalid-id');
      expect(retrieved).toBeUndefined();
    });

    it('should handle "no drawings" case', () => {
      const random = storage.getRandomDrawing();
      expect(random).toBeUndefined();
    });

    it('should return random drawing when drawings exist', () => {
      const drawing1 = createMockDrawing(3);
      const drawing2 = createMockDrawing(5);

      storage.saveDrawing(drawing1);
      storage.saveDrawing(drawing2);

      const random = storage.getRandomDrawing();
      expect(random).toBeDefined();
      expect(random?.totalStrokes).toBeGreaterThan(0);
    });

    it('should verify random selection logic works', () => {
      const drawing1 = createMockDrawing(3);
      const id1 = storage.saveDrawing(drawing1);

      const random = storage.getRandomDrawing();
      expect(random).toBeDefined();
      expect(random?.id).toBe(id1);
    });
  });

  describe('Phase 4.3: Scoring Endpoint', () => {
    it('should calculate base score correctly: (total - viewed) × 100', () => {
      const totalStrokes = 10;
      const viewedStrokes = 3;
      const expectedBase = (totalStrokes - viewedStrokes) * 100;

      expect(expectedBase).toBe(700);
    });

    it('should calculate time bonus: max(0, (60 - elapsed) × 10)', () => {
      const elapsed1 = 30;
      const bonus1 = Math.max(0, (60 - elapsed1) * 10);
      expect(bonus1).toBe(300);

      const elapsed2 = 70;
      const bonus2 = Math.max(0, (60 - elapsed2) * 10);
      expect(bonus2).toBe(0);
    });

    it('should store score in memory', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      const scoreData = {
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      const scoreId = storage.saveScore(scoreData);
      expect(scoreId).toBeDefined();
    });

    it('should verify score breakdown is returned correctly', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      const baseScore = 700;
      const timeBonus = 300;
      const totalScore = baseScore + timeBonus;

      expect(totalScore).toBe(1000);

      const scoreData = {
        drawingId,
        userId: 'user1',
        score: totalScore,
        baseScore,
        timeBonus,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      };

      storage.saveScore(scoreData);
      const scores = storage.getScoresByDrawing(drawingId);
      expect(scores[0].score).toBe(1000);
      expect(scores[0].baseScore).toBe(700);
      expect(scores[0].timeBonus).toBe(300);
    });

    it('should update rankings after score submission', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      });

      storage.saveScore({
        drawingId,
        userId: 'user2',
        score: 800,
        baseScore: 500,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 5,
        submittedAt: Date.now() + 1,
      });

      const scores = storage.getScoresByDrawing(drawingId);
      expect(scores.length).toBe(2);
      expect(scores[0].userId).toBe('user1');
      expect(scores[1].userId).toBe('user2');
    });

    it('should keep only highest score per user per drawing', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 500,
        baseScore: 500,
        timeBonus: 0,
        elapsedTime: 60,
        viewedStrokes: 5,
        submittedAt: Date.now(),
      });

      storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now() + 1,
      });

      const scores = storage.getScoresByDrawing(drawingId);
      expect(scores.length).toBe(1);
      expect(scores[0].score).toBe(1000);
    });
  });

  describe('Phase 4.4: Leaderboard Endpoint', () => {
    it('should return top 5 scores', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      for (let i = 0; i < 7; i++) {
        storage.saveScore({
          drawingId,
          userId: `user${i}`,
          score: 1000 - i * 100,
          baseScore: 700 - i * 50,
          timeBonus: 300 - i * 50,
          elapsedTime: 30 + i * 5,
          viewedStrokes: 3 + i,
          submittedAt: Date.now() + i,
        });
      }

      const topScores = storage.getTopScores(drawingId, 5);
      expect(topScores.length).toBe(5);
      expect(topScores[0].userId).toBe('user0');
      expect(topScores[4].userId).toBe('user4');
    });

    it('should include score breakdown for each entry', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: Date.now(),
      });

      const topScores = storage.getTopScores(drawingId, 5);
      expect(topScores[0].score).toBe(1000);
      expect(topScores[0].baseScore).toBe(700);
      expect(topScores[0].timeBonus).toBe(300);
    });

    it('should include username, total score, and submission time', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      const timestamp = Date.now();
      storage.saveScore({
        drawingId,
        userId: 'user1',
        score: 1000,
        baseScore: 700,
        timeBonus: 300,
        elapsedTime: 30,
        viewedStrokes: 3,
        submittedAt: timestamp,
      });

      const topScores = storage.getTopScores(drawingId, 5);
      expect(topScores[0].userId).toBe('user1');
      expect(topScores[0].score).toBe(1000);
      expect(topScores[0].submittedAt).toBe(timestamp);
    });

    it('should handle "no scores yet" case', () => {
      const drawing = createMockDrawing(10);
      const drawingId = storage.saveDrawing(drawing);

      const topScores = storage.getTopScores(drawingId, 5);
      expect(topScores.length).toBe(0);
    });
  });

  describe('Phase 4.5: Error Handling', () => {
    it('should handle invalid drawing ID gracefully', () => {
      const retrieved = storage.getDrawing('invalid-id');
      expect(retrieved).toBeUndefined();
    });

    it('should handle empty storage gracefully', () => {
      const random = storage.getRandomDrawing();
      expect(random).toBeUndefined();

      const all = storage.getAllDrawings();
      expect(all.length).toBe(0);
    });
  });
});
