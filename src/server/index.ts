import express from 'express';
import {
  InitResponse,
  GetDrawingResponse,
  SubmitGuessResponse,
  GetLeaderboardResponse,
  SaveDrawingResponse,
  Drawing,
  UserProfile
} from '../shared/types/api';
import { redis, createServer, context } from '@devvit/web/server';
import { createPost } from './core/post';
import { RedisStorage } from './storage/redis';
import { validateDrawing, sanitizeText } from '../shared/utils/validation';
import { getUserProfile, getUserProfiles, getUsernameFromId } from './handlers/userProfile';

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
      // Get Reddit username from context.userId (converts t2_xxxxx to username)
      const username = await getUsernameFromId(context.userId || 'anonymous');

      res.json({
        type: 'init',
        postId: postId,
        gameState: 'menu',
        userId: username,
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

        // Get Reddit username from context.userId (converts t2_xxxxx to username)
        const username = await getUsernameFromId(context.userId || 'anonymous');
        await storage.saveScore({
          drawingId,
          userId: username,
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

      const userIds = topScores.map(score => score.userId);
      const profiles = await getUserProfiles(userIds);

      const scoresWithUsernames = topScores.map(score => {
        const profile = profiles.get(score.userId);
        const entry: {
          username: string;
          score: number;
          baseScore: number;
          timeBonus: number;
          timestamp: number;
          avatarUrl?: string;
        } = {
          username: score.userId,
          score: score.score,
          baseScore: score.baseScore,
          timeBonus: score.timeBonus,
          timestamp: score.submittedAt,
        };
        if (profile?.avatarUrl) {
          entry.avatarUrl = profile.avatarUrl;
        }
        return entry;
      });

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

      // Get Reddit username from context.userId (converts t2_xxxxx to username)
      const username = drawing.createdBy || await getUsernameFromId(context.userId || 'anonymous');

      const drawingToSave: Omit<Drawing, 'id'> = {
        createdBy: username,
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

router.get<{ userId: string }, UserProfile | { status: string; message: string }>(
  '/api/user/:userId/profile',
  async (req, res): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      const profile = await getUserProfile(userId);

      res.json(profile);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to get user profile'
      });
    }
  }
);

router.get<{ userId: string }, { status: string; message: string }>(
  '/api/user/:userId/quiz-history',
  async (req, res): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '10' } = req.query;

      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'User ID is required'
        });
        return;
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      if (isNaN(pageNum) || pageNum < 1) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid page number'
        });
        return;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid limit (must be 1-50)'
        });
        return;
      }

      const result = await storage.getQuizHistory(userId, pageNum, limitNum);

      res.json({
        type: 'getQuizHistory',
        entries: result.entries,
        total: result.total,
        page: pageNum,
        limit: limitNum,
      });
    } catch (error) {
      console.error('Error getting quiz history:', error);
      res.status(400).json({
        status: 'error',
        message: 'Failed to get quiz history'
      });
    }
  }
);

router.get('/api/leaderboard/global', async (req, res): Promise<void> => {
  try {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid limit (must be 1-100)'
      });
      return;
    }

    // Get Reddit username from context.userId (converts t2_xxxxx to username)
    const currentUsername = context.userId ? await getUsernameFromId(context.userId) : undefined;

    const result = await storage.getGlobalLeaderboard(limitNum, currentUsername);

    const userIds = result.entries.map(entry => entry.userId);
    const profiles = await getUserProfiles(userIds);

    const entriesWithProfiles = result.entries.map(entry => {
      const profile = profiles.get(entry.userId);
      return {
        userId: entry.userId,
        totalScore: entry.totalScore,
        quizCount: entry.quizCount,
        lastUpdated: entry.lastUpdated,
        rank: entry.rank,
        avatarUrl: profile?.avatarUrl,
      };
    });

    res.json({
      type: 'getGlobalLeaderboard',
      entries: entriesWithProfiles,
      total: result.total,
      currentUserRank: result.currentUserRank,
    });
  } catch (error) {
    console.error('Error getting global leaderboard:', error);
    res.status(400).json({
      status: 'error',
      message: 'Failed to get global leaderboard'
    });
  }
});

router.post('/internal/init-redis', async (_req, res): Promise<void> => {
  try {
    console.log('Starting Redis initialization...');

    let deletedCount = 0;

    // Get all drawing IDs from the sorted set
    const drawingList = await redis.zRange('drawings:list', 0, -1, { by: 'rank' });
    const drawingIds = drawingList?.map(item => item.member) || [];

    console.log(`Found ${drawingIds.length} drawings to clean up`);

    // Delete all drawing-related keys
    for (const drawingId of drawingIds) {
      await redis.del(`drawings:${drawingId}`);
      await redis.del(`drawings:meta:${drawingId}`);
      deletedCount += 2;

      // Get all scores for this drawing from leaderboard
      const leaderboard = await redis.zRange(`leaderboard:${drawingId}`, 0, -1, { by: 'rank' });
      const userIds = leaderboard?.map(item => item.member) || [];

      for (const userId of userIds) {
        await redis.del(`scores:${drawingId}:${userId}`);
        deletedCount++;
      }

      // Delete leaderboard
      await redis.del(`leaderboard:${drawingId}`);
      deletedCount++;
    }

    // Delete the drawings list
    await redis.del('drawings:list');
    deletedCount++;

    // Reset counter
    await redis.set('drawings:id:counter', '0');
    deletedCount++;

    console.log(`Redis initialized successfully. Cleaned ${drawingIds.length} drawings and deleted ${deletedCount} keys.`);

    res.json({});
  } catch (error) {
    console.error('Error initializing Redis:', error);
    res.status(500).json({});
  }
});

app.use(router);

const port = process.env.WEBBIT_PORT || 3000;

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port, () => console.log(`http://localhost:${port}`));