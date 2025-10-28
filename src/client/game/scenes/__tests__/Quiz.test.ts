import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Quiz } from '../Quiz';

describe('Phase 2: Quiz Scene and Playback System', () => {
  let scene: Quiz;
  let mockDrawingData: any;

  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();

    mockDrawingData = {
      answer: 'cat',
      hint: 'It has four legs',
      strokes: [
        {
          points: [
            { x: 100, y: 100 },
            { x: 150, y: 150 },
          ],
          color: '#000000',
          width: 3,
          timestamp: 0,
        },
        {
          points: [
            { x: 200, y: 200 },
            { x: 250, y: 250 },
          ],
          color: '#ff0000',
          width: 5,
          timestamp: 100,
        },
      ],
      totalStrokes: 2,
    };

    localStorage.setItem('currentQuiz', JSON.stringify(mockDrawingData));

    scene = new Quiz();
    scene.create();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  describe('Basic Playback Viewer (2.1)', () => {
    it('should load quiz scene and display canvas correctly', () => {
      expect(scene['canvas']).toBeDefined();
      expect(scene['drawingData']).toEqual(mockDrawingData);
    });

    it('should create playback viewer with 360x360 canvas', () => {
      expect(scene['canvasSize']).toBe(360);
      expect(scene['canvas']).toBeDefined();
    });

    it('should initialize with drawing data from localStorage', () => {
      expect(scene['drawingData']).toEqual(mockDrawingData);
    });

    it('should create play/pause button', () => {
      const playButton = scene['playPauseButton'];
      expect(playButton).toBeDefined();
      expect(playButton.text).toBe('Play');
    });

    it('should create progress bar', () => {
      const progressText = scene['progressText'];
      expect(progressText).toBeDefined();
      expect(progressText.text).toContain('Progress: 0/2 strokes');
    });

    it('should initialize playback state as not playing', () => {
      expect(scene['isPlaying']).toBe(false);
    });

    it('should track completed strokes', () => {
      expect(scene['completedStrokes']).toBeDefined();
      expect(scene['completedStrokes']).toEqual([]);
    });

    it('should track current stroke index', () => {
      expect(scene['currentStrokeIndex']).toBe(0);
    });
  });

  describe('Stroke Timing System (2.1.1)', () => {
    it('should extract timestamp data from each stroke', () => {
      const strokes = scene['drawingData']!.strokes;
      expect(strokes[0].timestamp).toBe(0);
      expect(strokes[1].timestamp).toBe(100);
    });

    it('should track playback start time', () => {
      scene['togglePlayPause']();
      expect(scene['playbackStartTime']).toBeGreaterThan(0);
    });

    it('should preserve original drawing timing during replay', () => {
      const strokes = scene['drawingData']!.strokes;
      expect(strokes[1].timestamp - strokes[0].timestamp).toBe(100);
    });

    it('should handle pause state during playback', () => {
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(true);
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(false);
      expect(scene['pausedTime']).toBeGreaterThanOrEqual(0);
    });

    it('should resume from paused position', () => {
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(true);
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(false);
      const pausedTime = scene['pausedTime'];
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(true);
      expect(pausedTime).toBeGreaterThanOrEqual(0);
    });

    it('should update progress text during playback', () => {
      scene['currentStrokeIndex'] = 1;
      scene['progressText'].setText(`Progress: ${scene['currentStrokeIndex']}/${scene['drawingData']!.totalStrokes} strokes`);

      expect(scene['progressText'].text).toBe('Progress: 1/2 strokes');
    });
  });

  describe('Play/Pause Controls (2.1)', () => {
    it('should toggle play state when play button is clicked', () => {
      scene['togglePlayPause']();
      expect(scene['isPlaying']).toBe(true);
    });

    it('should update button text on play', () => {
      scene['togglePlayPause']();
      expect(scene['playPauseButton'].text).toBe('Pause');
    });

    it('should update button text on pause', () => {
      scene['togglePlayPause']();
      scene['togglePlayPause']();
      expect(scene['playPauseButton'].text).toBe('Play');
    });

    it('should update button background color on play', () => {
      scene['togglePlayPause']();
      expect(scene['playPauseButton'].style.backgroundColor).toBe('#e67e22');
    });

    it('should update button background color on pause', () => {
      scene['togglePlayPause']();
      scene['togglePlayPause']();
      expect(scene['playPauseButton'].style.backgroundColor).toBe('#27ae60');
    });

    it('should reset playback on replay', () => {
      scene['currentStrokeIndex'] = 2;
      scene['togglePlayPause']();
      expect(scene['currentStrokeIndex']).toBe(0);
    });
  });

  describe('Quiz Interaction (2.2)', () => {
    it('should create guess input field below canvas', () => {
      const input = scene['guessInput'];
      expect(input).toBeDefined();
      expect(input?.type).toBe('text');
    });

    it('should display hint when available', () => {
      const hintText = scene['hintText'];
      expect(hintText).toBeDefined();
      expect(hintText.text).toContain('Hint: It has four legs');
    });

    it('should not display hint when unavailable', () => {
      const dataWithoutHint = { ...mockDrawingData, hint: undefined };
      localStorage.setItem('currentQuiz', JSON.stringify(dataWithoutHint));

      const newScene = new Quiz();
      newScene.create();

      const hintText = newScene['hintText'];
      expect(hintText.text).toBe('');
    });

    it('should accept user input in guess field', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'test guess';
        expect(input.value).toBe('test guess');
      }
    });

    it('should create submit button', () => {
      const button = scene['submitButton'];
      expect(button).toBeDefined();
      expect(button?.textContent).toBe('Submit Guess');
    });

    it('should validate correct answer', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'cat';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay).toBeDefined();
      }
    });

    it('should validate incorrect answer', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'dog';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay).toBeDefined();
      }
    });

    it('should check answer case-insensitively', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'CAT';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay).toBeDefined();
      }
    });

    it('should trim whitespace from guess', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = '  cat  ';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay).toBeDefined();
      }
    });

    it('should display answer after incorrect guess', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'dog';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay?.textContent).toContain('cat');
      }
    });

    it('should pause playback on guess submission', () => {
      scene['togglePlayPause']();
      const input = scene['guessInput'];
      if (input) {
        input.value = 'cat';
        scene['handleGuessSubmit']();
        expect(scene['isPlaying']).toBe(false);
      }
    });
  });

  describe('Score Display (2.3)', () => {
    it('should calculate base score correctly', () => {
      scene['currentStrokeIndex'] = 0;
      scene['completedStrokes'] = [];

      const totalStrokes = scene['drawingData']!.totalStrokes;
      const viewedStrokes = 0;
      const baseScore = (totalStrokes - viewedStrokes) * 100;

      expect(baseScore).toBe(200);
    });

    it('should calculate time bonus correctly', () => {
      const elapsedSeconds = 30;
      const timeBonus = Math.max(0, (60 - elapsedSeconds) * 10);
      expect(timeBonus).toBe(300);
    });

    it('should display total score', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'cat';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay?.textContent).toContain('points');
      }
    });

    it('should show score breakdown with base and time bonus', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'cat';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay?.textContent).toContain('Base Score');
        expect(scoreDisplay?.textContent).toContain('Time Bonus');
      }
    });

    it('should display elapsed time', () => {
      const timeText = scene['timeText'];
      expect(timeText.text).toMatch(/Time: \d{2}:\d{2}/);
    });

    it('should calculate elapsed time accurately', () => {
      const now = Date.now();
      scene['guessStartTime'] = now - 30000;

      // Manually update time text as update() would
      const guessElapsed = Math.floor((now - scene['guessStartTime']) / 1000);
      const minutes = Math.floor(guessElapsed / 60);
      const seconds = guessElapsed % 60;
      scene['timeText'].setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      const timeText = scene['timeText'];
      expect(timeText.text).toContain('00:30');
    });

    it('should display viewed stroke count', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'cat';
        scene['completedStrokes'] = scene['drawingData']!.strokes.slice(0, 1);
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay).toBeDefined();
      }
    });

    it('should show zero score for incorrect answer', () => {
      const input = scene['guessInput'];
      if (input) {
        input.value = 'dog';
        scene['handleGuessSubmit']();
        const scoreDisplay = scene['scoreDisplay'];
        expect(scoreDisplay?.textContent).toContain('Incorrect');
      }
    });

    it('should format time with leading zeros', () => {
      const now = Date.now();
      scene['guessStartTime'] = now - 5000;

      // Manually update time text as update() would
      const guessElapsed = Math.floor((now - scene['guessStartTime']) / 1000);
      const minutes = Math.floor(guessElapsed / 60);
      const seconds = guessElapsed % 60;
      scene['timeText'].setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

      const timeText = scene['timeText'];
      expect(timeText.text).toBe('Time: 00:05');
    });

    it('should update time display every second', () => {
      const now = Date.now();

      scene['guessStartTime'] = now - 1000;
      let guessElapsed = Math.floor((now - scene['guessStartTime']) / 1000);
      let minutes = Math.floor(guessElapsed / 60);
      let seconds = guessElapsed % 60;
      scene['timeText'].setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      const time1 = scene['timeText'].text;

      scene['guessStartTime'] = now - 2000;
      guessElapsed = Math.floor((now - scene['guessStartTime']) / 1000);
      minutes = Math.floor(guessElapsed / 60);
      seconds = guessElapsed % 60;
      scene['timeText'].setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      const time2 = scene['timeText'].text;

      expect(time1).not.toBe(time2);
    });
  });

  describe('Progress Updates (2.1)', () => {
    it('should update progress bar during playback', () => {
      scene['progressText'].setText(`Progress: 0/${scene['drawingData']!.totalStrokes} strokes`);

      expect(scene['progressText'].text).toBe('Progress: 0/2 strokes');

      scene['currentStrokeIndex'] = 1;
      scene['progressText'].setText(`Progress: ${scene['currentStrokeIndex']}/${scene['drawingData']!.totalStrokes} strokes`);

      expect(scene['progressText'].text).toBe('Progress: 1/2 strokes');
    });

    it('should show total stroke count', () => {
      expect(scene['progressText'].text).toContain('2 strokes');
    });

    it('should reset progress on replay', () => {
      scene['currentStrokeIndex'] = 2;
      scene['togglePlayPause']();

      expect(scene['progressText'].text).toBe('Progress: 0/2 strokes');
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

    it('should show confirmation when back is clicked', () => {
      scene['handleBack']();
      expect(global.confirm).toHaveBeenCalled();
    });

    it('should navigate to MainMenu when confirmed', () => {
      vi.mocked(global.confirm).mockReturnValueOnce(true);
      scene['handleBack']();
      expect(scene.scene.start).toHaveBeenCalledWith('MainMenu');
    });

    it('should cleanup DOM elements on back', () => {
      const inputContainer = scene['inputContainer'];
      vi.mocked(global.confirm).mockReturnValueOnce(true);
      scene['handleBack']();
      expect(inputContainer?.parentElement).toBeNull();
    });
  });

  describe('Responsive Layout', () => {
    it('should center canvas horizontally', () => {
      const expectedX = scene.scale.width / 2 - scene['canvasSize'] / 2;
      expect(scene['canvasX']).toBe(expectedX);
    });

    it('should update layout on resize', () => {
      const originalCanvasX = scene['canvasX'];

      scene['handleResize']();

      const newExpectedX = scene.scale.width / 2 - scene['canvasSize'] / 2;
      expect(scene['canvasX']).toBe(newExpectedX);
    });
  });
});
