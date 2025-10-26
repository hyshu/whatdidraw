import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { InitResponse, GetDrawingResponse, SubmitGuessResponse } from '../../../shared/types/api';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  titleText: Phaser.GameObjects.Text;
  statusText: Phaser.GameObjects.Text;
  guessInput: HTMLInputElement;
  guessButton: Phaser.GameObjects.Text;
  hintText: Phaser.GameObjects.Text;
  drawingArea: Phaser.GameObjects.Rectangle;
  currentDrawing: any;

  constructor() {
    super('Game');
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x2c3e50);
    this.background = this.add.image(512, 384, 'background').setAlpha(0.25);
    this.titleText = this.add
      .text(512, 50, 'What Did I Draw?', {
        fontFamily: 'Arial Black',
        fontSize: 42,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.drawingArea = this.add.rectangle(512, 300, 600, 400, 0x34495e, 1);
    this.drawingArea.setStrokeStyle(3, 0xffffff);

    const placeholderText = this.add
      .text(512, 300, 'Drawing will appear here', {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#7f8c8d',
      })
      .setOrigin(0.5);

    this.hintText = this.add
      .text(512, 520, 'Hint: Loading...', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#f39c12',
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(512, 560, 'Loading drawing...', {
        fontFamily: 'Arial',
        fontSize: 18,
        color: '#95a5a6',
      })
      .setOrigin(0.5);

    this.createGuessInput();

    this.guessButton = this.add
      .text(512, 650, 'Submit Guess', {
        fontFamily: 'Arial Black',
        fontSize: 28,
        color: '#ffffff',
        backgroundColor: '#27ae60',
        padding: {
          x: 20,
          y: 10,
        } as Phaser.Types.GameObjects.Text.TextPadding,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.guessButton.setStyle({ backgroundColor: '#2ecc71' }))
      .on('pointerout', () => this.guessButton.setStyle({ backgroundColor: '#27ae60' }))
      .on('pointerdown', () => this.submitGuess());

    const menuButton = this.add
      .text(512, 720, 'Back to Menu', {
        fontFamily: 'Arial',
        fontSize: 20,
        color: '#ecf0f1',
        backgroundColor: '#7f8c8d',
        padding: {
          x: 15,
          y: 8,
        } as Phaser.Types.GameObjects.Text.TextPadding,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => menuButton.setStyle({ backgroundColor: '#95a5a6' }))
      .on('pointerout', () => menuButton.setStyle({ backgroundColor: '#7f8c8d' }))
      .on('pointerdown', () => this.scene.start('MainMenu'));

    this.initializeGame();
    this.updateLayout(this.scale.width, this.scale.height);
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.updateLayout(width, height);
    });
  }

  createGuessInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your guess...';
    input.style.position = 'absolute';
    input.style.left = '50%';
    input.style.top = '600px';
    input.style.transform = 'translateX(-50%)';
    input.style.width = '300px';
    input.style.padding = '10px';
    input.style.fontSize = '18px';
    input.style.borderRadius = '5px';
    input.style.border = '2px solid #34495e';
    input.id = 'guess-input';

    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(input);
    }

    this.guessInput = input;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitGuess();
      }
    });
  }

  async initializeGame() {
    try {
      const response = await fetch('/api/init');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = (await response.json()) as InitResponse;
      await this.loadDrawing();
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.statusText.setText('Failed to load game. Please refresh.');
    }
  }

  async loadDrawing() {
    try {
      const response = await fetch('/api/drawing');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = (await response.json()) as GetDrawingResponse;
      this.currentDrawing = data.drawing;

      if (data.drawing) {
        this.hintText.setText(`Hint: ${data.drawing.hint || 'No hint available'}`);
        this.statusText.setText('Make your guess!');
      }
    } catch (error) {
      console.error('Failed to load drawing:', error);
      this.statusText.setText('Failed to load drawing.');
    }
  }

  async submitGuess() {
    if (!this.guessInput || !this.guessInput.value.trim()) {
      this.statusText.setText('Please enter a guess!');
      return;
    }

    const guess = this.guessInput.value.trim();

    try {
      const response = await fetch('/api/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess: guess,
          drawingId: this.currentDrawing?.id || 'unknown',
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = (await response.json()) as SubmitGuessResponse;

      if (data.correct) {
        this.statusText.setText(`Correct! The answer was "${data.answer}". Score: ${data.score}`);
        this.statusText.setColor('#27ae60');

        this.guessInput.disabled = true;
        this.guessButton.setAlpha(0.5);
        this.guessButton.removeInteractive();

        this.time.delayedCall(2000, () => {
          this.scene.start('GameOver', { score: data.score });
        });
      } else {
        this.statusText.setText(`Incorrect! The answer was "${data.answer}". Try another drawing!`);
        this.statusText.setColor('#e74c3c');

        this.time.delayedCall(2000, () => {
          this.guessInput.value = '';
          this.statusText.setColor('#95a5a6');
          this.loadDrawing();
        });
      }
    } catch (error) {
      console.error('Failed to submit guess:', error);
      this.statusText.setText('Failed to submit guess. Please try again.');
    }
  }

  updateLayout(width: number, height: number) {
    this.cameras.resize(width, height);

    if (this.background) {
      this.background.setPosition(width / 2, height / 2);
      if (this.background.width && this.background.height) {
        const scale = Math.max(width / this.background.width, height / this.background.height);
        this.background.setScale(scale);
      }
    }

    const centerX = width / 2;

    if (this.titleText) {
      this.titleText.setPosition(centerX, 50);
    }

    if (this.drawingArea) {
      this.drawingArea.setPosition(centerX, 300);
    }

    if (this.hintText) {
      this.hintText.setPosition(centerX, 520);
    }

    if (this.statusText) {
      this.statusText.setPosition(centerX, 560);
    }

    if (this.guessButton) {
      this.guessButton.setPosition(centerX, 650);
    }

    if (this.guessInput) {
      this.guessInput.style.top = '600px';
    }
  }

  destroy() {
    if (this.guessInput) {
      this.guessInput.remove();
    }
    super.destroy();
  }
}