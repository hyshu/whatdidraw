import { Scene } from 'phaser';

export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.image('background', 'assets/bg.png');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x6a4c93);
    this.scene.start('Preloader');
  }
}
