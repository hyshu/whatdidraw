import { Scene } from 'phaser';
import { Point, Stroke, Drawing as DrawingData, SaveDrawingResponse } from '../../../shared/types/api';
import {
  validateStrokeCount,
  validateAnswer,
  validateHint,
  sanitizeText,
} from '../../../shared/utils/validation';
import { post, ApiError } from '../../utils/api';
import { showLoading, hideLoading } from '../../utils/loading';

export class Drawing extends Scene {
  private canvas!: Phaser.GameObjects.Graphics;
  private strokes: Stroke[] = [];
  private currentStroke: Point[] = [];
  private currentColor: string = '#000000';
  private currentWidth: number = 3;
  private isDrawing: boolean = false;
  private drawingStartTime: number = 0;

  private backButton!: Phaser.GameObjects.Text;
  private strokeCountText!: Phaser.GameObjects.Text;
  private finishButton!: Phaser.GameObjects.Text;
  private undoButton!: Phaser.GameObjects.Text;

  private colorButtons: Phaser.GameObjects.Rectangle[] = [];
  private sizeButtons: Phaser.GameObjects.Text[] = [];

  private colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'Red', hex: '#ff0000' },
    { name: 'Green', hex: '#00ff00' },
    { name: 'Blue', hex: '#0000ff' },
    { name: 'Yellow', hex: '#ffff00' },
    { name: 'Magenta', hex: '#ff00ff' },
    { name: 'Cyan', hex: '#00ffff' },
    { name: 'White', hex: '#ffffff' },
  ];

  private sizes = [1, 3, 5, 8, 12];

  private canvasX!: number;
  private canvasY!: number;
  private canvasSize: number = 360;

  private inputModal: HTMLDivElement | null = null;

  constructor() {
    super('Drawing');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);
    this.drawingStartTime = Date.now();

    this.createUI();
    this.createCanvas();
    this.setupInput();

    this.scale.on('resize', () => this.handleResize());
  }

  private createUI() {
    const { width, height } = this.scale;

    this.backButton = this.add
      .text(15, 15, '← Back', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#7f5a9f',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.backButton.setStyle({ backgroundColor: '#9370ba' }))
      .on('pointerout', () => this.backButton.setStyle({ backgroundColor: '#7f5a9f' }))
      .on('pointerdown', () => this.handleBack());

    this.strokeCountText = this.add
      .text(width / 2, 25, 'Strokes: 0', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0);

    this.finishButton = this.add
      .text(width - 15, 15, 'Finish', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: { x: 15, y: 8 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.finishButton.setStyle({ backgroundColor: '#2ecc71' }))
      .on('pointerout', () => this.finishButton.setStyle({ backgroundColor: '#27ae60' }))
      .on('pointerdown', () => this.handleFinish());

    const toolsStartY = 70;
    this.canvasX = width / 2 - this.canvasSize / 2;
    this.canvasY = toolsStartY;

    this.canvas = this.add.graphics();
    this.canvas.fillStyle(0xffffff, 1);
    this.canvas.fillRect(this.canvasX, this.canvasY, this.canvasSize, this.canvasSize);

    const undoY = this.canvasY + this.canvasSize + 10;
    this.undoButton = this.add
      .text(width - 15, undoY, 'Undo', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#e74c3c',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.undoButton.setStyle({ backgroundColor: '#ec7063' }))
      .on('pointerout', () => this.undoButton.setStyle({ backgroundColor: '#e74c3c' }))
      .on('pointerdown', () => this.handleUndo());

    const colorsY = undoY + 40;
    this.add.text(15, colorsY, 'Colors:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    });

    this.colorButtons = [];
    const colorStartX = 80;
    this.colors.forEach((color, index) => {
      const x = colorStartX + index * 45;
      const rect = this.add.rectangle(x, colorsY + 15, 35, 35, parseInt(color.hex.replace('#', '0x')))
        .setStrokeStyle(3, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectColor(color.hex, index));

      this.colorButtons.push(rect);
    });
    this.colorButtons[0].setStrokeStyle(3, 0xffd700);

    const sizesY = colorsY + 50;
    this.add.text(15, sizesY, 'Size:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    });

    this.sizeButtons = [];
    const sizeStartX = 70;
    this.sizes.forEach((size, index) => {
      const x = sizeStartX + index * 60;
      const button = this.add
        .text(x, sizesY + 15, `${size}px`, {
          fontFamily: 'Arial',
          fontSize: '16px',
          color: '#ffffff',
          backgroundColor: index === 1 ? '#3498db' : '#7f8c8d',
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectSize(size, index));

      this.sizeButtons.push(button);
    });
  }

  private createCanvas() {
    this.canvas.clear();
    this.canvas.fillStyle(0xffffff, 1);
    this.canvas.fillRect(this.canvasX, this.canvasY, this.canvasSize, this.canvasSize);

    this.strokes.forEach(stroke => {
      this.drawStroke(stroke);
    });
  }

  private setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isWithinCanvas(pointer.x, pointer.y)) {
        this.isDrawing = true;
        this.currentStroke = [{ x: pointer.x - this.canvasX, y: pointer.y - this.canvasY }];
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDrawing && this.isWithinCanvas(pointer.x, pointer.y)) {
        const point = { x: pointer.x - this.canvasX, y: pointer.y - this.canvasY };
        this.currentStroke.push(point);
        this.drawCurrentStroke();
      }
    });

    this.input.on('pointerup', () => {
      if (this.isDrawing && this.currentStroke.length > 0) {
        const stroke: Stroke = {
          points: [...this.currentStroke],
          color: this.currentColor,
          width: this.currentWidth,
          timestamp: Date.now() - this.drawingStartTime,
        };
        this.strokes.push(stroke);
        this.currentStroke = [];
        this.createCanvas();
        this.updateStrokeCount();
      }
      this.isDrawing = false;
    });
  }

  private isWithinCanvas(x: number, y: number): boolean {
    return x >= this.canvasX && x <= this.canvasX + this.canvasSize &&
           y >= this.canvasY && y <= this.canvasY + this.canvasSize;
  }

  private drawCurrentStroke() {
    if (this.currentStroke.length === 0) return;

    const color = parseInt(this.currentColor.replace('#', '0x'));
    const radius = this.currentWidth / 2;

    if (this.currentStroke.length === 1) {
      const point = this.currentStroke[0];
      this.canvas.fillStyle(color);
      this.canvas.fillCircle(this.canvasX + point.x, this.canvasY + point.y, radius);
      return;
    }

    const lastPoint = this.currentStroke[this.currentStroke.length - 2];
    const currentPoint = this.currentStroke[this.currentStroke.length - 1];

    this.canvas.lineStyle(this.currentWidth, color);
    this.canvas.beginPath();
    this.canvas.moveTo(this.canvasX + lastPoint.x, this.canvasY + lastPoint.y);
    this.canvas.lineTo(this.canvasX + currentPoint.x, this.canvasY + currentPoint.y);
    this.canvas.strokePath();

    this.canvas.fillStyle(color);
    this.canvas.fillCircle(this.canvasX + currentPoint.x, this.canvasY + currentPoint.y, radius);
  }

  private drawStroke(stroke: Stroke) {
    if (stroke.points.length === 0) return;

    const color = parseInt(stroke.color.replace('#', '0x'));
    const radius = stroke.width / 2;

    if (stroke.points.length === 1) {
      this.canvas.fillStyle(color);
      this.canvas.fillCircle(this.canvasX + stroke.points[0].x, this.canvasY + stroke.points[0].y, radius);
      return;
    }

    this.canvas.lineStyle(stroke.width, color);
    this.canvas.beginPath();
    this.canvas.moveTo(this.canvasX + stroke.points[0].x, this.canvasY + stroke.points[0].y);

    for (let i = 1; i < stroke.points.length; i++) {
      this.canvas.lineTo(this.canvasX + stroke.points[i].x, this.canvasY + stroke.points[i].y);
    }
    this.canvas.strokePath();

    this.canvas.fillStyle(color);
    for (let i = 0; i < stroke.points.length; i++) {
      this.canvas.fillCircle(this.canvasX + stroke.points[i].x, this.canvasY + stroke.points[i].y, radius);
    }
  }

  private selectColor(color: string, index: number) {
    this.currentColor = color;
    this.colorButtons.forEach((btn, i) => {
      btn.setStrokeStyle(3, i === index ? 0xffd700 : 0xffffff);
    });
  }

  private selectSize(size: number, index: number) {
    this.currentWidth = size;
    this.sizeButtons.forEach((btn, i) => {
      btn.setStyle({ backgroundColor: i === index ? '#3498db' : '#7f8c8d' });
    });
  }

  private handleUndo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.createCanvas();
      this.updateStrokeCount();
    }
  }

  private updateStrokeCount() {
    this.strokeCountText.setText(`Strokes: ${this.strokes.length}`);
  }

  private handleBack() {
    this.cleanup();
    this.scene.start('MainMenu');
  }

  private handleFinish() {
    if (this.strokes.length === 0) {
      alert('Please draw at least 1 stroke before finishing.');
      return;
    }

    this.showInputModal();
  }

  private showInputModal() {
    this.inputModal = document.createElement('div');
    this.inputModal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 400px;
      width: 90%;
    `;

    const title = document.createElement('h2');
    title.textContent = 'Complete Your Drawing';
    title.style.cssText = 'margin: 0 0 20px 0; color: #333; font-size: 24px;';

    const answerLabel = document.createElement('label');
    answerLabel.textContent = 'Answer (1-50 characters, required):';
    answerLabel.style.cssText = 'display: block; margin-bottom: 5px; color: #555; font-size: 14px;';

    const answerInput = document.createElement('input');
    answerInput.type = 'text';
    answerInput.maxLength = 50;
    answerInput.required = true;
    answerInput.style.cssText = 'width: 100%; padding: 10px; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;';

    const answerCounter = document.createElement('div');
    answerCounter.textContent = '0/50 characters';
    answerCounter.style.cssText = 'margin-bottom: 15px; color: #888; font-size: 12px; text-align: right;';

    const hintLabel = document.createElement('label');
    hintLabel.textContent = 'Hint (0-100 characters, optional):';
    hintLabel.style.cssText = 'display: block; margin-bottom: 5px; color: #555; font-size: 14px;';

    const hintInput = document.createElement('input');
    hintInput.type = 'text';
    hintInput.maxLength = 100;
    hintInput.style.cssText = 'width: 100%; padding: 10px; margin-bottom: 5px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;';

    const hintCounter = document.createElement('div');
    hintCounter.textContent = '0/100 characters';
    hintCounter.style.cssText = 'margin-bottom: 15px; color: #888; font-size: 12px; text-align: right;';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px;';

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.style.cssText = 'flex: 1; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;';
    submitButton.onmouseover = () => submitButton.style.background = '#2ecc71';
    submitButton.onmouseout = () => submitButton.style.background = '#27ae60';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = 'flex: 1; padding: 12px; background: #e74c3c; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;';
    cancelButton.onmouseover = () => cancelButton.style.background = '#ec7063';
    cancelButton.onmouseout = () => cancelButton.style.background = '#e74c3c';

    answerInput.addEventListener('input', () => {
      const charCount = Array.from(answerInput.value).length;
      answerCounter.textContent = `${charCount}/50 characters`;
    });

    hintInput.addEventListener('input', () => {
      const charCount = Array.from(hintInput.value).length;
      hintCounter.textContent = `${charCount}/100 characters`;
    });

    submitButton.addEventListener('click', () => {
      const answer = answerInput.value.trim();
      const answerCharCount = Array.from(answer).length;
      if (answerCharCount === 0) {
        alert('Answer is required and must be at least 1 character.');
        return;
      }
      if (answerCharCount > 50) {
        alert('Answer must be 50 characters or less.');
        return;
      }

      const hint = hintInput.value.trim();
      const hintCharCount = Array.from(hint).length;
      if (hintCharCount > 100) {
        alert('Hint must be 100 characters or less.');
        return;
      }

      this.saveDrawing(answer, hint);
    });

    cancelButton.addEventListener('click', () => {
      this.hideInputModal();
    });

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(submitButton);

    this.inputModal.appendChild(title);
    this.inputModal.appendChild(answerLabel);
    this.inputModal.appendChild(answerInput);
    this.inputModal.appendChild(answerCounter);
    this.inputModal.appendChild(hintLabel);
    this.inputModal.appendChild(hintInput);
    this.inputModal.appendChild(hintCounter);
    this.inputModal.appendChild(buttonContainer);

    document.body.appendChild(this.inputModal);

    const backdrop = document.createElement('div');
    backdrop.id = 'modal-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      z-index: 999;
    `;
    document.body.appendChild(backdrop);

    answerInput.focus();
  }

  private hideInputModal() {
    if (this.inputModal) {
      this.inputModal.remove();
      this.inputModal = null;
    }
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  private async saveDrawing(answer: string, hint: string) {
    const sanitizedAnswer = sanitizeText(answer);
    const sanitizedHint = sanitizeText(hint);

    const strokeCountValidation = validateStrokeCount(this.strokes.length);
    if (!strokeCountValidation.isValid) {
      alert(strokeCountValidation.errors.join('\n'));
      return;
    }

    const answerValidation = validateAnswer(sanitizedAnswer);
    if (!answerValidation.isValid) {
      alert(answerValidation.errors.join('\n'));
      return;
    }

    if (sanitizedHint.length > 0) {
      const hintValidation = validateHint(sanitizedHint);
      if (!hintValidation.isValid) {
        alert(hintValidation.errors.join('\n'));
        return;
      }
    }

    const drawingData = {
      answer: sanitizedAnswer,
      hint: sanitizedHint || undefined,
      strokes: this.strokes,
      totalStrokes: this.strokes.length,
      createdBy: 'player',
      createdAt: Date.now(),
    };

    showLoading('Saving drawing...');

    try {
      const result = await post<SaveDrawingResponse>('/api/drawing', {
        drawing: drawingData,
      });

      hideLoading();

      this.hideInputModal();
      this.cleanup();
      this.scene.start('MainMenu');
    } catch (error) {
      hideLoading();
      console.error('Error saving drawing:', error);
      if (error instanceof ApiError) {
        alert(error.message);
      } else {
        alert('Failed to save drawing. Please try again.');
      }
    }
  }

  private handleResize() {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);

    this.strokeCountText.setPosition(width / 2, 25);
    this.finishButton.setPosition(width - 15, 15);

    this.canvasX = width / 2 - this.canvasSize / 2;
    this.createCanvas();

    this.undoButton.setPosition(width - 15, this.canvasY + this.canvasSize + 10);
  }

  private cleanup() {
    this.hideInputModal();
    this.strokes = [];
    this.currentStroke = [];
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}
