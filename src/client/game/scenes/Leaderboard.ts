import { Scene } from 'phaser';
import { Score, GetLeaderboardResponse } from '../../../shared/types/api';
import { get, ApiError } from '../../utils/api';

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
  private drawingId: string | null = null;

  constructor() {
    super('Leaderboard');
  }

  init(data: { drawingId?: string }) {
    this.drawingId = data.drawingId || null;
  }

  async create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    this.createUI();
    await this.loadLeaderboard();

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

  private async loadLeaderboard() {
    if (!this.drawingId) {
      this.createLeaderboardHTML([]);
      return;
    }

    try {
      const result = await get<GetLeaderboardResponse>(`/api/leaderboard/${this.drawingId}`);

      const scores: ScoreEntry[] = result.scores.map((s) => ({
        username: s.username,
        score: s.score,
        baseScore: s.baseScore,
        timeBonus: s.timeBonus,
        submittedAt: s.timestamp,
      }));

      this.createLeaderboardHTML(scores);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      if (error instanceof ApiError) {
        console.error('API Error:', error.message);
      }
      this.createLeaderboardHTML([]);
    }
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
