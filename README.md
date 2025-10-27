# What Did I Draw? - Interactive Drawing Quiz Game

An innovative drawing guessing game built for Reddit using Devvit and Phaser.js. Players can create drawings for others to guess or test their skills by guessing what others have drawn.

## What This Game Is

**What Did I Draw?** is a creative multiplayer guessing game where the Reddit community creates and solves drawing puzzles together. The game combines artistic expression with puzzle-solving in a social environment.

### Core Gameplay
- **Create Mode**: Draw something on a digital canvas and provide an answer and optional hint
- **Quiz Mode**: View drawings created by other players and try to guess what they drew
- **Scoring System**: Earn points based on correct guesses with time-based bonuses
- **Leaderboards**: Compete with other Reddit users for the highest scores

## What Makes This Game Innovative

### 🎨 **Community-Driven Content**
Unlike traditional games with pre-made content, every drawing is created by real Reddit users, ensuring fresh, unique, and culturally relevant puzzles that reflect the community's creativity and humor.

### 🧠 **Adaptive Difficulty** 
The challenge level naturally varies based on the drawing skill and creativity of the community - from simple doodles perfect for beginners to complex artistic masterpieces that challenge even experienced players.

### 🏆 **Social Competition**
Integrated leaderboards create friendly competition within Reddit communities, encouraging both artistic improvement and puzzle-solving skills while fostering community engagement.

### 📱 **Cross-Platform Accessibility**
Built with responsive design principles, the game works seamlessly on both desktop and mobile devices, allowing Reddit users to play anywhere, anytime.

### 🔄 **Endless Replayability**
With community-generated content, the game offers unlimited replay value as new drawings are constantly being added by players, ensuring the experience never gets stale.

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for seamless Reddit integration
- **[Phaser.js](https://phaser.io/)**: 2D game engine for smooth canvas drawing and interactive UI
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development for robust code
- **[Vite](https://vite.dev/)**: Fast build tool for optimized performance
- **[Express](https://expressjs.com/)**: Backend API for game logic and data management

## How to Play

### 🎮 **Getting Started**
1. **Launch the Game**: Click the "Play" button on the Reddit post to open the game in full-screen mode
2. **Choose Your Mode**: From the main menu, select either "Create Drawing" or "Play Quiz"

### 🖌️ **Creating a Drawing (Create Mode)**
1. **Start Drawing**: Click "Create Drawing" from the main menu
2. **Use the Canvas**: Draw your picture using the available tools:
   - **Color Palette**: Choose from 8 different colors
   - **Brush Sizes**: Select from 5 different brush sizes
   - **Pen/Eraser**: Toggle between drawing and erasing
   - **Clear Canvas**: Start over with a blank canvas
   - **Undo**: Remove your last stroke
3. **Add Details**: 
   - **Answer**: Enter what your drawing represents (1-50 characters, required)
   - **Hint**: Optionally provide a helpful hint (up to 100 characters)
4. **Save & Share**: Submit your drawing to add it to the community pool

### 🔍 **Playing Quiz Mode**
1. **Start Guessing**: Click "Play Quiz" from the main menu
2. **Watch the Drawing**: View a drawing created by another player
   - Drawings may include helpful hints
   - Pay attention to details and artistic style
3. **Make Your Guess**: 
   - Type your answer in the input field
   - Press Enter or click "Submit Guess"
4. **Get Feedback**: 
   - **Correct**: Earn points and see your score breakdown
   - **Incorrect**: Learn the correct answer and try another drawing
5. **View Results**: After each guess, you can:
   - Play another round
   - Check the leaderboard
   - Return to the main menu

### 🏆 **Scoring System**
- **Base Points**: Earn points for correct guesses
- **Time Bonus**: Get extra points for quick answers
- **Leaderboard**: Compete with other Reddit users for the top spots

### 📊 **Leaderboard**
- View the top 5 scores from the community
- See your ranking among other players
- Track score breakdowns and achievements
- Access from the main menu or after completing a quiz

### 💡 **Tips for Success**
- **When Drawing**: Make your artwork clear but not too obvious - aim for the sweet spot of challenging but guessable
- **When Guessing**: Look for key details, consider the hint if provided, and think about common objects or concepts
- **Speed Matters**: Quick correct guesses earn time bonuses, so trust your instincts
- **Community Engagement**: The more players participate, the more diverse and interesting the drawings become

## Development Setup

### Prerequisites
> Make sure you have Node.js 22+ installed on your machine before running!

### Installation
1. Run `npm create devvit@latest --template=phaser`
2. Go through the installation wizard (requires Reddit account and Devvit developer access)
3. Copy the provided command into your terminal to start development

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

## Credits

Thanks to the Phaser team for [providing a great template](https://github.com/phaserjs/template-vite-ts)!
