import { Scene } from 'phaser';
import { GetGlobalLeaderboardResponse, GlobalLeaderboardEntry } from '../../../shared/types/api';
import { get, ApiError } from '../../utils/api';

export class GlobalRanking extends Scene {
  private backButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private leaderboardContainer!: HTMLDivElement;

  constructor() {
    super('GlobalRanking');
  }

  init() {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.remove();
    }
    this.leaderboardContainer = null as any;
  }

  async create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    this.createUI();
    await this.loadGlobalLeaderboard();

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
      .text(width / 2, 60, 'Global Ranking', {
        fontFamily: 'Arial Black',
        fontSize: '40px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private async loadGlobalLeaderboard() {
    try {
      const result = await get<GetGlobalLeaderboardResponse>('/api/leaderboard/global?limit=50');

      if (!result || !result.entries) {
        console.error('Invalid response format:', result);
        this.createLeaderboardHTML([]);
        return;
      }

      this.createLeaderboardHTML(result.entries, result.currentUserRank);
    } catch (error) {
      console.error('Error loading global leaderboard:', error);
      if (error instanceof ApiError) {
        console.error('API Error:', error.message);
      }
      this.createLeaderboardHTML([]);
    }
  }

  private createLeaderboardHTML(entries: GlobalLeaderboardEntry[], currentUserRank?: number) {
    this.leaderboardContainer = document.createElement('div');
    this.leaderboardContainer.style.cssText = `
      position: absolute;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 600px;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
      z-index: 100;
      font-family: Arial;
    `;

    if (entries.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No players yet. Be the first!';
      emptyMessage.style.cssText = 'color: white; text-align: center; font-size: 18px; padding: 20px;';
      this.leaderboardContainer.appendChild(emptyMessage);
    } else {
      entries.forEach((entry) => {
        const isCurrentUser = currentUserRank !== undefined && entry.rank === currentUserRank;

        const entryDiv = document.createElement('div');
        entryDiv.style.cssText = `
          background: ${isCurrentUser ? 'rgba(255, 215, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        const leftDiv = document.createElement('div');
        leftDiv.style.cssText = 'flex: 1; display: flex; align-items: center;';

        const avatarContainer = document.createElement('div');
        avatarContainer.style.cssText = `
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        `;

        if (entry.avatarUrl) {
          const avatar = document.createElement('img');
          avatar.src = entry.avatarUrl;
          avatar.alt = entry.userId;
          avatar.style.cssText = 'width: 100%; height: 100%; border-radius: 50%; object-fit: cover;';
          avatar.onerror = () => {
            avatarContainer.innerHTML = '';
            avatarContainer.style.backgroundColor = '#3498db';
            const initial = document.createElement('span');
            initial.textContent = (entry.userId && entry.userId[0]) ? entry.userId[0].toUpperCase() : '?';
            initial.style.cssText = 'color: white; font-weight: bold; font-size: 18px;';
            avatarContainer.appendChild(initial);
          };
          avatarContainer.appendChild(avatar);
        } else {
          avatarContainer.style.backgroundColor = '#3498db';
          const initial = document.createElement('span');
          initial.textContent = (entry.userId && entry.userId[0]) ? entry.userId[0].toUpperCase() : '?';
          initial.style.cssText = 'color: white; font-weight: bold; font-size: 18px;';
          avatarContainer.appendChild(initial);
        }

        const textContainer = document.createElement('div');

        const topLine = document.createElement('div');
        topLine.style.cssText = 'display: flex; align-items: center; gap: 10px;';

        const rankSpan = document.createElement('span');
        rankSpan.textContent = `#${entry.rank}`;
        rankSpan.style.cssText = 'font-weight: bold; font-size: 20px; color: #3498db;';

        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = `u/${entry.userId}`;
        usernameSpan.style.cssText = 'font-size: 18px; color: #333;';

        if (isCurrentUser) {
          const youBadge = document.createElement('span');
          youBadge.textContent = '(You)';
          youBadge.style.cssText = 'font-size: 14px; color: #e74c3c; font-weight: bold;';
          topLine.appendChild(rankSpan);
          topLine.appendChild(usernameSpan);
          topLine.appendChild(youBadge);
        } else {
          topLine.appendChild(rankSpan);
          topLine.appendChild(usernameSpan);
        }

        const quizCountDiv = document.createElement('div');
        quizCountDiv.textContent = `Quizzes answered: ${entry.quizCount}`;
        quizCountDiv.style.cssText = 'font-size: 12px; color: #666; margin-top: 4px;';

        textContainer.appendChild(topLine);
        textContainer.appendChild(quizCountDiv);
        leftDiv.appendChild(avatarContainer);
        leftDiv.appendChild(textContainer);

        const rightDiv = document.createElement('div');
        rightDiv.style.cssText = 'text-align: right;';

        const totalScoreDiv = document.createElement('div');
        totalScoreDiv.textContent = `${entry.totalScore.toLocaleString()} pts`;
        totalScoreDiv.style.cssText = 'font-size: 20px; font-weight: bold; color: #27ae60;';

        rightDiv.appendChild(totalScoreDiv);

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
