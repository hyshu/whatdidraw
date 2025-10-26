import express from 'express';
import {
  InitResponse,
  GetDrawingResponse,
  SubmitGuessResponse,
  GetLeaderboardResponse,
  SaveDrawingResponse,
  Drawing
} from '../shared/types/api';
import { redis, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

const router = express.Router();
router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      res.json({
        type: 'init',
        postId: postId,
        gameState: 'menu',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{ drawingId?: string }, GetDrawingResponse | { status: string; message: string }>(
  '/api/drawing',
  async (_req, res): Promise<void> => {
    try {
      const mockDrawing: Drawing = {
        id: 'mock-drawing-1',
        answer: 'cat',
        hint: 'A common pet',
        category: 'Animals',
        strokes: [],
        createdBy: 'demo-user',
        createdAt: Date.now(),
      };

      res.json({
        type: 'getDrawing',
        drawing: mockDrawing,
      });
    } catch (error) {
      console.error('Error getting drawing:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to get drawing'
      });
    }
  }
);

router.post<{}, SubmitGuessResponse | { status: string; message: string }, { guess: string; drawingId: string }>(
  '/api/guess',
  async (req, res): Promise<void> => {
    try {
      const { guess } = req.body;
      const correct = guess?.toLowerCase() === 'cat';

      res.json({
        type: 'submitGuess',
        correct,
        answer: 'cat',
        score: correct ? 100 : 0,
      });
    } catch (error) {
      console.error('Error submitting guess:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to submit guess'
      });
    }
  }
);

router.get<{}, GetLeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard',
  async (_req, res): Promise<void> => {
    try {
      res.json({
        type: 'getLeaderboard',
        scores: [],
      });
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to get leaderboard'
      });
    }
  }
);

router.post<{}, SaveDrawingResponse | { status: string; message: string }, { drawing: Partial<Drawing> }>(
  '/api/drawing',
  async (req, res): Promise<void> => {
    try {
      const { drawing } = req.body;
      const drawingId = `drawing-${Date.now()}`;

      res.json({
        type: 'saveDrawing',
        drawingId,
        success: true,
      });
    } catch (error) {
      console.error('Error saving drawing:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to save drawing'
      });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

app.use(router);

const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));