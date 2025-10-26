export type InitResponse = {
  type: 'init';
  postId: string;
  gameState: 'menu' | 'drawing' | 'guessing' | 'results';
};

export type Drawing = {
  id: string;
  answer: string;
  hint?: string;
  category?: string;
  strokes: any[];
  createdBy: string;
  createdAt: number;
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
};

export type GetLeaderboardResponse = {
  type: 'getLeaderboard';
  scores: Array<{
    username: string;
    score: number;
    timestamp: number;
  }>;
};

export type SaveDrawingResponse = {
  type: 'saveDrawing';
  drawingId: string;
  success: boolean;
};