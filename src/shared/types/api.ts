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
  gameState: 'menu' | 'drawing' | 'quiz' | 'results';
  userId: string; // Reddit username
  drawingId?: string; // Optional drawing ID from post data
};

export type GetDrawingResponse = {
  type: 'getDrawing';
  drawing: Drawing | null;
  alreadyAnswered?: boolean;
};

export type SubmitGuessResponse = {
  type: 'submitGuess';
  correct: boolean;
  answer: string;
  score: number;
  baseScore: number;
  timeBonus: number;
  message?: string;
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
  subredditName?: string;
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

export interface SubredditPost {
  postId: string;
  drawingId: string;
  subredditName: string;
  postUrl: string;
  postTitle: string;
  postedAt: number;
  postedBy: string;
}

export type ShareToSubredditResponse = {
  type: 'shareToSubreddit';
  postId: string;
  postUrl: string;
  subredditName: string;
  success: boolean;
};

export interface SubredditRankingEntry {
  userId: string;
  subredditName: string;
  totalScore: number;
  quizCount: number;
  rank: number;
  lastUpdated: number;
  avatarUrl?: string;
}

export type GetSubredditRankingResponse = {
  type: 'getSubredditRanking';
  entries: SubredditRankingEntry[];
  total: number;
  currentUserRank?: number;
};

export interface SubredditQuizMetadata {
  drawingId: string;
  subredditName: string;
  postId: string;
  answer: string;
  createdBy: string;
  postedAt: number;
}

export type GetSubredditQuizzesResponse = {
  type: 'getSubredditQuizzes';
  quizzes: SubredditQuizMetadata[];
  total: number;
  page: number;
  limit: number;
};