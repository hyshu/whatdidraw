import { Scene } from 'phaser';
import { GetSubredditRankingResponse, SubredditRankingEntry } from '../../../shared/types/api';
import { get, ApiError } from '../../utils/api';
import { showToast } from '../utils/toast';

export class SubredditRanking extends Scene {
  private backButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private leaderboardContainer!: HTMLDivElement;
  private subredditName: string = '';

  constructor() {
    super('SubredditRanking');
  }

  init(data: { subredditName?: string } = {}) {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.remove();
    }
    this.leaderboardContainer = null as any;
    this.subredditName = data.subredditName || '';
  }

  async create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    if (!this.subredditName) {
      showToast(this, 'No subreddit name provided', { type: 'error' });
      this.scene.start('MainMenu');
      return;
    }

    this.createUI();
    await this.loadSubredditRanking();

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
      .text(width / 2, 60, `r/${this.subredditName} Ranking`, {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private async loadSubredditRanking() {
    try {
      const result = await get<GetSubredditRankingResponse>(`/api/subreddit/${this.subredditName}/ranking?limit=50`);

      this.createLeaderboardHTML(result.entries, result.currentUserRank);
    } catch (error) {
      console.error('Error loading subreddit ranking:', error);
      if (error instanceof ApiError) {
        console.error('API Error:', error.message);
      }
      this.createLeaderboardHTML([]);
    }
  }

  private createLeaderboardHTML(entries: SubredditRankingEntry[], currentUserRank?: number) {
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
      emptyMessage.textContent = 'No players in this subreddit yet.';
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
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        const rankDiv = document.createElement('div');
        rankDiv.textContent = `#${entry.rank}`;
        rankDiv.style.cssText = 'font-weight: bold; font-size: 24px; color: #6a4c93; min-width: 50px;';

        const avatarImg = document.createElement('img');
        if (entry.avatarUrl) {
          avatarImg.src = entry.avatarUrl;
        } else {
          avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23cccccc" width="40" height="40"/%3E%3C/svg%3E';
        }
        avatarImg.style.cssText = 'width: 40px; height: 40px; border-radius: 50%; object-fit: cover;';
        avatarImg.onerror = () => {
          avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect fill="%23cccccc" width="40" height="40"/%3E%3C/svg%3E';
        };

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'flex: 1;';

        const usernameDiv = document.createElement('div');
        usernameDiv.textContent = `u/${entry.userId}${isCurrentUser ? ' (You)' : ''}`;
        usernameDiv.style.cssText = 'font-weight: bold; font-size: 18px; color: #333; margin-bottom: 5px;';

        const statsDiv = document.createElement('div');
        statsDiv.textContent = `${entry.totalScore} pts • ${entry.quizCount} quizzes`;
        statsDiv.style.cssText = 'font-size: 14px; color: #666;';

        infoDiv.appendChild(usernameDiv);
        infoDiv.appendChild(statsDiv);

        entryDiv.appendChild(rankDiv);
        entryDiv.appendChild(avatarImg);
        entryDiv.appendChild(infoDiv);

        this.leaderboardContainer.appendChild(entryDiv);
      });
    }

    document.body.appendChild(this.leaderboardContainer);
  }

  private handleBack() {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.remove();
    }
    this.scene.start('MainMenu');
  }

  private handleResize() {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width / 2, 60);
  }

  destroy() {
    if (this.leaderboardContainer) {
      this.leaderboardContainer.remove();
    }
    super.destroy();
  }
}
