import { Scene } from 'phaser';
import * as Phaser from 'phaser';
import { GetLeaderboardResponse } from '../../../shared/types/api';

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  titleText: Phaser.GameObjects.Text;
  scoreText: Phaser.GameObjects.Text;
  leaderboardTitle: Phaser.GameObjects.Text;
  leaderboardEntries: Phaser.GameObjects.Text[] = [];
  menuButton: Phaser.GameObjects.Text;
  playAgainButton: Phaser.GameObjects.Text;
  score: number = 0;
  fromMenu: boolean = false;

  constructor() {
    super('GameOver');
  }

  init(data: { score?: number; fromMenu?: boolean }) {
    this.score = data.score || 0;
    this.fromMenu = data.fromMenu || false;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x2c3e50);
    this.background = this.add.image(0, 0, 'background').setOrigin(0).setAlpha(0.3);

    const titleStr = this.fromMenu ? 'Leaderboard' : 'Quiz Complete!';
    this.titleText = this.add
      .text(0, 0, titleStr, {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5);

    if (!this.fromMenu && this.score > 0) {
      this.scoreText = this.add
        .text(0, 0, `Your Score: ${this.score}`, {
          fontFamily: 'Arial Black',
          fontSize: '36px',
          color: '#f39c12',
          stroke: '#000000',
          strokeThickness: 4,
          align: 'center',
        })
        .setOrigin(0.5);
    }

    this.leaderboardTitle = this.add
      .text(0, 0, 'Top Scores', {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ecf0f1',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      })
      .setOrigin(0.5);

    this.loadLeaderboard();

    if (!this.fromMenu) {
      this.playAgainButton = this.add
        .text(0, 0, 'Play Again', {
          fontFamily: 'Arial Black',
          fontSize: '28px',
          color: '#ffffff',
          backgroundColor: '#27ae60',
          padding: {
            x: 25,
            y: 12,
          } as Phaser.Types.GameObjects.Text.TextPadding,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.playAgainButton.setStyle({ backgroundColor: '#2ecc71' }))
        .on('pointerout', () => this.playAgainButton.setStyle({ backgroundColor: '#27ae60' }))
        .on('pointerdown', () => {
          this.scene.start('Game');
        });
    }

    this.menuButton = this.add
      .text(0, 0, 'Main Menu', {
        fontFamily: 'Arial Black',
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#3498db',
        padding: {
          x: 25,
          y: 12,
        } as Phaser.Types.GameObjects.Text.TextPadding,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.menuButton.setStyle({ backgroundColor: '#5dade2' }))
      .on('pointerout', () => this.menuButton.setStyle({ backgroundColor: '#3498db' }))
      .on('pointerdown', () => {
        this.scene.start('MainMenu');
      });

    this.updateLayout(this.scale.width, this.scale.height);
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      const { width, height } = gameSize;
      this.updateLayout(width, height);
    });
  }

  async loadLeaderboard() {
    try {
      const response = await fetch('/api/leaderboard');
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = (await response.json()) as GetLeaderboardResponse;

      this.leaderboardEntries.forEach(entry => entry.destroy());
      this.leaderboardEntries = [];

      const scores = data.scores.slice(0, 5);

      if (scores.length === 0) {
        const noScoresText = this.add
          .text(this.scale.width / 2, this.scale.height * 0.4, 'No scores yet!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#95a5a6',
            align: 'center',
          })
          .setOrigin(0.5);
        this.leaderboardEntries.push(noScoresText);
      } else {
        scores.forEach((score, index) => {
          const yPos = this.scale.height * 0.35 + (index * 40);
          const entryText = this.add
            .text(
              this.scale.width / 2,
              yPos,
              `${index + 1}. ${score.username}: ${score.score}`,
              {
                fontFamily: 'Arial',
                fontSize: '22px',
                color: '#ecf0f1',
                align: 'center',
              }
            )
            .setOrigin(0.5);
          this.leaderboardEntries.push(entryText);
        });
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);

      const errorText = this.add
        .text(this.scale.width / 2, this.scale.height * 0.4, 'Failed to load leaderboard', {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#e74c3c',
          align: 'center',
        })
        .setOrigin(0.5);
      this.leaderboardEntries.push(errorText);
    }
  }

  private updateLayout(width: number, height: number): void {
    this.cameras.resize(width, height);

    if (this.background) {
      this.background.setDisplaySize(width, height);
    }

    const scaleFactor = Math.min(Math.min(width / 1024, height / 768), 1);
    const centerX = width / 2;

    if (this.titleText) {
      this.titleText.setPosition(centerX, height * 0.1);
      this.titleText.setScale(scaleFactor);
    }

    if (this.scoreText) {
      this.scoreText.setPosition(centerX, height * 0.18);
      this.scoreText.setScale(scaleFactor);
    }

    if (this.leaderboardTitle) {
      const yPos = this.fromMenu ? height * 0.2 : height * 0.26;
      this.leaderboardTitle.setPosition(centerX, yPos);
      this.leaderboardTitle.setScale(scaleFactor);
    }

    const startY = this.fromMenu ? 0.3 : 0.35;
    this.leaderboardEntries.forEach((entry, index) => {
      entry.setPosition(centerX, height * startY + (index * 40 * scaleFactor));
      entry.setScale(scaleFactor);
    });

    const buttonY = this.fromMenu ? 0.7 : 0.65;

    if (this.playAgainButton) {
      this.playAgainButton.setPosition(centerX, height * buttonY);
      this.playAgainButton.setScale(scaleFactor);
    }

    if (this.menuButton) {
      const menuY = this.fromMenu ? buttonY : buttonY + 0.08;
      this.menuButton.setPosition(centerX, height * menuY);
      this.menuButton.setScale(scaleFactor);
    }
  }
}