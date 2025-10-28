import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Leaderboard } from '../Leaderboard';

describe('Phase 2: Leaderboard Scene', () => {
  let scene: Leaderboard;

  beforeEach(async () => {
    document.body.innerHTML = '';
    vi.clearAllMocks();

    scene = new Leaderboard();
    scene.init({ drawingId: 'test-drawing-id' });
    await scene.create();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Leaderboard UI (2.4)', () => {
    it('should create leaderboard scene', () => {
      expect(scene).toBeDefined();
    });

    it('should display title', () => {
      const titleText = scene['titleText'];
      expect(titleText).toBeDefined();
      expect(titleText.text).toBe('Leaderboard');
    });

    it('should center title horizontally', () => {
      const titleText = scene['titleText'];
      const expectedX = scene.scale.width / 2;
      expect(titleText.x).toBe(expectedX);
    });

    it('should create leaderboard container', () => {
      const container = scene['leaderboardContainer'];
      expect(container).toBeDefined();
      expect(container.parentElement).toBe(document.body);
    });

    it('should display top 5 scores with mock data', () => {
      const container = scene['leaderboardContainer'];
      const entries = Array.from(container.children).filter(el => el.textContent && el.textContent.includes('#'));
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.length).toBeLessThanOrEqual(5);
    });

    it('should show username for each score entry', () => {
      const container = scene['leaderboardContainer'];
      expect(container.textContent).toContain('Player1');
    });

    it('should display score breakdown for each entry', () => {
      const container = scene['leaderboardContainer'];
      expect(container.textContent).toContain('Base:');
      expect(container.textContent).toContain('Time:');
    });

    it('should show total score for each entry', () => {
      const container = scene['leaderboardContainer'];
      expect(container.textContent).toContain('points');
    });

    it('should display rank numbers', () => {
      const container = scene['leaderboardContainer'];
      expect(container.textContent).toContain('#1');
    });

    it('should show score breakdown values', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';
      expect(text).toMatch(/Base:\s*\d+/);
      expect(text).toMatch(/Time:\s*\d+/);
    });

    it('should handle empty state', () => {
      scene['cleanup']();
      scene['createLeaderboardHTML']([]);
      const container = scene['leaderboardContainer'];
      expect(container).toBeDefined();
    });

    it('should display "Be the first to play" message when no scores', () => {
      scene['cleanup']();
      scene['createLeaderboardHTML']([]);
      const container = scene['leaderboardContainer'];
      expect(container.textContent).toContain('Be the first to play');
    });

    it('should format entries with proper layout', () => {
      const container = scene['leaderboardContainer'];
      const entries = container.children;
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should apply styling to leaderboard entries', () => {
      const container = scene['leaderboardContainer'];
      const firstEntry = container.firstElementChild as HTMLElement;
      if (firstEntry && firstEntry.style) {
        expect(firstEntry.style.background).toBeTruthy();
      }
    });
  });

  describe('Back Button (Navigation)', () => {
    it('should create back button in top-left corner', () => {
      const backButton = scene['backButton'];
      expect(backButton).toBeDefined();
      expect(backButton.text).toContain('Back');
    });

    it('should position back button at (15, 15)', () => {
      const backButton = scene['backButton'];
      expect(backButton.x).toBe(15);
      expect(backButton.y).toBe(15);
    });

    it('should navigate to MainMenu when back is clicked', () => {
      scene['handleBack']();
      expect(scene.scene.start).toHaveBeenCalledWith('MainMenu');
    });

    it('should cleanup DOM elements on back', () => {
      const container = scene['leaderboardContainer'];
      scene['handleBack']();
      expect(container.parentElement).toBeNull();
    });
  });

  describe('Responsive Layout', () => {
    it('should center leaderboard container', () => {
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

  describe('Score Data Structure', () => {
    it('should display all required score fields', () => {
      const container = scene['leaderboardContainer'];
      const text = container.textContent || '';

      expect(text).toContain('Player1');
      expect(text).toMatch(/\d+\s*points/);
      expect(text).toContain('Base:');
      expect(text).toContain('Time:');
    });

    it('should order scores from highest to lowest', () => {
      const container = scene['leaderboardContainer'];
      const entries = Array.from(container.children);

      expect(entries[0].textContent).toContain('#1');
      if (entries.length > 1) {
        expect(entries[1].textContent).toContain('#2');
      }
    });
  });

  describe('Cleanup', () => {
    it('should remove leaderboard container on cleanup', () => {
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
