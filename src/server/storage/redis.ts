import { Drawing, Score } from '../../shared/types/api';
import { compressStrokes, decompressStrokes } from '../../shared/utils/compression';
import type { RedisClient } from '@devvit/redis';

export class RedisStorage {
  private redis: RedisClient;

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async saveDrawing(drawing: Omit<Drawing, 'id'>): Promise<string> {
    const id = await this.redis.incrBy('drawings:id:counter', 1);
    const drawingId = `drawing-${id}`;

    const compressedStrokes = compressStrokes(drawing.strokes);

    await this.redis.hSet(`drawings:${drawingId}`, {
      strokes: compressedStrokes,
      totalStrokes: drawing.totalStrokes.toString(),
    });

    const metaFields: Record<string, string> = {
      answer: drawing.answer,
      createdBy: drawing.createdBy,
      createdAt: drawing.createdAt.toString(),
    };

    if (drawing.hint) {
      metaFields.hint = drawing.hint;
    }

    await this.redis.hSet(`drawings:meta:${drawingId}`, metaFields);

    await this.redis.zAdd('drawings:list', { member: drawingId, score: drawing.createdAt });

    return drawingId;
  }

  async getDrawing(id: string): Promise<Drawing | undefined> {
    const [drawingData, metaData] = await Promise.all([
      this.redis.hGetAll(`drawings:${id}`),
      this.redis.hGetAll(`drawings:meta:${id}`),
    ]);

    if (!drawingData || Object.keys(drawingData).length === 0) {
      return undefined;
    }

    if (!metaData || Object.keys(metaData).length === 0) {
      return undefined;
    }

    const strokes = decompressStrokes(drawingData.strokes as string);

    const drawing: Drawing = {
      id,
      answer: metaData.answer as string,
      createdBy: metaData.createdBy as string,
      createdAt: parseInt(metaData.createdAt as string, 10),
      strokes,
      totalStrokes: parseInt(drawingData.totalStrokes as string, 10),
    };

    if (metaData.hint) {
      drawing.hint = metaData.hint as string;
    }

    return drawing;
  }

  async getAllDrawings(): Promise<Drawing[]> {
    const result = await this.redis.zRange('drawings:list', 0, -1, { by: 'rank' });

    if (!result || result.length === 0) {
      return [];
    }

    const drawingIds = result.map(item => item.member);

    const drawings = await Promise.all(
      drawingIds.map((id: string) => this.getDrawing(id))
    );

    return drawings.filter((d): d is Drawing => d !== undefined);
  }

  async getRandomDrawing(): Promise<Drawing | undefined> {
    const allDrawings = await this.getAllDrawings();
    if (allDrawings.length === 0) {
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * allDrawings.length);
    return allDrawings[randomIndex];
  }

  async saveScore(score: Omit<Score, 'id'>): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;

      try {
        const scoreKey = `scores:${score.drawingId}:${score.userId}`;
        const leaderboardKey = `leaderboard:${score.drawingId}`;

        const existingScoreData = await this.redis.hGetAll(scoreKey);
        const existingScore = existingScoreData && existingScoreData.score
          ? parseInt(existingScoreData.score as string, 10)
          : null;

        if (existingScore !== null && score.score <= existingScore) {
          return scoreKey;
        }

        const txn = await this.redis.watch(scoreKey, leaderboardKey);

        await txn.multi();

        await txn.hSet(scoreKey, {
          score: score.score.toString(),
          baseScore: score.baseScore.toString(),
          timeBonus: score.timeBonus.toString(),
          elapsedTime: score.elapsedTime.toString(),
          viewedStrokes: score.viewedStrokes.toString(),
          submittedAt: score.submittedAt.toString(),
          drawingId: score.drawingId,
          userId: score.userId,
        });

        await txn.zAdd(leaderboardKey, {
          member: score.userId,
          score: score.score,
        });

        await txn.zRemRangeByRank(leaderboardKey, 0, -6);

        const result = await txn.exec();

        if (result && result.length > 0) {
          return scoreKey;
        }

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 10 * attempt));
        }
      } catch (error) {
        if (attempt >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 10 * attempt));
      }
    }

    throw new Error('Failed to save score after maximum retries');
  }

  async getScoresByDrawing(drawingId: string): Promise<Score[]> {
    const leaderboardKey = `leaderboard:${drawingId}`;
    const userIds = await this.redis.zRange(leaderboardKey, 0, -1, { by: 'rank', reverse: true });

    if (!userIds || userIds.length === 0) {
      return [];
    }

    const scores = await Promise.all(
      userIds.map(async (item: { member: string; score: number }) => {
        const scoreKey = `scores:${drawingId}:${item.member}`;
        const scoreData = await this.redis.hGetAll(scoreKey);

        if (!scoreData || Object.keys(scoreData).length === 0) {
          return null;
        }

        return {
          id: scoreKey,
          drawingId: scoreData.drawingId as string,
          userId: scoreData.userId as string,
          score: parseInt(scoreData.score as string, 10),
          baseScore: parseInt(scoreData.baseScore as string, 10),
          timeBonus: parseInt(scoreData.timeBonus as string, 10),
          elapsedTime: parseFloat(scoreData.elapsedTime as string),
          viewedStrokes: parseInt(scoreData.viewedStrokes as string, 10),
          submittedAt: parseInt(scoreData.submittedAt as string, 10),
        };
      })
    );

    return scores.filter((s): s is Score => s !== null);
  }

  async getTopScores(drawingId: string, limit: number = 5): Promise<Score[]> {
    const scores = await this.getScoresByDrawing(drawingId);
    return scores.slice(0, limit);
  }
}
