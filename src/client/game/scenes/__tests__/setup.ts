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
