import { vi } from 'vitest';

global.alert = vi.fn();
global.confirm = vi.fn();

global.fetch = vi.fn((url: string | URL | Request, init?: RequestInit) => {
  const urlString = typeof url === 'string' ? url : url.toString();

  if (urlString.includes('/api/drawing') && init?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        type: 'saveDrawing',
        drawingId: 'test-drawing-id',
        success: true,
      }),
    } as Response);
  }

  if (urlString.includes('/api/drawing') && (init?.method === 'GET' || !init?.method)) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        type: 'getDrawing',
        drawing: {
          id: 'test-drawing-id',
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
          createdBy: 'test-user',
          createdAt: Date.now(),
        },
      }),
    } as Response);
  }

  if (urlString.includes('/api/guess')) {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    const guess = (body.guess || '').trim().toLowerCase();
    const correctAnswer = 'cat';
    const isCorrect = guess === correctAnswer;

    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        type: 'submitGuess',
        correct: isCorrect,
        answer: correctAnswer,
        score: isCorrect ? 1000 : 0,
        baseScore: isCorrect ? 800 : 0,
        timeBonus: isCorrect ? 200 : 0,
      }),
    } as Response);
  }

  if (urlString.includes('/api/leaderboard/')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        type: 'getLeaderboard',
        scores: [
          { username: 'Player1', score: 850, baseScore: 700, timeBonus: 150, timestamp: Date.now() - 3600000 },
          { username: 'Player2', score: 720, baseScore: 600, timeBonus: 120, timestamp: Date.now() - 7200000 },
          { username: 'Player3', score: 650, baseScore: 550, timeBonus: 100, timestamp: Date.now() - 10800000 },
          { username: 'Player4', score: 580, baseScore: 500, timeBonus: 80, timestamp: Date.now() - 14400000 },
          { username: 'Player5', score: 520, baseScore: 450, timeBonus: 70, timestamp: Date.now() - 18000000 },
        ],
      }),
    } as Response);
  }

  return Promise.reject(new Error(`Unhandled fetch request: ${urlString}`));
});

const mockPhaser = {
  Scene: class {
    scene: any = {
      start: vi.fn(),
    };
    scale: any = {
      width: 800,
      height: 600,
      on: vi.fn(),
    };
    cameras: any = {
      main: {
        setBackgroundColor: vi.fn(),
      },
      resize: vi.fn(),
    };
    destroy() {
      // Mock destroy method
    }
    add: any = {
      text: vi.fn((x, y, text, style) => {
        const textObj: any = {
          x,
          y,
          text,
          style: style || {},
        };
        textObj.setOrigin = vi.fn(function() { return textObj; });
        textObj.setInteractive = vi.fn(function() { return textObj; });
        textObj.on = vi.fn(function() { return textObj; });
        textObj.setStyle = vi.fn(function(newStyle) {
          Object.assign(textObj.style, newStyle);
          return textObj;
        });
        textObj.setText = vi.fn(function(newText) {
          textObj.text = newText;
          return textObj;
        });
        textObj.setPosition = vi.fn(function(newX, newY) {
          textObj.x = newX;
          textObj.y = newY;
          return textObj;
        });
        return textObj;
      }),
      graphics: vi.fn(() => ({
        clear: vi.fn(),
        fillStyle: vi.fn(),
        fillRect: vi.fn(),
        lineStyle: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        strokePath: vi.fn(),
        fillCircle: vi.fn(),
      })),
      rectangle: vi.fn(() => ({
        setStrokeStyle: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
      })),
    };
    input: any = {
      on: vi.fn(),
    };
  },
};

vi.mock('phaser', () => mockPhaser);
