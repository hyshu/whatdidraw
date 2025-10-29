export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

export interface Drawing {
  id: string;
  createdBy: string;
  createdAt: number;
  answer: string;
  hint?: string;
  strokes: Stroke[];
  totalStrokes: number;
}

export interface Score {
  id: string;
  drawingId: string;
  userId: string;
  score: number;
  baseScore: number;
  timeBonus: number;
  elapsedTime: number;
  viewedStrokes: number;
  submittedAt: number;
}

export type InitResponse = {
  type: 'init';
  postId: string;
  gameState: 'menu' | 'drawing' | 'guessing' | 'results';
  userId: string; // Reddit username
};

export type GetDrawingResponse = {
  type: 'getDrawing';
  drawing: Drawing | null;
};

export type SubmitGuessResponse = {
  type: 'submitGuess';
  correct: boolean;
  answer: string;
  score: number;
  baseScore: number;
  timeBonus: number;
};

export type GetLeaderboardResponse = {
  type: 'getLeaderboard';
  scores: Array<{
    username: string;
    score: number;
    baseScore: number;
    timeBonus: number;
    timestamp: number;
    avatarUrl?: string;
  }>;
};

export type SaveDrawingResponse = {
  type: 'saveDrawing';
  drawingId: string;
  success: boolean;
};

export interface UserProfile {
  userId: string;
  avatarUrl?: string;
  displayName: string;
}

export interface QuizHistoryEntry {
  drawingId: string;
  drawingAnswer: string;
  score: number;
  rank: number | null;
  submittedAt: number;
  baseScore: number;
  timeBonus: number;
}

export type GetQuizHistoryResponse = {
  type: 'getQuizHistory';
  entries: QuizHistoryEntry[];
  total: number;
  page: number;
  limit: number;
};

export interface GlobalLeaderboardEntry {
  userId: string;
  totalScore: number;
  quizCount: number;
  lastUpdated: number;
  rank: number;
  avatarUrl?: string;
}

export type GetGlobalLeaderboardResponse = {
  type: 'getGlobalLeaderboard';
  entries: GlobalLeaderboardEntry[];
  total: number;
  currentUserRank?: number;
};