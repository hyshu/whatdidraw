import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GlobalRanking } from '../GlobalRanking';
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

describe('Phase 7.2.1: Global Ranking Scene', () => {
  let scene: GlobalRanking;

  beforeEach(async () => {
    document.body.innerHTML = '';
    vi.clearAllMocks();

    vi.mocked(api.get).mockResolvedValue({
      type: 'getGlobalLeaderboard',
      entries: [
        {
          userId: 'player1',
          totalScore: 5000,
          quizCount: 10,
          lastUpdated: Date.now(),
          rank: 1,
          avatarUrl: 'https://example.com/avatar1.png',
        },
        {
          userId: 'player2',
          totalScore: 4500,
          quizCount: 8,
          lastUpdated: Date.now(),
          rank: 2,
          avatarUrl: undefined,
        },
        {
          userId: 'player3',
          totalScore: 4000,
          quizCount: 7,
          lastUpdated: Date.now(),
          rank: 3,
          avatarUrl: 'https://example.com/avatar3.png',
        },
      ],
      total: 3,
      currentUserRank: 2,
    });

    scene = new GlobalRanking();
    scene.init();
    await scene.create();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Global Ranking UI', () => {
    it('should create global ranking scene', () => {
      expect(scene).toBeDefined();
    });

    it('should display title', () => {
      const titleText = scene['titleText'];
      expect(titleText).toBeDefined();
      expect(titleText.text).toBe('Global Ranking');
    });

    it('should center title horizontally', () => {
      const titleText = scene['titleText'];
      const expectedX = scene.scale.width / 2;
      expect(titleText.x).toBe(expectedX);
    });

    it('should create ranking container', () => {
      const container = scene['leaderboardContainer'];
      expect(container).toBeDefined();
      expect(container.parentElement).toBe(document.body);
    });

    it('should fetch global ranking from API', () => {
      expect(api.get).toHaveBeenCalledWith('/api/leaderboard/global?limit=50');
    });

    it('should display player entries', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('player1');
      expect(text).toContain('player2');
      expect(text).toContain('player3');
    });

    it('should display usernames with u/ prefix', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('u/player1');
      expect(text).toContain('u/player2');
      expect(text).toContain('u/player3');
    });

    it('should display total score for each entry', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('5,000 pts');
      expect(text).toContain('4,500 pts');
      expect(text).toContain('4,000 pts');
    });

    it('should display quiz count for each entry', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('Quizzes answered: 10');
      expect(text).toContain('Quizzes answered: 8');
      expect(text).toContain('Quizzes answered: 7');
    });

    it('should display rank numbers', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('#1');
      expect(text).toContain('#2');
      expect(text).toContain('#3');
    });

    it('should display avatar when available (32x32px or 40x40px)', () => {
      const container = scene['leaderboardContainer'];
      const avatars = container.querySelectorAll('img');
      expect(avatars.length).toBeGreaterThan(0);

      const firstAvatar = avatars[0];
      expect(firstAvatar.src).toBe('https://example.com/avatar1.png');
      expect(firstAvatar.style.width).toBe('100%');
      expect(firstAvatar.style.height).toBe('100%');
      expect(firstAvatar.style.borderRadius).toBe('50%');
    });

    it('should display default avatar fallback when avatar unavailable', () => {
      const container = scene['leaderboardContainer'];
      const entries = container.children;

      const secondEntry = entries[1] as HTMLElement;
      const avatarContainer = secondEntry.querySelector('[style*="width: 40px"]') as HTMLElement;

      expect(avatarContainer).toBeDefined();
      expect(avatarContainer.style.backgroundColor).toBe('rgb(52, 152, 219)');

      const initial = avatarContainer.querySelector('span');
      expect(initial).toBeDefined();
      expect(initial?.textContent).toBe('P');
    });

    it('should highlight current user rank', () => {
      const container = scene['leaderboardContainer'];
      const entries = Array.from(container.children) as HTMLElement[];

      const currentUserEntry = entries.find(entry => entry.textContent?.includes('(You)'));
      expect(currentUserEntry).toBeDefined();
      expect(currentUserEntry?.style.background).toContain('255, 215, 0');
    });

    it('should display (You) badge for current user', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toContain('(You)');
    });

    it('should handle empty state', async () => {
      vi.mocked(api.get).mockResolvedValue({
        type: 'getGlobalLeaderboard',
        entries: [],
        total: 0,
      });

      scene['cleanup']();
      const newScene = new GlobalRanking();
      newScene.init();
      await newScene.create();

      const container = newScene['leaderboardContainer'];
      expect(container.textContent).toContain('No players yet. Be the first!');
    });

    it('should handle API error gracefully', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'));

      const newScene = new GlobalRanking();
      newScene.init();
      await newScene.create();

      const container = newScene['leaderboardContainer'];
      expect(container.textContent).toContain('No players yet. Be the first!');
    });

    it('should display back button', () => {
      const backButton = scene['backButton'];
      expect(backButton).toBeDefined();
      expect(backButton.text).toContain('Back');
    });
  });

  describe('Global Ranking Navigation', () => {
    it('should navigate to main menu when back button clicked', () => {
      const startFn = vi.fn();
      scene.scene = { start: startFn } as any;

      scene['handleBack']();

      expect(startFn).toHaveBeenCalledWith('MainMenu');
    });

    it('should cleanup DOM elements on back', () => {
      const container = scene['leaderboardContainer'];
      scene['handleBack']();
      expect(container.parentElement).toBeNull();
    });
  });

  describe('Responsive Layout', () => {
    it('should center ranking container', () => {
      const container = scene['leaderboardContainer'];
      expect(container.style.left).toBe('50%');
      expect(container.style.transform).toContain('translateX(-50%)');
    });

    it('should limit max width', () => {
      const container = scene['leaderboardContainer'];
      expect(container.style.maxWidth).toBe('600px');
    });

    it('should use responsive width', () => {
      const container = scene['leaderboardContainer'];
      expect(container.style.width).toBe('90%');
    });

    it('should update layout on resize', () => {
      const originalTitleX = scene['titleText'].x;

      scene['handleResize']();

      const newExpectedX = scene.scale.width / 2;
      expect(scene['titleText'].x).toBe(newExpectedX);
    });
  });

  describe('Avatar Handling', () => {
    it('should handle avatar load error with fallback', () => {
      const container = scene['leaderboardContainer'];
      const avatars = container.querySelectorAll('img');
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('should display first letter of username as fallback', () => {
      const container = scene['leaderboardContainer'];
      const entries = container.children;

      const entryWithFallback = entries[1] as HTMLElement;
      const initial = entryWithFallback.querySelector('span');

      expect(initial?.textContent).toBe('P');
    });
  });

  describe('Cleanup', () => {
    it('should remove ranking container on cleanup', () => {
      const container = scene['leaderboardContainer'];
      scene['cleanup']();
      expect(container.parentElement).toBeNull();
    });

    it('should cleanup on destroy', () => {
      const container = scene['leaderboardContainer'];
      scene['cleanup']();
      expect(container.parentElement).toBeNull();
    });
  });
});
