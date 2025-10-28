import { Scene } from 'phaser';

interface ScoreEntry {
  username: string;
  score: number;
  baseScore: number;
  timeBonus: number;
  submittedAt: number;
}

export class Leaderboard extends Scene {
  private backButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private leaderboardContainer!: HTMLDivElement;

  constructor() {
    super('Leaderboard');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    this.createUI();
    this.loadLeaderboard();

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

    this.titleText = this.add
      .text(width / 2, 60, 'Leaderboard', {
        fontFamily: 'Arial Black',
        fontSize: '48px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private loadLeaderboard() {
    const mockScores: ScoreEntry[] = [
      { username: 'Player1', score: 850, baseScore: 700, timeBonus: 150, submittedAt: Date.now() - 3600000 },
      { username: 'Player2', score: 720, baseScore: 600, timeBonus: 120, submittedAt: Date.now() - 7200000 },
      { username: 'Player3', score: 650, baseScore: 550, timeBonus: 100, submittedAt: Date.now() - 10800000 },
      { username: 'Player4', score: 580, baseScore: 500, timeBonus: 80, submittedAt: Date.now() - 14400000 },
      { username: 'Player5', score: 520, baseScore: 450, timeBonus: 70, submittedAt: Date.now() - 18000000 },
    ];

    this.createLeaderboardHTML(mockScores);
  }

  private createLeaderboardHTML(scores: ScoreEntry[]) {
    this.leaderboardContainer = document.createElement('div');
    this.leaderboardContainer.style.cssText = `
      position: absolute;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      z-index: 100;
      font-family: Arial;
    `;

    if (scores.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No scores yet. Be the first to play!';
      emptyMessage.style.cssText = 'color: white; text-align: center; font-size: 18px; padding: 20px;';
      this.leaderboardContainer.appendChild(emptyMessage);
    } else {
      scores.forEach((score, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        const leftDiv = document.createElement('div');
        leftDiv.style.cssText = 'flex: 1;';

        const rankSpan = document.createElement('span');
        rankSpan.textContent = `#${index + 1} `;
        rankSpan.style.cssText = 'font-weight: bold; font-size: 20px; color: #3498db; margin-right: 10px;';

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = score.username;
        usernameSpan.style.cssText = 'font-size: 18px; color: #333;';

        leftDiv.appendChild(rankSpan);
        leftDiv.appendChild(usernameSpan);

        const rightDiv = document.createElement('div');
        rightDiv.style.cssText = 'text-align: right;';

        const totalScoreDiv = document.createElement('div');
        totalScoreDiv.textContent = `${score.score} points`;
        totalScoreDiv.style.cssText = 'font-size: 20px; font-weight: bold; color: #27ae60;';

        const breakdownDiv = document.createElement('div');
        breakdownDiv.textContent = `Base: ${score.baseScore} | Time: ${score.timeBonus}`;
        breakdownDiv.style.cssText = 'font-size: 12px; color: #888; margin-top: 2px;';

        rightDiv.appendChild(totalScoreDiv);
        rightDiv.appendChild(breakdownDiv);

        entryDiv.appendChild(leftDiv);
        entryDiv.appendChild(rightDiv);

        this.leaderboardContainer.appendChild(entryDiv);
      });
    }

    document.body.appendChild(this.leaderboardContainer);
  }

  private handleBack() {
    this.cleanup();
    this.scene.start('MainMenu');
  }

  private handleResize() {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width / 2, 60);
  }

  private cleanup() {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.remove();
    }
  }

  destroy() {
    this.cleanup();
    super.destroy();
  }
}
