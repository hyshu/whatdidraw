import { vi } from 'vitest';

global.alert = vi.fn();
global.confirm = vi.fn();

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
    add: any = {
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setInteractive: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        setStyle: vi.fn().mockReturnThis(),
        setText: vi.fn().mockReturnThis(),
        setPosition: vi.fn().mockReturnThis(),
      })),
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
