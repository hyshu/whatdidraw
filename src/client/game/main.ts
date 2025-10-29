import { Boot } from './scenes/Boot';
import { MainMenu } from './scenes/MainMenu';
import { Drawing } from './scenes/Drawing';
import { Quiz } from './scenes/Quiz';
import { Leaderboard } from './scenes/Leaderboard';
import { QuizHistory } from './scenes/QuizHistory';
import { GlobalLeaderboard } from './scenes/GlobalLeaderboard';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#6a4c93',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  scene: [Boot, Preloader, MainMenu, Drawing, Quiz, Leaderboard, QuizHistory, GlobalLeaderboard],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
