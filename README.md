# What Did I Draw?

A fun drawing quiz game built as a Reddit app. Create drawings and challenge others to guess what you drew, or play quizzes created by other users!

## Features

### 🎨 Create Drawing

Draw your own quiz for others to solve:

- Use an intuitive canvas with multiple colors and brush sizes
- Add an answer (1-50 characters, required)
- Optionally add a hint (0-100 characters) to help players
- Save your drawing and share it to the subreddit

### 🎮 Play Quiz

Test your guessing skills with drawings from other players:

- View drawings stroke-by-stroke or all at once
- Earn points based on how quickly you guess and how many strokes you viewed
- **Anti-cheat measures**:
  - Answering your own quiz will result in **0 points**
  - Guessing too quickly (without viewing enough strokes) will result in **0 points**
- **Once you answer a quiz, you cannot answer it again** - each quiz can only be attempted once per player

### 🏆 Ranking & Leaderboard

Track your progress and compete with others:

- **Global Ranking**: See the top players across all quizzes
- **Subreddit Ranking**: View rankings specific to each subreddit
- **My History**: Review all the quizzes you've answered with scores and timestamps

### 📤 Share to Subreddit

After creating a drawing:

- Post your quiz to the subreddit where the app is installed
- Other users can discover and play your quiz
- Build a collection of community-created challenges

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Reddit account
- Devvit CLI installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whatdidraw
```

2. Install dependencies:
```bash
npm install
```

### Running Locally

To run the app in development mode:

```bash
npm run dev
```

This will start:
- Client build in watch mode
- Server build in watch mode
- Devvit playtest server

### Building for Production

To build the app for deployment:

```bash
npm run build
```

### Deploying to Reddit

1. Login to Devvit:
```bash
npm run login
```

2. Upload the app:
```bash
npm run deploy
```

3. Publish the app:
```bash
npm run launch
```

## Scripts

- `npm run dev` - Run development server with hot reload
- `npm run build` - Build client and server for production
- `npm test` - Run test suite
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint the codebase
- `npm run deploy` - Build and upload to Devvit
- `npm run launch` - Build, deploy, and publish the app

## How Scoring Works

When you answer a quiz correctly:

- **Base Score**: (Total strokes - Viewed strokes) × 100
- **Time Bonus**: max(0, (60 - Elapsed time in seconds)) × 10
- **Total Score**: Base Score + Time Bonus

Special cases that result in **0 points**:
- Answering your own quiz
- Answering too quickly (less than 3 seconds or viewing less than 10% of strokes)
- Incorrect answers

## License

BSD-3-Clause
