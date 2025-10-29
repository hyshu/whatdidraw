import { Scene } from 'phaser';
import { QuizHistoryEntry, GetQuizHistoryResponse } from '../../../shared/types/api';
import { get, ApiError } from '../../utils/api';

export class QuizHistory extends Scene {
  private backButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private historyContainer!: HTMLDivElement;
  private userId: string | null = null;

  constructor() {
    super('QuizHistory');
  }

  init(data: { userId?: string }) {
    this.userId = data.userId || null;

    if (this.historyContainer && this.historyContainer.parentElement) {
      this.historyContainer.parentElement.removeChild(this.historyContainer);
      this.historyContainer = null as any;
    }
  }

  async create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    this.createUI();
    await this.loadQuizHistory();

    this.scale.on('resize', () => this.handleResize());
  }

  private createUI() {
    const { width } = this.scale;

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
      .text(width / 2, 60, 'My Quiz History', {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private async loadQuizHistory() {
    if (!this.userId) {
      this.createHistoryHTML([]);
      return;
    }

    try {
      const result = await get<GetQuizHistoryResponse>(`/api/user/${this.userId}/quiz-history?page=1&limit=10`);

      this.createHistoryHTML(result.entries);
    } catch (error) {
      console.error('Error loading quiz history:', error);
      if (error instanceof ApiError) {
        console.error('API Error:', error.message);
      }
      this.createHistoryHTML([]);
    }
  }

  private createHistoryHTML(entries: QuizHistoryEntry[]) {
    this.historyContainer = document.createElement('div');
    this.historyContainer.style.cssText = `
      position: absolute;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      z-index: 100;
      font-family: Arial;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    `;

    if (entries.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No quizzes answered yet';
      emptyMessage.style.cssText = 'color: white; text-align: center; font-size: 18px; padding: 20px;';
      this.historyContainer.appendChild(emptyMessage);
    } else {
      entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        const headerDiv = document.createElement('div');
        headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

        const answerText = document.createElement('div');
        answerText.textContent = `${index + 1}. "${entry.drawingAnswer}"`;
        answerText.style.cssText = 'font-weight: bold; font-size: 18px; color: #333;';

        const dateText = document.createElement('div');
        const date = new Date(entry.submittedAt);
        dateText.textContent = date.toLocaleDateString();
        dateText.style.cssText = 'font-size: 14px; color: #666;';

        headerDiv.appendChild(answerText);
        headerDiv.appendChild(dateText);

        const scoreDiv = document.createElement('div');
        scoreDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

        const scoreInfoDiv = document.createElement('div');
        const rankText = entry.rank !== null ? `Rank ${entry.rank}` : 'Rank -';
        scoreInfoDiv.innerHTML = `
          <div style="font-size: 20px; font-weight: bold; color: #6a4c93;">${entry.score} pts</div>
          <div style="font-size: 14px; color: #666;">Base: ${entry.baseScore} | Bonus: ${entry.timeBonus} | ${rankText}</div>
        `;

        const viewLeaderboardButton = document.createElement('button');
        viewLeaderboardButton.textContent = 'View Leaderboard';
        viewLeaderboardButton.style.cssText = `
          background: #6a4c93;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
        `;
        viewLeaderboardButton.onmouseover = () => {
          viewLeaderboardButton.style.background = '#7f5a9f';
        };
        viewLeaderboardButton.onmouseout = () => {
          viewLeaderboardButton.style.background = '#6a4c93';
        };
        viewLeaderboardButton.onclick = () => {
          this.cleanup();
          this.scene.start('Leaderboard', { drawingId: entry.drawingId });
        };

        scoreDiv.appendChild(scoreInfoDiv);
        scoreDiv.appendChild(viewLeaderboardButton);

        entryDiv.appendChild(headerDiv);
        entryDiv.appendChild(scoreDiv);

        this.historyContainer.appendChild(entryDiv);
      });
    }

    document.body.appendChild(this.historyContainer);
  }

  private cleanup() {
    if (this.historyContainer) {
      this.historyContainer.remove();
    }
  }

  private handleResize() {
    const { width } = this.scale;
    this.titleText.setPosition(width / 2, 60);
  }

  private handleBack() {
    this.cleanup();
    this.scene.start('MainMenu');
  }

  destroy() {
    this.cleanup();
  }
}
