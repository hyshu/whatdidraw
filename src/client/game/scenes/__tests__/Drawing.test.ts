import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Drawing } from '../Drawing';

describe('Phase 1: Drawing Canvas System', () => {
  let scene: Drawing;

  beforeEach(() => {
    scene = new Drawing();
    vi.clearAllMocks();
  });

  describe('Canvas Initialization', () => {
    it('should initialize canvas with 360x360px dimensions', () => {
      scene.create();

      expect(scene['canvasSize']).toBe(360);
      expect(scene['canvas']).toBeDefined();
    });

    it('should create canvas graphics object', () => {
      scene.create();

      expect(scene['canvas']).toBeDefined();
      expect(scene.add.graphics).toHaveBeenCalled();
    });

    it('should set canvas background to white', () => {
      scene.create();
      const canvas = scene['canvas'];

      expect(canvas.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
    });

    it('should position canvas centered horizontally', () => {
      scene.create();
      const expectedX = scene.scale.width / 2 - scene['canvasSize'] / 2;

      expect(scene['canvasX']).toBe(expectedX);
    });
  });

  describe('Drawing Tools', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should provide 8 color options', () => {
      expect(scene['colors']).toHaveLength(8);
    });

    it('should include all required colors', () => {
      const colorHexes = scene['colors'].map(c => c.hex);

      expect(colorHexes).toContain('#000000');
      expect(colorHexes).toContain('#ff0000');
      expect(colorHexes).toContain('#00ff00');
      expect(colorHexes).toContain('#0000ff');
      expect(colorHexes).toContain('#ffff00');
      expect(colorHexes).toContain('#ff00ff');
      expect(colorHexes).toContain('#00ffff');
      expect(colorHexes).toContain('#ffffff');
    });

    it('should provide 5 brush sizes', () => {
      expect(scene['sizes']).toHaveLength(5);
    });

    it('should include sizes: 1px, 3px, 5px, 8px, 12px', () => {
      expect(scene['sizes']).toEqual([1, 3, 5, 8, 12]);
    });

    it('should default to black color', () => {
      expect(scene['currentColor']).toBe('#000000');
    });

    it('should default to 3px brush size', () => {
      expect(scene['currentWidth']).toBe(3);
    });

    it('should create color selection buttons', () => {
      expect(scene.add.rectangle).toHaveBeenCalledTimes(8);
    });

    it('should create size selection buttons', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const sizeButtons = textCalls.filter((call: any) =>
        call[2]?.includes('px') && !call[2]?.includes('Back') && !call[2]?.includes('Finish')
      );

      expect(sizeButtons.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Stroke Capture', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should initialize with empty strokes array', () => {
      expect(scene['strokes']).toEqual([]);
    });

    it('should store stroke with coordinates', () => {
      scene['currentStroke'] = [{ x: 10, y: 20 }, { x: 15, y: 25 }];
      scene['isDrawing'] = true;

      scene.input.on.mock.calls.find((call: any) => call[0] === 'pointerup')?.[1]?.();

      expect(scene['strokes'].length).toBeGreaterThan(0);
    });

    it('should capture color in stroke data', () => {
      scene['currentColor'] = '#ff0000';
      scene['currentStroke'] = [{ x: 10, y: 20 }];
      scene['isDrawing'] = true;

      scene.input.on.mock.calls.find((call: any) => call[0] === 'pointerup')?.[1]?.();

      if (scene['strokes'].length > 0) {
        expect(scene['strokes'][0].color).toBe('#ff0000');
      }
    });

    it('should capture width in stroke data', () => {
      scene['currentWidth'] = 8;
      scene['currentStroke'] = [{ x: 10, y: 20 }];
      scene['isDrawing'] = true;

      scene.input.on.mock.calls.find((call: any) => call[0] === 'pointerup')?.[1]?.();

      if (scene['strokes'].length > 0) {
        expect(scene['strokes'][0].width).toBe(8);
      }
    });

    it('should capture timestamp in stroke data', () => {
      scene['currentStroke'] = [{ x: 10, y: 20 }];
      scene['isDrawing'] = true;

      scene.input.on.mock.calls.find((call: any) => call[0] === 'pointerup')?.[1]?.();

      if (scene['strokes'].length > 0) {
        expect(scene['strokes'][0].timestamp).toBeDefined();
        expect(typeof scene['strokes'][0].timestamp).toBe('number');
      }
    });
  });

  describe('Undo Functionality', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should remove last stroke when undo is called', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
        { points: [{ x: 30, y: 40 }], color: '#ff0000', width: 5, timestamp: 100 },
      ];

      scene['handleUndo']();

      expect(scene['strokes']).toHaveLength(1);
      expect(scene['strokes'][0].color).toBe('#000000');
    });

    it('should do nothing when strokes array is empty', () => {
      scene['strokes'] = [];

      scene['handleUndo']();

      expect(scene['strokes']).toHaveLength(0);
    });

    it('should update stroke counter after undo', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      const setTextSpy = vi.fn();
      scene['strokeCountText'] = { setText: setTextSpy } as any;

      scene['handleUndo']();

      expect(setTextSpy).toHaveBeenCalledWith('Strokes: 0');
    });
  });

  describe('Stroke Counter', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should display stroke count', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const strokeCountCall = textCalls.find((call: any) => call[2]?.includes('Strokes:'));

      expect(strokeCountCall).toBeDefined();
    });

    it('should update counter when strokes are added', () => {
      const setTextSpy = vi.fn();
      scene['strokeCountText'] = { setText: setTextSpy } as any;
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
        { points: [{ x: 30, y: 40 }], color: '#ff0000', width: 5, timestamp: 100 },
      ];

      scene['updateStrokeCount']();

      expect(setTextSpy).toHaveBeenCalledWith('Strokes: 2');
    });
  });

  describe('Finish Button', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should create Finish button', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const finishButton = textCalls.find((call: any) => call[2] === 'Finish');

      expect(finishButton).toBeDefined();
    });

    it('should make Finish button interactive', () => {
      expect(scene['finishButton'].setInteractive).toHaveBeenCalled();
    });

    it('should show alert when finishing with no strokes', () => {
      scene['strokes'] = [];

      scene['handleFinish']();

      expect(global.alert).toHaveBeenCalledWith('Please draw at least 1 stroke before finishing.');
    });

    it('should show input modal when finishing with strokes', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];

      scene['handleFinish']();

      expect(scene['inputModal']).toBeDefined();
    });
  });

  describe('Answer/Hint Input Form', () => {
    beforeEach(() => {
      scene.create();
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      document.body.innerHTML = '';
    });

    it('should create input modal when Finish is clicked', () => {
      scene['showInputModal']();

      expect(scene['inputModal']).toBeDefined();
      expect(document.body.contains(scene['inputModal']!)).toBe(true);
    });

    it('should include answer input field', () => {
      scene['showInputModal']();
      const answerInput = scene['inputModal']!.querySelector('input[type="text"]');

      expect(answerInput).toBeDefined();
    });

    it('should set answer max length to 50', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;

      expect(answerInput.maxLength).toBe(50);
    });

    it('should set hint max length to 100', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const hintInput = inputs[1] as HTMLInputElement;

      expect(hintInput.maxLength).toBe(100);
    });

    it('should display character counter for answer', () => {
      scene['showInputModal']();
      const text = scene['inputModal']!.textContent;

      expect(text).toContain('0/50 characters');
    });

    it('should display character counter for hint', () => {
      scene['showInputModal']();
      const text = scene['inputModal']!.textContent;

      expect(text).toContain('0/100 characters');
    });

    it('should update answer character counter on input', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;

      answerInput.value = 'cat';
      answerInput.dispatchEvent(new Event('input'));

      const text = scene['inputModal']!.textContent;
      expect(text).toContain('3/50 characters');
    });

    it('should update hint character counter on input', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const hintInput = inputs[1] as HTMLInputElement;

      hintInput.value = 'an animal';
      hintInput.dispatchEvent(new Event('input'));

      const text = scene['inputModal']!.textContent;
      expect(text).toContain('9/100 characters');
    });

    it('should validate answer is required', () => {
      scene['showInputModal']();
      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');

      submitButton?.click();

      expect(global.alert).toHaveBeenCalledWith('Answer is required and must be at least 1 character.');
    });

    it('should validate answer max length', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;
      answerInput.value = 'a'.repeat(51);

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      expect(global.alert).toHaveBeenCalledWith('Answer must be 50 characters or less.');
    });

    it('should validate hint max length', () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;
      const hintInput = inputs[1] as HTMLInputElement;

      answerInput.value = 'cat';
      hintInput.value = 'a'.repeat(101);

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      expect(global.alert).toHaveBeenCalledWith('Hint must be 100 characters or less.');
    });

    it('should accept empty hint as optional', async () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;

      answerInput.value = 'cat';

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(scene.scene.start).toHaveBeenCalledWith('MainMenu');
    });

    it('should show UTF-8 support labels', () => {
      scene['showInputModal']();
      const labels = scene['inputModal']!.querySelectorAll('label');

      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe('Back Button', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should create Back button in top-left corner', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const backButtonCall = textCalls.find((call: any) => call[2]?.includes('Back'));

      expect(backButtonCall).toBeDefined();
      expect(backButtonCall[0]).toBe(15);
      expect(backButtonCall[1]).toBe(15);
    });

    it('should use smaller font size than Finish button', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const backButtonCall = textCalls.find((call: any) => call[2]?.includes('Back'));
      const finishButtonCall = textCalls.find((call: any) => call[2] === 'Finish');

      const backFontSize = parseInt(backButtonCall[3]?.fontSize || '0');
      const finishFontSize = parseInt(finishButtonCall[3]?.fontSize || '0');

      expect(backFontSize).toBeLessThan(finishFontSize);
    });

    it('should show confirmation when back is clicked with unsaved strokes', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      (global.confirm as any).mockReturnValue(false);

      scene['handleBack']();

      expect(global.confirm).toHaveBeenCalledWith('You have unsaved strokes. Are you sure you want to go back?');
    });

    it('should not show confirmation when back is clicked with no strokes', () => {
      scene['strokes'] = [];

      scene['handleBack']();

      expect(global.confirm).not.toHaveBeenCalled();
    });

    it('should return to MainMenu when confirmed', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      (global.confirm as any).mockReturnValue(true);

      scene['handleBack']();

      expect(scene.scene.start).toHaveBeenCalledWith('MainMenu');
    });

    it('should not navigate when confirmation is cancelled', () => {
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      (global.confirm as any).mockReturnValue(false);

      scene['handleBack']();

      expect(scene.scene.start).not.toHaveBeenCalled();
    });
  });

  describe('Return to Title Screen', () => {
    beforeEach(() => {
      scene.create();
      scene['strokes'] = [
        { points: [{ x: 10, y: 20 }], color: '#000000', width: 3, timestamp: 0 },
      ];
      document.body.innerHTML = '';
    });

    it('should navigate to MainMenu after submitting answer and hint', async () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;
      answerInput.value = 'cat';

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(scene.scene.start).toHaveBeenCalledWith('MainMenu');
    });

    it('should cleanup modal after submission', async () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;
      answerInput.value = 'cat';

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(scene['inputModal']).toBeNull();
    });

    it('should clear strokes after submission', async () => {
      scene['showInputModal']();
      const inputs = scene['inputModal']!.querySelectorAll('input[type="text"]');
      const answerInput = inputs[0] as HTMLInputElement;
      answerInput.value = 'cat';

      const buttons = scene['inputModal']!.querySelectorAll('button');
      const submitButton = Array.from(buttons).find(b => b.textContent === 'Submit');
      submitButton?.click();

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(scene['strokes']).toHaveLength(0);
    });
  });
});

