import { Point, Stroke, Drawing } from '../types/api';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const VALIDATION_RULES = {
  MIN_STROKES: 1,
  MAX_STROKES: 1000,
  MIN_COORDINATE: 0,
  MAX_COORDINATE: 360,
  MIN_ANSWER_LENGTH: 1,
  MAX_ANSWER_LENGTH: 50,
  MIN_HINT_LENGTH: 0,
  MAX_HINT_LENGTH: 100,
} as const;

export function validateStrokeCount(count: number): ValidationResult {
  const errors: string[] = [];

  if (count < VALIDATION_RULES.MIN_STROKES) {
    errors.push(`Drawing must have at least ${VALIDATION_RULES.MIN_STROKES} stroke`);
  }

  if (count > VALIDATION_RULES.MAX_STROKES) {
    errors.push(`Drawing cannot exceed ${VALIDATION_RULES.MAX_STROKES} strokes`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateCoordinates(point: Point): ValidationResult {
  const errors: string[] = [];

  if (point.x < VALIDATION_RULES.MIN_COORDINATE || point.x > VALIDATION_RULES.MAX_COORDINATE) {
    errors.push(`X coordinate must be between ${VALIDATION_RULES.MIN_COORDINATE} and ${VALIDATION_RULES.MAX_COORDINATE}`);
  }

  if (point.y < VALIDATION_RULES.MIN_COORDINATE || point.y > VALIDATION_RULES.MAX_COORDINATE) {
    errors.push(`Y coordinate must be between ${VALIDATION_RULES.MIN_COORDINATE} and ${VALIDATION_RULES.MAX_COORDINATE}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateStroke(stroke: Stroke): ValidationResult {
  const errors: string[] = [];

  if (!stroke.points || stroke.points.length === 0) {
    errors.push('Stroke must contain at least one point');
  }

  for (let i = 0; i < stroke.points.length; i++) {
    const point = stroke.points[i];
    if (!point) continue;
    const coordValidation = validateCoordinates(point);
    if (!coordValidation.isValid) {
      errors.push(`Point ${i}: ${coordValidation.errors.join(', ')}`);
    }
  }

  if (!stroke.color || typeof stroke.color !== 'string') {
    errors.push('Stroke must have a valid color');
  }

  if (typeof stroke.width !== 'number' || stroke.width <= 0) {
    errors.push('Stroke must have a valid width');
  }

  if (typeof stroke.timestamp !== 'number' || stroke.timestamp < 0) {
    errors.push('Stroke must have a valid timestamp');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateAnswer(answer: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = answer.trim();

  if (trimmed.length < VALIDATION_RULES.MIN_ANSWER_LENGTH) {
    errors.push(`Answer must be at least ${VALIDATION_RULES.MIN_ANSWER_LENGTH} character`);
  }

  if (trimmed.length > VALIDATION_RULES.MAX_ANSWER_LENGTH) {
    errors.push(`Answer cannot exceed ${VALIDATION_RULES.MAX_ANSWER_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateHint(hint: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = hint.trim();

  if (trimmed.length > VALIDATION_RULES.MAX_HINT_LENGTH) {
    errors.push(`Hint cannot exceed ${VALIDATION_RULES.MAX_HINT_LENGTH} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '');
}

export function validateDrawing(drawing: Partial<Drawing>): ValidationResult {
  const errors: string[] = [];

  if (!drawing.strokes || !Array.isArray(drawing.strokes)) {
    errors.push('Drawing must contain strokes array');
    return { isValid: false, errors };
  }

  const strokeCountValidation = validateStrokeCount(drawing.strokes.length);
  if (!strokeCountValidation.isValid) {
    errors.push(...strokeCountValidation.errors);
  }

  for (let i = 0; i < drawing.strokes.length; i++) {
    const stroke = drawing.strokes[i];
    if (!stroke) continue;
    const strokeValidation = validateStroke(stroke);
    if (!strokeValidation.isValid) {
      errors.push(`Stroke ${i}: ${strokeValidation.errors.join(', ')}`);
    }
  }

  if (drawing.answer !== undefined) {
    const answerValidation = validateAnswer(drawing.answer);
    if (!answerValidation.isValid) {
      errors.push(...answerValidation.errors);
    }
  }

  if (drawing.hint !== undefined && drawing.hint.length > 0) {
    const hintValidation = validateHint(drawing.hint);
    if (!hintValidation.isValid) {
      errors.push(...hintValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
