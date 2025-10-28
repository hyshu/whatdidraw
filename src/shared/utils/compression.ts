import { Stroke, Point } from '../types/api';

interface CompressedPoint {
  x: number;
  y: number;
}

interface CompressedStroke {
  p: CompressedPoint[];
  c: string;
  w: number;
  t: number;
}

export function roundCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}

export function compressPoint(point: Point): CompressedPoint {
  return {
    x: roundCoordinate(point.x),
    y: roundCoordinate(point.y),
  };
}

export function decompressPoint(point: CompressedPoint): Point {
  return {
    x: point.x,
    y: point.y,
  };
}

export function compressStroke(stroke: Stroke): CompressedStroke {
  return {
    p: stroke.points.map(compressPoint),
    c: stroke.color,
    w: stroke.width,
    t: stroke.timestamp,
  };
}

export function decompressStroke(compressed: CompressedStroke): Stroke {
  return {
    points: compressed.p.map(decompressPoint),
    color: compressed.c,
    width: compressed.w,
    timestamp: compressed.t,
  };
}

export function compressStrokes(strokes: Stroke[]): string {
  const compressed = strokes.map(compressStroke);
  return JSON.stringify(compressed);
}

export function decompressStrokes(compressed: string): Stroke[] {
  const parsed = JSON.parse(compressed) as CompressedStroke[];
  return parsed.map(decompressStroke);
}
