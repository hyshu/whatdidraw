import { Scene } from 'phaser';
import { Point, Stroke } from '../../../shared/types/api';

interface DrawingData {
  answer: string;
  hint?: string;
  strokes: Stroke[];
  totalStrokes: number;
}

interface PartialStroke {
  points: Point[];
  color: string;
  width: number;
}

export class Quiz extends Scene {
  private canvas!: Phaser.GameObjects.Graphics;
  private drawingData: DrawingData | null = null;
  private completedStrokes: Stroke[] = [];
  private currentStroke: PartialStroke | null = null;
  private currentStrokeIndex: number = 0;
  private currentPointIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackStartTime: number = 0;
  private pausedTime: number = 0;
  private guessStartTime: number = 0;
  private pointsPerFrame: number = 2;

  private canvasX!: number;
  private canvasY!: number;
  private canvasSize: number = 360;

  private backButton!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private playPauseButton!: Phaser.GameObjects.Text;
  private guessInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private inputContainer: HTMLDivElement | null = null;
  private scoreDisplay: HTMLDivElement | null = null;

  constructor() {
    super('Quiz');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    const savedDrawing = localStorage.getItem('currentQuiz');
    if (!savedDrawing) {
      alert('No quiz available. Please create a drawing first.');
      this.scene.start('MainMenu');
      return;
    }

    this.drawingData = JSON.parse(savedDrawing);
    this.guessStartTime = Date.now();

    this.createUI();
    this.createCanvas();
    this.createHTMLInput();

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

    const hintText = this.drawingData?.hint ? `Hint: ${this.drawingData.hint}` : '';
    this.hintText = this.add
      .text(width - 15, 25, hintText, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        align: 'right',
      })
      .setOrigin(1, 0);

    const canvasStartY = 70;
    this.canvasX = width / 2 - this.canvasSize / 2;
    this.canvasY = canvasStartY;

    this.canvas = this.add.graphics();
    this.canvas.fillStyle(0xffffff, 1);
    this.canvas.fillRect(this.canvasX, this.canvasY, this.canvasSize, this.canvasSize);

    const progressY = this.canvasY + this.canvasSize + 15;
    this.progressText = this.add
      .text(15, progressY, 'Progress: 0/' + this.drawingData!.totalStrokes + ' strokes', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0, 0);

