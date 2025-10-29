import { Scene } from 'phaser';
import { get } from '../../utils/api';
import { InitResponse } from '../../../shared/types/api';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {
    this.cameras.main.setBackgroundColor(0x6a4c93);
    this.add.image(512, 384, 'background').setAlpha(0.3);
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on('progress', (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath('assets');
  }

  async create() {
    try {
      // Fetch initialization data from server
      const initData = await get<InitResponse>('/api/init');

      // Store data in registry for access by other scenes
      this.registry.set('userId', initData.userId);
      this.registry.set('gameState', initData.gameState);

      if (initData.drawingId) {
        this.registry.set('drawingId', initData.drawingId);
      }
    } catch (error) {
      console.error('Error fetching init data:', error);
      // Fallback to defaults if init fails
      this.registry.set('userId', 'anonymous');
      this.registry.set('gameState', 'menu');
    }

    this.scene.start('MainMenu');
  }
}
