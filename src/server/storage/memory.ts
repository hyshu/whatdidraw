import { Drawing, Score } from '../../shared/types/api';

export class MemoryStorage {
  private drawings: Map<string, Drawing> = new Map();
  private scores: Map<string, Score> = new Map();
  private drawingIdCounter = 1;

  saveDrawing(drawing: Omit<Drawing, 'id'>): string {
    const id = `drawing-${Date.now()}-${this.drawingIdCounter++}`;
    const fullDrawing: Drawing = {
      ...drawing,
      id,
    };
    this.drawings.set(id, fullDrawing);
    return id;
  }

  getDrawing(id: string): Drawing | undefined {
    return this.drawings.get(id);
  }

  getAllDrawings(): Drawing[] {
    return Array.from(this.drawings.values());
  }

  getRandomDrawing(): Drawing | undefined {
    const allDrawings = this.getAllDrawings();
    if (allDrawings.length === 0) {
      return undefined;
    }
    const randomIndex = Math.floor(Math.random() * allDrawings.length);
    return allDrawings[randomIndex];
  }

  saveScore(score: Omit<Score, 'id'>): string {
    const id = `score-${Date.now()}-${score.userId}`;
    const fullScore: Score = {
      ...score,
      id,
    };

    const existingScoreKey = this.findExistingScore(score.userId, score.drawingId);
    if (existingScoreKey) {
      const existingScore = this.scores.get(existingScoreKey);
      if (existingScore && existingScore.score < fullScore.score) {
        this.scores.set(existingScoreKey, fullScore);
        return existingScoreKey;
      }
      return existingScoreKey;
    }

    this.scores.set(id, fullScore);
    return id;
  }

  private findExistingScore(userId: string, drawingId: string): string | undefined {
    for (const [id, score] of this.scores.entries()) {
      if (score.userId === userId && score.drawingId === drawingId) {
        return id;
      }
    }
    return undefined;
  }

  getScoresByDrawing(drawingId: string): Score[] {
    return Array.from(this.scores.values())
      .filter(score => score.drawingId === drawingId)
      .sort((a, b) => b.score - a.score);
  }

  getTopScores(drawingId: string, limit: number = 5): Score[] {
    return this.getScoresByDrawing(drawingId).slice(0, limit);
  }
}

export const storage = new MemoryStorage();