    this.timeText = this.add
      .text(width - 15, progressY, 'Time: 00:00', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(1, 0);

    const buttonY = progressY + 35;
    this.playPauseButton = this.add
      .text(width / 2, buttonY, 'Play', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: { x: 30, y: 10 },
      })
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.playPauseButton.setStyle({ backgroundColor: '#2ecc71' }))
      .on('pointerout', () => this.playPauseButton.setStyle({ backgroundColor: this.isPlaying ? '#e67e22' : '#27ae60' }))
      .on('pointerdown', () => this.togglePlayPause());
  }

  private createCanvas() {
    this.canvas.clear();
    this.canvas.fillStyle(0xffffff, 1);
    this.canvas.fillRect(this.canvasX, this.canvasY, this.canvasSize, this.canvasSize);

    this.completedStrokes.forEach(stroke => {
      this.drawStroke(stroke);
    });

    if (this.currentStroke && this.currentStroke.points.length > 0) {
      this.drawPartialStroke(this.currentStroke);
    }
  }

  private createHTMLInput() {
    const { width } = this.scale;
    const inputY = this.canvasY + this.canvasSize + 85;

    this.inputContainer = document.createElement('div');
    this.inputContainer.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${inputY}px;
      transform: translateX(-50%);
      width: 90%;
      max-width: 400px;
      z-index: 100;
    `;

    const label = document.createElement('label');
    label.textContent = 'Your guess:';
    label.style.cssText = 'display: block; color: white; margin-bottom: 5px; font-family: Arial; font-size: 14px;';

    this.guessInput = document.createElement('input');
    this.guessInput.type = 'text';
    this.guessInput.maxLength = 50;
    this.guessInput.placeholder = 'Enter your answer...';
    this.guessInput.style.cssText = 'width: 100%; padding: 10px; font-size: 16px; border: 2px solid #ddd; border-radius: 5px; box-sizing: border-box; font-family: Arial;';

    this.submitButton = document.createElement('button');
    this.submitButton.textContent = 'Submit Guess';
    this.submitButton.style.cssText = 'width: 100%; padding: 12px; margin-top: 10px; background: #3498db; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold; font-family: Arial;';
    const submitButton = this.submitButton;
    this.submitButton.onmouseover = () => submitButton.style.background = '#5dade2';
    this.submitButton.onmouseout = () => submitButton.style.background = '#3498db';
    this.submitButton.onclick = () => this.handleGuessSubmit();

    this.inputContainer.appendChild(label);
    this.inputContainer.appendChild(this.guessInput);
    this.inputContainer.appendChild(this.submitButton);

    document.body.appendChild(this.inputContainer);
  }

  private drawStroke(stroke: Stroke | PartialStroke) {
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

  private drawPartialStroke(partialStroke: PartialStroke) {
    if (partialStroke.points.length === 0) return;

    const color = parseInt(partialStroke.color.replace('#', '0x'));
    const radius = partialStroke.width / 2;

    if (partialStroke.points.length === 1) {
      this.canvas.fillStyle(color);
      this.canvas.fillCircle(this.canvasX + partialStroke.points[0].x, this.canvasY + partialStroke.points[0].y, radius);
      return;
    }

    this.canvas.lineStyle(partialStroke.width, color);
    this.canvas.beginPath();
    this.canvas.moveTo(this.canvasX + partialStroke.points[0].x, this.canvasY + partialStroke.points[0].y);

    for (let i = 1; i < partialStroke.points.length; i++) {
      this.canvas.lineTo(this.canvasX + partialStroke.points[i].x, this.canvasY + partialStroke.points[i].y);
    }
    this.canvas.strokePath();

    this.canvas.fillStyle(color);
    for (let i = 0; i < partialStroke.points.length; i++) {
      this.canvas.fillCircle(this.canvasX + partialStroke.points[i].x, this.canvasY + partialStroke.points[i].y, radius);
    }
  }

  private togglePlayPause() {
    if (!this.drawingData) return;

    if (this.isPlaying) {
      this.isPlaying = false;
      this.pausedTime = Date.now() - this.playbackStartTime;
      this.playPauseButton.setText('Play');
      this.playPauseButton.setStyle({ backgroundColor: '#27ae60' });
    } else {
      if (this.currentStrokeIndex >= this.drawingData.strokes.length) {
        this.completedStrokes = [];
        this.currentStroke = null;
        this.currentStrokeIndex = 0;
        this.currentPointIndex = 0;
        this.pausedTime = 0;
        this.progressText.setText(`Progress: 0/${this.drawingData.totalStrokes} strokes`);
        this.createCanvas();
      }

      this.isPlaying = true;
      this.playbackStartTime = Date.now() - this.pausedTime;
      this.playPauseButton.setText('Pause');
      this.playPauseButton.setStyle({ backgroundColor: '#e67e22' });
    }
  }

  update() {
    if (!this.isPlaying || !this.drawingData) return;

    const elapsed = Date.now() - this.playbackStartTime;

    if (this.currentStrokeIndex >= this.drawingData.strokes.length) {
      this.isPlaying = false;
      this.playPauseButton.setText('Replay');
      this.playPauseButton.setStyle({ backgroundColor: '#27ae60' });
    } else {
      const stroke = this.drawingData.strokes[this.currentStrokeIndex];

      if (stroke.timestamp <= elapsed) {
        if (!this.currentStroke) {
          this.currentStroke = {
            points: [],
            color: stroke.color,
            width: stroke.width,
          };
          this.currentPointIndex = 0;
        }

        const pointsToAdd = Math.min(this.pointsPerFrame, stroke.points.length - this.currentPointIndex);
        for (let i = 0; i < pointsToAdd; i++) {
          this.currentStroke.points.push(stroke.points[this.currentPointIndex]);
          this.currentPointIndex++;
        }

        if (this.currentPointIndex >= stroke.points.length) {
          this.completedStrokes.push({
            points: this.currentStroke.points,
            color: this.currentStroke.color,
            width: this.currentStroke.width,
            timestamp: stroke.timestamp,
          });
          this.currentStroke = null;
          this.currentStrokeIndex++;
          this.progressText.setText(`Progress: ${this.currentStrokeIndex}/${this.drawingData.totalStrokes} strokes`);
        }

        this.createCanvas();
      }
    }

    const guessElapsed = Math.floor((Date.now() - this.guessStartTime) / 1000);
    const minutes = Math.floor(guessElapsed / 60);
    const seconds = guessElapsed % 60;
    this.timeText.setText(`Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }

  private handleGuessSubmit() {
    if (!this.drawingData || !this.guessInput) return;

    const guess = this.guessInput.value.trim().toLowerCase();
    const answer = this.drawingData.answer.toLowerCase();
    const correct = guess === answer;

    const elapsedSeconds = (Date.now() - this.guessStartTime) / 1000;
    const totalStrokes = this.drawingData.totalStrokes;

    // Calculate viewed strokes with partial stroke progress
    let viewedStrokes = this.completedStrokes.length;
    if (this.currentStroke && this.currentStrokeIndex < this.drawingData.strokes.length) {
      const currentStrokeData = this.drawingData.strokes[this.currentStrokeIndex];
      const totalPoints = currentStrokeData.points.length;
      const drawnPoints = this.currentPointIndex;
      const progress = drawnPoints / totalPoints;
      viewedStrokes += progress;
    }

    const baseScore = Math.max(0, (totalStrokes - viewedStrokes) * 100);
    const timeBonus = Math.max(0, (60 - elapsedSeconds) * 10);
    const totalScore = correct ? baseScore + timeBonus : 0;

    if (this.isPlaying) {
      this.togglePlayPause();
    }

    this.showScoreDisplay(correct, totalScore, baseScore, timeBonus, viewedStrokes, elapsedSeconds);
  }

  private showScoreDisplay(correct: boolean, totalScore: number, baseScore: number, timeBonus: number, viewedStrokes: number, elapsedSeconds: number) {
    if (this.inputContainer) {
      this.inputContainer.remove();
    }

    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.cssText = `
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
      font-family: Arial;
    `;

    const title = document.createElement('h2');
    title.textContent = correct ? 'Correct!' : 'Incorrect';
    title.style.cssText = `margin: 0 0 20px 0; color: ${correct ? '#27ae60' : '#e74c3c'}; font-size: 28px; text-align: center;`;

    const answerDiv = document.createElement('div');
    answerDiv.textContent = `Answer: ${this.drawingData!.answer}`;
    answerDiv.style.cssText = 'margin-bottom: 20px; font-size: 18px; color: #333; text-align: center; font-weight: bold;';

    if (correct) {
      const unseenStrokes = this.drawingData!.totalStrokes - viewedStrokes;
      const scoreBreakdown = document.createElement('div');
      scoreBreakdown.style.cssText = 'margin-bottom: 20px; color: #555; line-height: 1.6;';
      scoreBreakdown.innerHTML = `
        <div style="font-size: 14px; margin-bottom: 10px;">
          <div>Base Score: <strong>${baseScore.toFixed(2)}</strong> points</div>
          <div style="font-size: 12px; color: #888; margin-left: 10px;">(${unseenStrokes.toFixed(2)} unseen strokes × 100)</div>
          <div style="margin-top: 5px;">Time Bonus: <strong>${timeBonus.toFixed(2)}</strong> points</div>
          <div style="font-size: 12px; color: #888; margin-left: 10px;">(${Math.max(0, 60 - elapsedSeconds).toFixed(2)} seconds under 60s × 10)</div>
        </div>
        <div style="font-size: 20px; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
          Total Score: <strong style="color: #27ae60;">${totalScore.toFixed(2)}</strong> points
        </div>
      `;
      this.scoreDisplay.appendChild(scoreBreakdown);
    }

    const menuButton = document.createElement('button');
    menuButton.textContent = 'Main Menu';
    menuButton.style.cssText = 'width: 100%; padding: 12px; background: #3498db; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; font-weight: bold;';
    menuButton.onmouseover = () => menuButton.style.background = '#5dade2';
    menuButton.onmouseout = () => menuButton.style.background = '#3498db';
    menuButton.onclick = () => {
      this.cleanup();
      this.scene.start('MainMenu');
    };

    this.scoreDisplay.appendChild(title);
    this.scoreDisplay.appendChild(answerDiv);
    this.scoreDisplay.appendChild(menuButton);

    document.body.appendChild(this.scoreDisplay);

    const backdrop = document.createElement('div');
    backdrop.id = 'score-backdrop';
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
  }

  private handleBack() {
    const confirmed = confirm('Are you sure you want to leave the quiz?');
    if (!confirmed) return;

    this.cleanup();
    this.scene.start('MainMenu');
  }

  private handleResize() {
    const { width } = this.scale;
    this.cameras.resize(width, this.scale.height);

    this.hintText.setPosition(width - 15, 25);
    this.canvasX = width / 2 - this.canvasSize / 2;
    this.createCanvas();

    const progressY = this.canvasY + this.canvasSize + 15;
    this.progressText.setPosition(15, progressY);
    this.timeText.setPosition(width - 15, progressY);
    this.playPauseButton.setPosition(width / 2, progressY + 35);

    if (this.inputContainer) {
      const inputY = this.canvasY + this.canvasSize + 85;
      this.inputContainer.style.top = `${inputY}px`;
    }
  }

  private cleanup() {
    if (this.inputContainer) {
      this.inputContainer.remove();
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.remove();
    }
    const backdrop = document.getElementById('score-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}