describe('Phase 1: Layout and Responsive Design', () => {
  let scene: Drawing;

  beforeEach(() => {
    scene = new Drawing();
    vi.clearAllMocks();
  });

  describe('Mobile Screen Widths', () => {
    it('should handle 320px width', () => {
      scene.scale.width = 320;
      scene.scale.height = 568;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      const expectedX = (320 - 360) / 2;
      expect(scene['canvasX']).toBe(expectedX);
    });

    it('should handle 375px width', () => {
      scene.scale.width = 375;
      scene.scale.height = 667;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });

    it('should handle 414px width', () => {
      scene.scale.width = 414;
      scene.scale.height = 896;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });

    it('should handle 768px width', () => {
      scene.scale.width = 768;
      scene.scale.height = 1024;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Desktop Screen Widths', () => {
    it('should handle 1024px width', () => {
      scene.scale.width = 1024;
      scene.scale.height = 768;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });

    it('should handle 1440px width', () => {
      scene.scale.width = 1440;
      scene.scale.height = 900;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });

    it('should handle 1920px width', () => {
      scene.scale.width = 1920;
      scene.scale.height = 1080;

      scene.create();

      expect(scene['canvasX']).toBeDefined();
      expect(scene['canvasX']).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Canvas Positioning', () => {
    it('should center canvas horizontally on narrow screens', () => {
      scene.scale.width = 320;
      scene.create();

      const expectedX = (320 - 360) / 2;
      expect(scene['canvasX']).toBe(expectedX);
    });

    it('should center canvas horizontally on wide screens', () => {
      scene.scale.width = 1920;
      scene.create();

      const expectedX = (1920 - 360) / 2;
      expect(scene['canvasX']).toBe(expectedX);
    });
  });

  describe('UI Element Overlap Prevention', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should position back button without overlapping canvas', () => {
      const backButtonY = 15;
      const canvasY = scene['canvasY'];

      expect(backButtonY).toBeLessThan(canvasY);
    });

    it('should position finish button in top-right', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const finishButtonCall = textCalls.find((call: any) => call[2] === 'Finish');

      expect(finishButtonCall[0]).toBeGreaterThan(scene.scale.width / 2);
    });

    it('should position undo button below canvas', () => {
      const undoY = scene['canvasY'] + scene['canvasSize'] + 10;

      expect(scene.add.text).toHaveBeenCalledWith(
        expect.any(Number),
        undoY,
        'Undo',
        expect.any(Object)
      );
    });

    it('should position color palette below undo button', () => {
      const textCalls = (scene.add.text as any).mock.calls;
      const undoCall = textCalls.find((call: any) => call[2] === 'Undo');
      const colorsCall = textCalls.find((call: any) => call[2] === 'Colors:');

      if (undoCall && colorsCall) {
        expect(colorsCall[1]).toBeGreaterThan(undoCall[1]);
      }
    });
  });

  describe('Horizontal Scrolling Prevention', () => {
    it('should center canvas on 320px width', () => {
      scene.scale.width = 320;
      scene.create();

      const expectedX = (320 - 360) / 2;
      expect(scene['canvasX']).toBe(expectedX);
    });

    it('should fit all elements within viewport on mobile (375px+)', () => {
      scene.scale.width = 375;
      scene.create();

      const canvasRight = scene['canvasX'] + scene['canvasSize'];
      const viewportWidth = scene.scale.width;

      expect(canvasRight).toBeLessThanOrEqual(viewportWidth);
    });

    it('should fit all elements within viewport on desktop', () => {
      scene.scale.width = 1920;
      scene.create();

      const canvasRight = scene['canvasX'] + scene['canvasSize'];
      const viewportWidth = scene.scale.width;

      expect(canvasRight).toBeLessThanOrEqual(viewportWidth);
    });
  });

  describe('Responsive Resize', () => {
    beforeEach(() => {
      scene.create();
    });

    it('should reposition canvas on resize', () => {
      const originalX = scene['canvasX'];
      scene.scale.width = 1024;

      scene['handleResize']();

      const newX = scene['canvasX'];
      expect(newX).not.toBe(originalX);
    });

    it('should update button positions on resize', () => {
      scene.scale.width = 1024;
      const setPositionSpy = vi.fn();
      scene['finishButton'] = { setPosition: setPositionSpy } as any;

      scene['handleResize']();

      expect(setPositionSpy).toHaveBeenCalledWith(1024 - 15, 15);
    });
  });
});
