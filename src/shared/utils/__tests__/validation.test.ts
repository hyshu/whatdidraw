import { describe, it, expect } from 'vitest';
import {
  validateStrokeCount,
  validateCoordinates,
  validateStroke,
  validateAnswer,
  validateHint,
  validateDrawing,
  sanitizeText,
  filterProfanity,
  getCharacterCount,
  VALIDATION_RULES,
} from '../validation';
import { Point, Stroke, Drawing } from '../../types/api';

describe('Validation Utils - Phase 6', () => {
  describe('getCharacterCount', () => {
    it('should count ASCII characters correctly', () => {
      expect(getCharacterCount('hello')).toBe(5);
      expect(getCharacterCount('test')).toBe(4);
    });

    it('should count Japanese characters correctly (1 character = 1 count)', () => {
      expect(getCharacterCount('こんにちは')).toBe(5);
      expect(getCharacterCount('日本語')).toBe(3);
    });

    it('should count Chinese characters correctly (1 character = 1 count)', () => {
      expect(getCharacterCount('你好世界')).toBe(4);
      expect(getCharacterCount('中文')).toBe(2);
    });

    it('should count Korean characters correctly (1 character = 1 count)', () => {
      expect(getCharacterCount('안녕하세요')).toBe(5);
      expect(getCharacterCount('한국어')).toBe(3);
    });

    it('should count emojis correctly (1 emoji = 1 count)', () => {
      expect(getCharacterCount('🎨')).toBe(1);
      expect(getCharacterCount('🖌️')).toBe(1);
      expect(getCharacterCount('😀')).toBe(1);
      expect(getCharacterCount('🎨🖌️😀')).toBe(3);
    });

    it('should count mixed text correctly', () => {
      expect(getCharacterCount('Hello 世界 🎨')).toBe(10);
      expect(getCharacterCount('Test こんにちは 😀')).toBe(12);
    });

    it('should handle empty strings', () => {
      expect(getCharacterCount('')).toBe(0);
    });
  });

  describe('filterProfanity', () => {
    it('should pass clean text', () => {
      const result = filterProfanity('hello world');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect profanity in English text', () => {
      const result = filterProfanity('fuck');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text contains inappropriate language');
    });

    it('should detect profanity with mixed case', () => {
      const result = filterProfanity('FuCk');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text contains inappropriate language');
    });

    it('should not incorrectly flag non-English text as profanity', () => {
      const japaneseResult = filterProfanity('こんにちは');
      expect(japaneseResult.isValid).toBe(true);

      const chineseResult = filterProfanity('你好');
      expect(chineseResult.isValid).toBe(true);

      const koreanResult = filterProfanity('안녕하세요');
      expect(koreanResult.isValid).toBe(true);
    });

    it('should handle emojis without false positives', () => {
      const result = filterProfanity('🎨🖌️😀');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeText('<script>alert("XSS")</script>')).toBe('alert("XSS")');
      expect(sanitizeText('<b>bold</b>')).toBe('bold');
      expect(sanitizeText('<img src="x" onerror="alert(1)">')).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeText('  hello  ')).toBe('hello');
      expect(sanitizeText('\n\ntest\n\n')).toBe('test');
    });

    it('should handle nested tags', () => {
      expect(sanitizeText('<div><span>text</span></div>')).toBe('text');
    });

    it('should preserve UTF-8 characters', () => {
      expect(sanitizeText('こんにちは')).toBe('こんにちは');
      expect(sanitizeText('你好世界')).toBe('你好世界');
      expect(sanitizeText('🎨🖌️')).toBe('🎨🖌️');
    });

    it('should handle mixed content', () => {
      expect(sanitizeText('<b>Hello</b> World')).toBe('Hello World');
    });
  });

  describe('validateStrokeCount', () => {
    it('should pass valid stroke counts', () => {
      const result = validateStrokeCount(10);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject stroke count below minimum', () => {
      const result = validateStrokeCount(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Drawing must have at least ${VALIDATION_RULES.MIN_STROKES} stroke`
      );
    });

    it('should reject stroke count above maximum', () => {
      const result = validateStrokeCount(1001);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Drawing cannot exceed ${VALIDATION_RULES.MAX_STROKES} strokes`
      );
    });

    it('should accept minimum stroke count', () => {
      const result = validateStrokeCount(VALIDATION_RULES.MIN_STROKES);
      expect(result.isValid).toBe(true);
    });

    it('should accept maximum stroke count', () => {
      const result = validateStrokeCount(VALIDATION_RULES.MAX_STROKES);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateCoordinates', () => {
    it('should pass valid coordinates', () => {
      const point: Point = { x: 100, y: 200 };
      const result = validateCoordinates(point);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject coordinates outside bounds', () => {
      const point1: Point = { x: -1, y: 100 };
      const result1 = validateCoordinates(point1);
      expect(result1.isValid).toBe(false);

      const point2: Point = { x: 100, y: 361 };
      const result2 = validateCoordinates(point2);
      expect(result2.isValid).toBe(false);
    });

    it('should accept boundary coordinates', () => {
      const point1: Point = { x: 0, y: 0 };
      const result1 = validateCoordinates(point1);
      expect(result1.isValid).toBe(true);

      const point2: Point = { x: 360, y: 360 };
      const result2 = validateCoordinates(point2);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('validateAnswer', () => {
    it('should pass valid answers', () => {
      const result = validateAnswer('cat');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty answers after trim', () => {
      const result = validateAnswer('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Answer must be at least ${VALIDATION_RULES.MIN_ANSWER_LENGTH} character`
      );
    });

    it('should reject answers exceeding max length', () => {
      const longAnswer = 'a'.repeat(51);
      const result = validateAnswer(longAnswer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Answer cannot exceed ${VALIDATION_RULES.MAX_ANSWER_LENGTH} characters`
      );
    });

    it('should validate answers with Japanese characters', () => {
      const result = validateAnswer('こんにちは');
      expect(result.isValid).toBe(true);
    });

    it('should validate answers with Chinese characters', () => {
      const result = validateAnswer('你好世界');
      expect(result.isValid).toBe(true);
    });

    it('should validate answers with Korean characters', () => {
      const result = validateAnswer('안녕하세요');
      expect(result.isValid).toBe(true);
    });

    it('should validate answers with emojis', () => {
      const result = validateAnswer('🎨');
      expect(result.isValid).toBe(true);
    });

    it('should correctly count emoji characters for length validation', () => {
      const answer = '🎨'.repeat(51);
      const result = validateAnswer(answer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Answer cannot exceed ${VALIDATION_RULES.MAX_ANSWER_LENGTH} characters`
      );
    });

    it('should reject answers with profanity', () => {
      const result = validateAnswer('fuck');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text contains inappropriate language');
    });

    it('should accept maximum length answers', () => {
      const maxAnswer = 'a'.repeat(VALIDATION_RULES.MAX_ANSWER_LENGTH);
      const result = validateAnswer(maxAnswer);
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateHint', () => {
    it('should pass valid hints', () => {
      const result = validateHint('It has four legs');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should pass empty hints', () => {
      const result = validateHint('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject hints exceeding max length', () => {
      const longHint = 'a'.repeat(101);
      const result = validateHint(longHint);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Hint cannot exceed ${VALIDATION_RULES.MAX_HINT_LENGTH} characters`
      );
    });

    it('should validate hints with Japanese characters', () => {
      const result = validateHint('これは猫です');
      expect(result.isValid).toBe(true);
    });

    it('should validate hints with Chinese characters', () => {
      const result = validateHint('这是一只猫');
      expect(result.isValid).toBe(true);
    });

    it('should validate hints with Korean characters', () => {
      const result = validateHint('이것은 고양이입니다');
      expect(result.isValid).toBe(true);
    });

    it('should validate hints with emojis', () => {
      const result = validateHint('It looks like this 🎨');
      expect(result.isValid).toBe(true);
    });

    it('should correctly count emoji characters for length validation', () => {
      const hint = '🎨'.repeat(101);
      const result = validateHint(hint);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        `Hint cannot exceed ${VALIDATION_RULES.MAX_HINT_LENGTH} characters`
      );
    });

    it('should reject hints with profanity', () => {
      const result = validateHint('fuck');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text contains inappropriate language');
    });

    it('should accept maximum length hints', () => {
      const maxHint = 'a'.repeat(VALIDATION_RULES.MAX_HINT_LENGTH);
      const result = validateHint(maxHint);
      expect(result.isValid).toBe(true);
    });

    it('should not validate profanity on empty hints', () => {
      const result = validateHint('   ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateStroke', () => {
    it('should pass valid strokes', () => {
      const stroke: Stroke = {
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 200 },
        ],
        color: '#000000',
        width: 5,
        timestamp: 1000,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject strokes with no points', () => {
      const stroke: Stroke = {
        points: [],
        color: '#000000',
        width: 5,
        timestamp: 1000,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stroke must contain at least one point');
    });

    it('should reject strokes with invalid coordinates', () => {
      const stroke: Stroke = {
        points: [{ x: -1, y: 100 }],
        color: '#000000',
        width: 5,
        timestamp: 1000,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(false);
    });

    it('should reject strokes with invalid color', () => {
      const stroke: any = {
        points: [{ x: 100, y: 100 }],
        color: null,
        width: 5,
        timestamp: 1000,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stroke must have a valid color');
    });

    it('should reject strokes with invalid width', () => {
      const stroke: any = {
        points: [{ x: 100, y: 100 }],
        color: '#000000',
        width: -1,
        timestamp: 1000,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stroke must have a valid width');
    });

    it('should reject strokes with invalid timestamp', () => {
      const stroke: any = {
        points: [{ x: 100, y: 100 }],
        color: '#000000',
        width: 5,
        timestamp: -1,
      };
      const result = validateStroke(stroke);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Stroke must have a valid timestamp');
    });
  });

  describe('validateDrawing', () => {
    it('should pass valid drawings', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: 'cat',
        hint: 'It has four legs',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject drawings without strokes array', () => {
      const drawing: any = {
        answer: 'cat',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Drawing must contain strokes array');
    });

    it('should reject drawings with invalid answer', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: '',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
    });

    it('should reject drawings with invalid hint', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: 'cat',
        hint: 'a'.repeat(101),
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
    });

    it('should validate drawings with international characters', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: 'こんにちは',
        hint: '你好世界',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(true);
    });

    it('should validate drawings with emojis', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: '🎨',
        hint: 'painting 🖌️',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(true);
    });

    it('should reject drawings with profanity in answer', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: 'fuck',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('inappropriate language'))).toBe(true);
    });

    it('should accept drawings without hint', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
        ],
        answer: 'cat',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(true);
    });

    it('should reject drawings with too many strokes', () => {
      const strokes = Array(1001)
        .fill(null)
        .map(() => ({
          points: [{ x: 100, y: 100 }],
          color: '#000000',
          width: 5,
          timestamp: 1000,
        }));
      const drawing: Partial<Drawing> = {
        strokes,
        answer: 'cat',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('1000 strokes'))).toBe(true);
    });

    it('should validate all strokes in the drawing', () => {
      const drawing: Partial<Drawing> = {
        strokes: [
          {
            points: [{ x: 100, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 1000,
          },
          {
            points: [{ x: -1, y: 100 }],
            color: '#000000',
            width: 5,
            timestamp: 2000,
          },
        ],
        answer: 'cat',
      };
      const result = validateDrawing(drawing);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Stroke 1'))).toBe(true);
    });
  });

  describe('XSS Prevention Integration', () => {
    it('should prevent script tag injection', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
    });

    it('should prevent HTML entity injection', () => {
      const maliciousInput = '<img src=x onerror=alert(1)>';
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).not.toContain('<img');
    });

    it('should handle combined sanitization', () => {
      const maliciousInput = '<b onclick="alert(1)">Click me</b>';
      const sanitized = sanitizeText(maliciousInput);
      expect(sanitized).toBe('Click me');
    });

    it('should preserve safe content after sanitization', () => {
      const safeInput = 'This is a cat 🐱';
      const sanitized = sanitizeText(safeInput);
      expect(sanitized).toBe('This is a cat 🐱');
    });
  });

  describe('UTF-8 Support Integration', () => {
    it('should handle mixed international characters in validation', () => {
      const mixedText = 'Hello こんにちは 你好 안녕하세요 🎨';
      const result = validateAnswer(mixedText);
      expect(result.isValid).toBe(true);
    });

    it('should correctly validate length with mixed characters', () => {
      const text = 'Hello世界🎨';
      const charCount = getCharacterCount(text);
      expect(charCount).toBe(8);
    });

    it('should not incorrectly flag international characters as profanity', () => {
      const texts = [
        'こんにちは世界',
        '你好朋友们',
        '안녕하세요친구',
        'Hello مرحبا שלום',
      ];

      texts.forEach(text => {
        const result = filterProfanity(text);
        expect(result.isValid).toBe(true);
      });
    });

    it('should handle complex emoji sequences', () => {
      const emojiSequences = [
        '👨‍👩‍👧‍👦',
        '🏳️‍🌈',
        '👍🏿',
      ];

      emojiSequences.forEach(emoji => {
        const charCount = getCharacterCount(emoji);
        expect(charCount).toBeGreaterThanOrEqual(1);
      });
    });
  });
});
