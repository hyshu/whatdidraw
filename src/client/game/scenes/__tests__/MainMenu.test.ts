import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MainMenu } from '../MainMenu';

describe('Phase 7: MainMenu Scene', () => {
  let scene: MainMenu;

  beforeEach(() => {
    scene = new MainMenu();
    scene.init();
    scene.create();
  });

  describe('Title Screen Buttons (Phase 7.1.1)', () => {
    it('should create Ranking button', () => {
      const leaderboardButton = scene['leaderboardButton'];
      expect(leaderboardButton).toBeDefined();
      expect(leaderboardButton?.text).toBe('Ranking');
    });

    it('should create My History button', () => {
      const myHistoryButton = scene['myHistoryButton'];
      expect(myHistoryButton).toBeDefined();
      expect(myHistoryButton?.text).toBe('My History');
    });

    it('should size Ranking button smaller than primary buttons', () => {
      const leaderboardButton = scene['leaderboardButton'];
      const playButton = scene['playButton'];

      expect(leaderboardButton).toBeDefined();
      expect(playButton).toBeDefined();

      const leaderboardFontSize = parseInt(leaderboardButton!.style.fontSize as string);
      const playFontSize = parseInt(playButton!.style.fontSize as string);

      expect(leaderboardFontSize).toBeLessThan(playFontSize);
    });

    it('should size My History button smaller than primary buttons', () => {
      const myHistoryButton = scene['myHistoryButton'];
      const drawButton = scene['drawButton'];

      expect(myHistoryButton).toBeDefined();
      expect(drawButton).toBeDefined();

      const historyFontSize = parseInt(myHistoryButton!.style.fontSize as string);
      const drawFontSize = parseInt(drawButton!.style.fontSize as string);

      expect(historyFontSize).toBeLessThan(drawFontSize);
    });

    it('should position Ranking and My History buttons horizontally aligned', () => {
      const leaderboardButton = scene['leaderboardButton'];
      const myHistoryButton = scene['myHistoryButton'];

      expect(leaderboardButton).toBeDefined();
      expect(myHistoryButton).toBeDefined();

      expect(leaderboardButton!.y).toBe(myHistoryButton!.y);
    });

    it('should navigate to GlobalRanking when Ranking button clicked', () => {
      const startSpy = vi.fn();
      scene.scene = { start: startSpy } as any;

      const leaderboardButton = scene['leaderboardButton'];
      const onHandler = leaderboardButton?.on as any;
      const pointerdownCallback = onHandler?.mock?.calls?.find((call: any[]) => call[0] === 'pointerdown')?.[1];

      if (pointerdownCallback) {
        pointerdownCallback();
      }

      expect(startSpy).toHaveBeenCalledWith('GlobalRanking');
    });

    it('should navigate to QuizHistory when My History button clicked', () => {
      const startSpy = vi.fn();
      const getSpy = vi.fn().mockReturnValue('test-user');
      scene.scene = { start: startSpy } as any;
      scene.registry = { get: getSpy } as any;

      const myHistoryButton = scene['myHistoryButton'];
      const onHandler = myHistoryButton?.on as any;
      const pointerdownCallback = onHandler?.mock?.calls?.find((call: any[]) => call[0] === 'pointerdown')?.[1];

      if (pointerdownCallback) {
        pointerdownCallback();
      }

      expect(getSpy).toHaveBeenCalledWith('userId');
      expect(startSpy).toHaveBeenCalledWith('QuizHistory', { userId: 'test-user' });
    });

    it('should handle anonymous user for My History button', () => {
      const startSpy = vi.fn();
      const getSpy = vi.fn().mockReturnValue(null);
      scene.scene = { start: startSpy } as any;
      scene.registry = { get: getSpy } as any;

      const myHistoryButton = scene['myHistoryButton'];
      const onHandler = myHistoryButton?.on as any;
      const pointerdownCallback = onHandler?.mock?.calls?.find((call: any[]) => call[0] === 'pointerdown')?.[1];

      if (pointerdownCallback) {
        pointerdownCallback();
      }

      expect(startSpy).toHaveBeenCalledWith('QuizHistory', { userId: 'anonymous' });
    });
  });

  describe('Primary Action Buttons', () => {
    it('should create Play Quiz button', () => {
      const playButton = scene['playButton'];
      expect(playButton).toBeDefined();
      expect(playButton?.text).toBe('Play Quiz');
    });

    it('should create Create Drawing button', () => {
      const drawButton = scene['drawButton'];
      expect(drawButton).toBeDefined();
      expect(drawButton?.text).toBe('Create Drawing');
    });

    it('should navigate to Quiz when Play Quiz clicked', () => {
      const startSpy = vi.fn();
      scene.scene = { start: startSpy } as any;

      const playButton = scene['playButton'];
      const onHandler = playButton?.on as any;
      const pointerdownCallback = onHandler?.mock?.calls?.find((call: any[]) => call[0] === 'pointerdown')?.[1];

      if (pointerdownCallback) {
        pointerdownCallback();
      }

      expect(startSpy).toHaveBeenCalledWith('Quiz');
    });

    it('should navigate to Drawing when Create Drawing clicked', () => {
      const startSpy = vi.fn();
      scene.scene = { start: startSpy } as any;

      const drawButton = scene['drawButton'];
      const onHandler = drawButton?.on as any;
      const pointerdownCallback = onHandler?.mock?.calls?.find((call: any[]) => call[0] === 'pointerdown')?.[1];

      if (pointerdownCallback) {
        pointerdownCallback();
      }

      expect(startSpy).toHaveBeenCalledWith('Drawing');
    });
  });

  describe('Title Display', () => {
    it('should display "What" title line', () => {
      const titleLine1 = scene['titleLine1'];
      expect(titleLine1).toBeDefined();
      expect(titleLine1?.text).toBe('What');
    });

    it('should display "Did I Draw" title line', () => {
      const titleLine2 = scene['titleLine2'];
      expect(titleLine2).toBeDefined();
      expect(titleLine2?.text).toBe('Did I Draw');
    });

    it('should display question mark', () => {
      const questionMark = scene['questionMark'];
      expect(questionMark).toBeDefined();
      expect(questionMark?.text).toBe('?');
    });
  });

  describe('Responsive Layout', () => {
    it('should center title horizontally', () => {
      const titleLine1 = scene['titleLine1'];
      const expectedX = scene.scale.width / 2;

      expect(titleLine1?.x).toBe(expectedX);
    });

    it('should update layout on resize', () => {
      const originalX = scene['titleLine1']?.x;

      scene['refreshLayout']();

      const newExpectedX = scene.scale.width / 2;
      expect(scene['titleLine1']?.x).toBe(newExpectedX);
    });
  });
});
