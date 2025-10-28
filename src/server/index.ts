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
import { RedisStorage } from './storage/redis';
import { validateDrawing, sanitizeText } from '../shared/utils/validation';

const storage = new RedisStorage(redis);

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
  async (req, res): Promise<void> => {
    try {
      const { drawingId } = req.query;

      let drawing: Drawing | undefined;

      if (drawingId && typeof drawingId === 'string') {
        drawing = await storage.getDrawing(drawingId);
      } else {
        drawing = await storage.getRandomDrawing();
      }

      if (!drawing) {
        res.status(404).json({
          status: 'error',
          message: 'No drawings available'
        });
        return;
      }

      res.json({
        type: 'getDrawing',
        drawing,
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

router.post<{}, SubmitGuessResponse | { status: string; message: string }, { guess: string; drawingId: string; elapsedTime?: number; viewedStrokes?: number }>(
  '/api/guess',
  async (req, res): Promise<void> => {
    try {
      const { guess, drawingId, elapsedTime = 0, viewedStrokes = 0 } = req.body;

      if (!guess || !drawingId) {
        res.status(400).json({
          status: 'error',
          message: 'Guess and drawingId are required'
        });
        return;
      }

      const drawing = await storage.getDrawing(drawingId);
      if (!drawing) {
        res.status(404).json({
          status: 'error',
          message: 'Drawing not found'
        });
        return;
      }

      const sanitizedGuess = sanitizeText(guess);
      const correct = sanitizedGuess.toLowerCase() === drawing.answer.toLowerCase();

      let baseScore = 0;
      let timeBonus = 0;
      let totalScore = 0;

      if (correct) {
        const totalStrokes = drawing.totalStrokes;
        baseScore = (totalStrokes - viewedStrokes) * 100;
        timeBonus = Math.max(0, (60 - elapsedTime) * 10);
        totalScore = baseScore + timeBonus;

        const userId = context.userId || 'anonymous';
        await storage.saveScore({
          drawingId,
          userId,
          score: totalScore,
          baseScore,
          timeBonus,
          elapsedTime,
          viewedStrokes,
          submittedAt: Date.now(),
        });
      }

      res.json({
        type: 'submitGuess',
        correct,
        answer: drawing.answer,
        score: totalScore,
        baseScore,
        timeBonus,
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

router.get<{ id: string }, GetLeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard/:id',
  async (req, res): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'Drawing ID is required'
        });
        return;
      }

      const drawing = await storage.getDrawing(id);
      if (!drawing) {
        res.status(404).json({
          status: 'error',
          message: 'Drawing not found'
        });
        return;
      }

      const topScores = await storage.getTopScores(id, 5);

      const scoresWithUsernames = topScores.map(score => ({
        username: score.userId,
        score: score.score,
        baseScore: score.baseScore,
        timeBonus: score.timeBonus,
        timestamp: score.submittedAt,
      }));

      res.json({
        type: 'getLeaderboard',
        scores: scoresWithUsernames,
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

      if (!drawing) {
        res.status(400).json({
          status: 'error',
          message: 'Drawing data is required'
        });
        return;
      }

      const validation = validateDrawing(drawing);
      if (!validation.isValid) {
        res.status(400).json({
          status: 'error',
          message: validation.errors.join('; ')
        });
        return;
      }

      const sanitizedAnswer = sanitizeText(drawing.answer || '');
      const sanitizedHint = drawing.hint ? sanitizeText(drawing.hint) : undefined;

      const drawingToSave: Omit<Drawing, 'id'> = {
        createdBy: drawing.createdBy || context.userId || 'anonymous',
        createdAt: Date.now(),
        answer: sanitizedAnswer,
        strokes: drawing.strokes || [],
        totalStrokes: drawing.strokes?.length || 0,
        ...(sanitizedHint ? { hint: sanitizedHint } : {}),
      };

      const drawingId = await storage.saveDrawing(drawingToSave);

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