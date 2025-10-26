import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;
  logo: GameObjects.Image | null = null;
  title: GameObjects.Text | null = null;
  playButton: GameObjects.Text | null = null;
  drawButton: GameObjects.Text | null = null;
  leaderboardButton: GameObjects.Text | null = null;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.background = null;
    this.logo = null;
    this.title = null;
    this.playButton = null;
    this.drawButton = null;
    this.leaderboardButton = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x2c3e50);
    this.refreshLayout();
    this.scale.on('resize', () => this.refreshLayout());
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    this.cameras.resize(width, height);

    if (!this.background) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0).setAlpha(0.3);
    }
    this.background!.setDisplaySize(width, height);

    const scaleFactor = Math.min(width / 1024, height / 768, 1);

    if (!this.logo) {
      this.logo = this.add.image(0, 0, 'logo');
    }
    this.logo!.setPosition(width / 2, height * 0.25).setScale(scaleFactor * 0.8);

    if (!this.title) {
      this.title = this.add
        .text(0, 0, 'What Did I Draw?', {
          fontFamily: 'Arial Black',
          fontSize: '48px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 8,
          align: 'center',
        })
        .setOrigin(0.5);
    }
    this.title!.setPosition(width / 2, height * 0.4);
    this.title!.setScale(scaleFactor);

    if (!this.playButton) {
      this.playButton = this.add
        .text(0, 0, 'Play Quiz', {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#ffffff',
          backgroundColor: '#27ae60',
          padding: {
            x: 30,
            y: 15,
          } as Phaser.Types.GameObjects.Text.TextPadding,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.playButton!.setStyle({ backgroundColor: '#2ecc71' }))
        .on('pointerout', () => this.playButton!.setStyle({ backgroundColor: '#27ae60' }))
        .on('pointerdown', () => {
          this.scene.start('Game');
        });
    }
    this.playButton!.setPosition(width / 2, height * 0.55);
    this.playButton!.setScale(scaleFactor);

    if (!this.drawButton) {
      this.drawButton = this.add
        .text(0, 0, 'Create Drawing', {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#ffffff',
          backgroundColor: '#3498db',
          padding: {
            x: 30,
            y: 15,
          } as Phaser.Types.GameObjects.Text.TextPadding,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.drawButton!.setStyle({ backgroundColor: '#5dade2' }))
        .on('pointerout', () => this.drawButton!.setStyle({ backgroundColor: '#3498db' }))
        .on('pointerdown', () => {
          console.log('Drawing mode not yet implemented');
        });
    }
    this.drawButton!.setPosition(width / 2, height * 0.65);
    this.drawButton!.setScale(scaleFactor);

    if (!this.leaderboardButton) {
      this.leaderboardButton = this.add
        .text(0, 0, 'Leaderboard', {
          fontFamily: 'Arial Black',
          fontSize: '32px',
          color: '#ffffff',
          backgroundColor: '#9b59b6',
          padding: {
            x: 30,
            y: 15,
          } as Phaser.Types.GameObjects.Text.TextPadding,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.leaderboardButton!.setStyle({ backgroundColor: '#a569bd' }))
        .on('pointerout', () => this.leaderboardButton!.setStyle({ backgroundColor: '#9b59b6' }))
        .on('pointerdown', () => {
          this.scene.start('GameOver', { fromMenu: true });
        });
    }
    this.leaderboardButton!.setPosition(width / 2, height * 0.75);
    this.leaderboardButton!.setScale(scaleFactor);
  }
}