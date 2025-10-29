import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  titleLine1: GameObjects.Text | null = null;
  titleLine2: GameObjects.Text | null = null;
  questionMark: GameObjects.Text | null = null;
  playButton: GameObjects.Text | null = null;
  drawButton: GameObjects.Text | null = null;
  leaderboardButton: GameObjects.Text | null = null;
  myHistoryButton: GameObjects.Text | null = null;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.titleLine1 = null;
    this.titleLine2 = null;
    this.questionMark = null;
    this.playButton = null;
    this.drawButton = null;
    this.leaderboardButton = null;
    this.myHistoryButton = null;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);
    this.refreshLayout();
    this.scale.on('resize', () => this.refreshLayout());
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    this.cameras.resize(width, height);

    const scaleFactor = Math.min(width / 1024, height / 768, 1);

    if (!this.titleLine1) {
      this.titleLine1 = this.add
        .text(0, 0, 'What', {
          fontFamily: 'Arial Black',
          fontSize: '200px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 10,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0);
    }

    if (!this.titleLine2) {
      this.titleLine2 = this.add
        .text(0, 0, 'Did I Draw', {
          fontFamily: 'Arial Black',
          fontSize: '100px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 10,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0);
    }

    if (!this.questionMark) {
      this.questionMark = this.add
        .text(0, 0, '?', {
          fontFamily: 'Arial Black',
          fontSize: '120px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 10,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setAngle(0);
    }

    const line1Y = height * 0.23;
    const line1Height = this.titleLine1!.height * scaleFactor;
    const line2Height = this.titleLine2!.height * scaleFactor;
    const verticalSpacing = -20 * scaleFactor;
    const line2Y = line1Y + line1Height / 2 + line2Height / 2 + verticalSpacing;

    this.titleLine1!.setPosition(width / 2, line1Y);

    const spacing = 10 * scaleFactor;
    const line2Width = this.titleLine2!.width * scaleFactor;
    const questionMarkWidth = this.questionMark!.width * scaleFactor;
    const totalLine2Width = line2Width + spacing + questionMarkWidth;
    const line2Offset = (totalLine2Width - line2Width) / 2;

    const line2X = width / 2 - line2Offset;
    const questionMarkX = line2X + line2Width / 2 + spacing + questionMarkWidth / 2;

    this.titleLine2!.setPosition(line2X, line2Y);
    this.questionMark!.setPosition(questionMarkX, line2Y);

    if (this.titleLine1!.alpha === 0) {
      this.tweens.add({
        targets: this.titleLine1,
        alpha: 1,
        scale: scaleFactor,
        duration: 1000,
        ease: 'Back.easeOut',
      });
    } else if (this.titleLine1!.alpha === 1) {
      this.titleLine1!.setScale(scaleFactor);
    }

    if (this.titleLine2!.alpha === 0) {
      this.tweens.add({
        targets: this.titleLine2,
        alpha: 1,
        scale: scaleFactor,
        duration: 800,
        ease: 'Back.easeOut',
        delay: 200,
      });
    } else if (this.titleLine2!.alpha === 1) {
      this.titleLine2!.setScale(scaleFactor);
    }

    if (this.questionMark!.alpha === 0) {
      this.tweens.add({
        targets: this.questionMark,
        alpha: 1,
        scale: scaleFactor,
        duration: 800,
        ease: 'Back.easeOut',
        delay: 200,
        onComplete: () => {
          this.tweens.add({
            targets: this.questionMark,
            angle: 15,
            duration: 80,
            ease: 'Elastic.easeOut',
            delay: 200,
          });
        },
      });
    } else if (this.questionMark!.alpha === 1) {
      this.questionMark!.setScale(scaleFactor);
    }

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
          fixedWidth: 320,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.playButton!.setStyle({ backgroundColor: '#2ecc71' }))
        .on('pointerout', () => this.playButton!.setStyle({ backgroundColor: '#27ae60' }))
        .on('pointerdown', () => {
          this.scene.start('Quiz');
        });

      this.tweens.add({
        targets: this.playButton,
        alpha: 1,
        y: `+=${50}`,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 400,
      });
    }
    this.playButton!.setPosition(width / 2, height * 0.54);
    if (this.playButton!.alpha === 1) {
      this.playButton!.setScale(scaleFactor);
    }

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
          fixedWidth: 320,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.drawButton!.setStyle({ backgroundColor: '#5dade2' }))
        .on('pointerout', () => this.drawButton!.setStyle({ backgroundColor: '#3498db' }))
        .on('pointerdown', () => {
          this.scene.start('Drawing');
        });

      this.tweens.add({
        targets: this.drawButton,
        alpha: 1,
        y: `+=${50}`,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 600,
      });
    }
    this.drawButton!.setPosition(width / 2, height * 0.66);
    if (this.drawButton!.alpha === 1) {
      this.drawButton!.setScale(scaleFactor);
    }

    const secondaryButtonsY = height * 0.78;
    const buttonSpacing = 80;

    if (!this.leaderboardButton) {
      this.leaderboardButton = this.add
        .text(0, 0, 'Ranking', {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#9b59b6',
          padding: {
            x: 10,
            y: 10,
          } as Phaser.Types.GameObjects.Text.TextPadding,
          fixedWidth: 160,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.leaderboardButton!.setStyle({ backgroundColor: '#a569bd' }))
        .on('pointerout', () => this.leaderboardButton!.setStyle({ backgroundColor: '#9b59b6' }))
        .on('pointerdown', () => {
          this.scene.start('GlobalRanking');
        });

      this.tweens.add({
        targets: this.leaderboardButton,
        alpha: 1,
        y: `+=${50}`,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 800,
      });
    }
    this.leaderboardButton!.setPosition(width / 2 - buttonSpacing, secondaryButtonsY);
    if (this.leaderboardButton!.alpha === 1) {
      this.leaderboardButton!.setScale(scaleFactor);
    }

    if (!this.myHistoryButton) {
      this.myHistoryButton = this.add
        .text(0, 0, 'My History', {
          fontFamily: 'Arial Black',
          fontSize: '20px',
          color: '#ffffff',
          backgroundColor: '#e67e22',
          padding: {
            x: 10,
            y: 10,
          } as Phaser.Types.GameObjects.Text.TextPadding,
          fixedWidth: 160,
          align: 'center',
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.myHistoryButton!.setStyle({ backgroundColor: '#f39c12' }))
        .on('pointerout', () => this.myHistoryButton!.setStyle({ backgroundColor: '#e67e22' }))
        .on('pointerdown', () => {
          const userId = this.registry.get('userId') || 'anonymous';
          this.scene.start('QuizHistory', { userId });
        });

      this.tweens.add({
        targets: this.myHistoryButton,
        alpha: 1,
        y: `+=${50}`,
        duration: 600,
        ease: 'Back.easeOut',
        delay: 1000,
      });
    }
    this.myHistoryButton!.setPosition(width / 2 + buttonSpacing, secondaryButtonsY);
    if (this.myHistoryButton!.alpha === 1) {
      this.myHistoryButton!.setScale(scaleFactor);
    }
  }
}