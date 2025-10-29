import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { QuizHistory } from '../QuizHistory';
import * as api from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  get: vi.fn(),
  post: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number) {
      super(message);
    }
  },
}));

describe('Phase 7.2: Quiz History Scene', () => {
  let scene: QuizHistory;

  beforeEach(async () => {
    document.body.innerHTML = '';
    vi.clearAllMocks();

    vi.mocked(api.get).mockResolvedValue({
      type: 'getQuizHistory',
      entries: [
        {
          drawingId: 'drawing-1',
          drawingAnswer: 'Cat',
          score: 850,
          rank: 2,
          submittedAt: Date.now() - 86400000,
          baseScore: 700,
          timeBonus: 150,
        },
        {
          drawingId: 'drawing-2',
          drawingAnswer: 'Dog',
          score: 650,
          rank: null,
          submittedAt: Date.now() - 172800000,
          baseScore: 500,
          timeBonus: 150,
        },
      ],
      total: 2,
      page: 1,
      limit: 10,
    });

    scene = new QuizHistory();
    scene.init({ userId: 'test-user' });
    await scene.create();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('QuizHistory UI', () => {
    it('should create quiz history scene', () => {
      expect(scene).toBeDefined();
    });

    it('should display title', () => {
      const titleText = scene['titleText'];
      expect(titleText).toBeDefined();
      expect(titleText.text).toBe('My Quiz History');
    });

    it('should center title horizontally', () => {
      const titleText = scene['titleText'];
      const expectedX = scene.scale.width / 2;
      expect(titleText.x).toBe(expectedX);
    });

    it('should create history container', () => {
      const container = scene['historyContainer'];
      expect(container).toBeDefined();
      expect(container.parentElement).toBe(document.body);
    });

    it('should display quiz entries', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('Cat');
      expect(text).toContain('Dog');
    });

    it('should display score for each entry', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('850 pts');
      expect(text).toContain('650 pts');
    });

    it('should display score breakdown', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('Base:');
      expect(text).toContain('Bonus:');
    });

    it('should display rank when available', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('Rank 2');
    });

    it('should display rank placeholder when not in top 5', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('Rank -');
    });

    it('should display date for each entry', () => {
      const container = scene['historyContainer'];
      const dates = container.querySelectorAll('[style*="font-size: 14px"]');
      expect(dates.length).toBeGreaterThan(0);
    });

    it('should display "View Leaderboard" button for each entry', () => {
      const container = scene['historyContainer'];
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
      expect(buttons[0].textContent).toBe('View Leaderboard');
    });

    it('should handle empty state', async () => {
      vi.mocked(api.get).mockResolvedValue({
        type: 'getQuizHistory',
        entries: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      scene['cleanup']();
      const newScene = new QuizHistory();
      newScene.init({ userId: 'test-user' });
      await newScene.create();

      const container = newScene['historyContainer'];
      expect(container.textContent).toContain('No quizzes answered yet');
    });

    it('should fetch quiz history from API', () => {
      expect(api.get).toHaveBeenCalledWith('/api/user/test-user/quiz-history?page=1&limit=10');
    });

    it('should display entries in order', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      const catIndex = text.indexOf('Cat');
      const dogIndex = text.indexOf('Dog');
      expect(catIndex).toBeLessThan(dogIndex);
    });

    it('should display numbered list', () => {
      const container = scene['historyContainer'];
      const text = container.textContent || '';
      expect(text).toContain('1.');
      expect(text).toContain('2.');
    });

    it('should apply proper styling to entries', () => {
      const container = scene['historyContainer'];
      const entries = container.querySelectorAll('[style*="background: rgba(255, 255, 255, 0.95)"]');
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should have scrollable container', () => {
      const container = scene['historyContainer'];
      expect(container.style.overflowY).toBe('auto');
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      const newScene = new QuizHistory();
      newScene.init({ userId: 'test-user' });
      await newScene.create();

      const container = newScene['historyContainer'];
      expect(container.textContent).toContain('No quizzes answered yet');
    });

    it('should display back button', () => {
      const backButton = scene['backButton'];
      expect(backButton).toBeDefined();
      expect(backButton.text).toContain('Back');
    });
  });

  describe('QuizHistory Navigation', () => {
    it('should navigate to leaderboard when button clicked', () => {
      const container = scene['historyContainer'];
      const buttons = container.querySelectorAll('button');
      const firstButton = buttons[0] as HTMLButtonElement;

      scene.scene = {
        start: vi.fn(),
      } as any;

      firstButton.click();

      expect(scene.scene.start).toHaveBeenCalledWith('Leaderboard', { drawingId: 'drawing-1' });
    });

    it('should navigate to main menu when back button clicked', () => {
      const backButton = scene['backButton'];

      const startFn = vi.fn();
      scene.scene = {
        start: startFn,
      } as any;

      scene['handleBack']();

      expect(startFn).toHaveBeenCalledWith('MainMenu');
    });
  });
});
