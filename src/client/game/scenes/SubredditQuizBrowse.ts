import { Scene } from 'phaser';
import { GetSubredditQuizzesResponse, SubredditQuizMetadata } from '../../../shared/types/api';
import { get, ApiError } from '../../utils/api';

export class SubredditQuizBrowse extends Scene {
  private backButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private quizListContainer!: HTMLDivElement;
  private subredditName: string = '';

  constructor() {
    super('SubredditQuizBrowse');
  }

  init(data: { subredditName?: string } = {}) {
    if (this.quizListContainer) {
      this.quizListContainer.remove();
    }
    this.quizListContainer = null as any;
    this.subredditName = data.subredditName || '';
  }

  async create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);

    if (!this.subredditName) {
      alert('No subreddit name provided');
      this.scene.start('MainMenu');
      return;
    }

    this.createUI();
    await this.loadSubredditQuizzes();

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
      .text(width / 2, 60, `r/${this.subredditName} Quizzes`, {
        fontFamily: 'Arial Black',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5, 0);
  }

  private async loadSubredditQuizzes() {
    try {
      const result = await get<GetSubredditQuizzesResponse>(`/api/subreddit/${this.subredditName}/quizzes?page=1&limit=20`);

      this.createQuizListHTML(result.quizzes);
    } catch (error) {
      console.error('Error loading subreddit quizzes:', error);
      if (error instanceof ApiError) {
        console.error('API Error:', error.message);
      }
      this.createQuizListHTML([]);
    }
  }

  private createQuizListHTML(quizzes: SubredditQuizMetadata[]) {
    this.quizListContainer = document.createElement('div');
    this.quizListContainer.style.cssText = `
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

    if (quizzes.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.textContent = 'No quizzes in this subreddit yet.';
      emptyMessage.style.cssText = 'color: white; text-align: center; font-size: 18px; padding: 20px;';
      this.quizListContainer.appendChild(emptyMessage);
    } else {
      quizzes.forEach((quiz) => {
        const quizDiv = document.createElement('div');
        quizDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.95);
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;

        quizDiv.onmouseover = () => {
          quizDiv.style.transform = 'scale(1.02)';
        };
        quizDiv.onmouseout = () => {
          quizDiv.style.transform = 'scale(1)';
        };

        const titleDiv = document.createElement('div');
        titleDiv.textContent = `Drawing by u/${quiz.createdBy}`;
        titleDiv.style.cssText = 'font-weight: bold; font-size: 18px; color: #333; margin-bottom: 5px;';

        const dateDiv = document.createElement('div');
        const date = new Date(quiz.postedAt);
        dateDiv.textContent = `Posted: ${date.toLocaleDateString()}`;
        dateDiv.style.cssText = 'font-size: 14px; color: #666;';

        quizDiv.appendChild(titleDiv);
        quizDiv.appendChild(dateDiv);

        quizDiv.onclick = () => {
          this.handleQuizSelect(quiz.drawingId);
        };

        this.quizListContainer.appendChild(quizDiv);
      });
    }

    document.body.appendChild(this.quizListContainer);
  }

  private handleQuizSelect(drawingId: string) {
    if (this.quizListContainer) {
      this.quizListContainer.remove();
    }
    this.scene.start('Quiz', { drawingId });
  }

  private handleBack() {
    if (this.quizListContainer) {
      this.quizListContainer.remove();
    }
    this.scene.start('MainMenu');
  }

  private handleResize() {
    const { width, height } = this.scale;
    this.cameras.resize(width, height);
    this.titleText.setPosition(width / 2, 60);
  }

  destroy() {
    if (this.quizListContainer) {
      this.quizListContainer.remove();
    }
    super.destroy();
  }
}
