import { context, reddit } from '@devvit/web/server';

export const createPost = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  return await reddit.submitCustomPost({
    splash: {
      appDisplayName: 'What Did I Draw?',
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Start Playing',
      description: 'Can you guess what was drawn? Test your skills in this fun drawing quiz game!',
      entryUri: 'index.html',
      heading: 'What Did I Draw?',
      appIconUri: 'default-icon.png',
    },
    postData: {
      gameState: 'menu',
      totalDrawings: 0,
      totalPlayers: 0,
    },
    subredditName: subredditName,
    title: 'What Did I Draw? - Drawing Quiz Game',
  });
};