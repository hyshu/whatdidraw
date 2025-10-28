# What Did I Draw? - Interactive Drawing Quiz Game

An innovative drawing guessing game built for Reddit using Devvit and Phaser.js. Players can create drawings for others to guess or test their skills by guessing what others have drawn.

## What This Game Is

**What Did I Draw?** is a creative multiplayer guessing game where the Reddit community creates and solves drawing puzzles together. The game combines artistic expression with puzzle-solving in a social environment.

### Core Gameplay
- **Create Mode**: Draw something on a digital canvas (360×360px) with professional drawing tools including 8 colors, 5 brush sizes, and undo functionality
- **Quiz Mode**: View drawings created by other players and try to guess what they drew based on hints and visual clues
- **Scoring System**: Earn points based on correct guesses with time-based bonuses and stroke efficiency
- **Leaderboards**: Compete with other Reddit users for the highest scores on individual drawings

## What Makes This Game Innovative

### 🎨 **Community-Driven Content**
Unlike traditional games with pre-made content, every drawing is created by real Reddit users, ensuring fresh, unique, and culturally relevant puzzles that reflect the community's creativity and humor.

### 🧠 **Adaptive Difficulty** 
The challenge level naturally varies based on the drawing skill and creativity of the community - from simple doodles perfect for beginners to complex artistic masterpieces that challenge even experienced players.

### 🏆 **Social Competition**
Integrated leaderboards create friendly competition within Reddit communities, encouraging both artistic improvement and puzzle-solving skills while fostering community engagement.

### 📱 **Cross-Platform Accessibility**
Built with responsive design principles, the game works seamlessly on both desktop and mobile devices, allowing Reddit users to play anywhere, anytime with touch-optimized controls.

### 🔄 **Endless Replayability**
With community-generated content, the game offers unlimited replay value as new drawings are constantly being added by players, ensuring the experience never gets stale.

### 🎯 **Intelligent Scoring System**
The scoring algorithm rewards both speed and efficiency - players earn more points for guessing correctly with fewer strokes viewed, creating strategic depth in when to make your guess.

## Technology Stack

- **[Devvit](https://developers.reddit.com/)**: Reddit's developer platform for seamless Reddit integration
- **[Phaser.js](https://phaser.io/)**: 2D game engine for smooth canvas drawing and interactive UI
- **[TypeScript](https://www.typescriptlang.org/)**: Type-safe development for robust code
- **[Vite](https://vite.dev/)**: Fast build tool for optimized performance
- **[Express](https://expressjs.com/)**: Backend API for game logic and data management

## How to Play

### 🎮 **Getting Started**
1. **Launch the Game**: Click the "Play" button on the Reddit post to open the game in full-screen mode
2. **Main Menu**: You'll see the animated title "What Did I Draw?" with three main options:
   - **Play Quiz**: Guess drawings created by other players
   - **Create Drawing**: Make your own drawing for others to guess
   - **Leaderboard**: View top scores from the community
3. **Navigation**: All screens include intuitive navigation to move between modes seamlessly

### 🖌️ **Creating a Drawing (Create Mode)**

#### **Drawing Interface**
1. **Start Drawing**: Click "Create Drawing" from the main menu
2. **Canvas Layout**: The interface provides a clean, organized workspace:
   - **Top Bar**: Back button (left), stroke counter (center), Finish button (right)
   - **Center**: 360×360px white drawing canvas
   - **Bottom Right**: Undo button for removing the last stroke
   - **Bottom Controls**: Color palette and brush size selectors

#### **Drawing Tools**
- **Color Palette**: Choose from 8 vibrant colors:
  - Black, Red, Green, Blue, Yellow, Magenta, Cyan, White
  - Selected color highlighted with gold border
- **Brush Sizes**: Select from 5 precise brush sizes:
  - 1px (fine details), 3px (default), 5px, 8px, 12px (bold strokes)
  - Active size highlighted in blue
- **Drawing**: Click and drag to draw smooth strokes
- **Undo**: Remove your last stroke if you make a mistake
- **Stroke Counter**: Track your progress (displayed at top center)

#### **Completing Your Drawing**
1. **Finish Drawing**: Click the green "Finish" button when satisfied with your artwork
2. **Add Answer**: Enter what your drawing represents (1-50 characters, required)
   - Character counter shows remaining space
   - Supports international characters and emoji
3. **Add Hint** (Optional): Provide a helpful clue (up to 100 characters)
   - Good hints make drawings more engaging without giving away the answer
4. **Submit**: Click "Submit" to save your drawing to the community pool
5. **Return**: Automatically returns to main menu after successful submission

#### **Drawing Tips**
- **Back Button**: Located in top-left corner, smaller than other buttons to avoid accidental clicks
- **Confirmation**: If you have unsaved strokes, you'll be asked to confirm before leaving
- **Mobile Support**: Touch drawing works smoothly on mobile devices
- **Responsive Design**: Interface adapts to all screen sizes without overlapping elements

### 🔍 **Playing Quiz Mode**

#### **Quiz Interface**
1. **Start Guessing**: Click "Play Quiz" from the main menu
2. **Game Layout**: Clean, focused interface for optimal guessing:
   - **Title**: "What Did I Draw?" at the top
   - **Drawing Area**: Large central area where drawings appear
   - **Hint Display**: Shows any hint provided by the artist
   - **Status Text**: Provides game feedback and instructions
   - **Guess Input**: Text field for entering your answer
   - **Submit Button**: Green button to submit your guess
   - **Back to Menu**: Return to main menu anytime

#### **Making Your Guess**
1. **View the Drawing**: A drawing created by another player loads automatically
2. **Read the Hint**: Check for any helpful clues provided by the artist
3. **Enter Your Guess**: 
   - Type your answer in the input field
   - Press Enter or click "Submit Guess"
   - No character limits on guesses
4. **Get Instant Feedback**:
   - **Correct**: Green success message with your score
   - **Incorrect**: Red message showing the correct answer
5. **Continue Playing**: After each guess, a new drawing loads automatically

#### **Quiz Features**
- **Automatic Loading**: New drawings load seamlessly after each attempt
- **Immediate Feedback**: Know instantly if your guess was correct
- **Score Display**: See your points immediately after correct guesses
- **Hint System**: Optional clues help guide your thinking
- **Mobile Optimized**: Touch-friendly interface with proper input handling

### 🏆 **Scoring System**

#### **How Scoring Works**
The game uses an intelligent scoring algorithm that rewards both speed and efficiency:

- **Base Score Calculation**: (total strokes - viewed strokes) × 100
  - More points for guessing with fewer strokes viewed
  - Encourages quick recognition and pattern matching
- **Time Bonus**: max(0, (60 - elapsed seconds) × 10)
  - Up to 600 bonus points for answers within 60 seconds
  - Rewards quick thinking and confidence
- **Total Score**: Base Score + Time Bonus
- **Best Score Tracking**: Only your highest score per drawing is saved

#### **Strategic Scoring**
- **Early Guessing**: Higher base scores for recognizing drawings quickly
- **Speed Bonus**: Additional points for fast correct answers
- **Risk vs. Reward**: Balance between waiting for more clues vs. guessing early
- **Per-Drawing Competition**: Each drawing has its own leaderboard

### 📊 **Leaderboard System**

#### **Viewing Leaderboards**
1. **Access**: Click "Leaderboard" from main menu or view after completing a quiz
2. **Top 5 Display**: Shows the highest scores for each drawing
3. **Score Breakdown**: See individual scores with usernames
4. **Your Ranking**: Your position displayed if you're in the top 5

#### **Leaderboard Features**
- **Per-Drawing Rankings**: Each drawing maintains its own top 5 list
- **Username Display**: See which Reddit users achieved top scores
- **Score Values**: Full point totals displayed for comparison
- **Real-Time Updates**: Leaderboards update immediately after new high scores
- **Community Competition**: Friendly rivalry encourages improvement

### 💡 **Pro Tips for Success**

#### **For Drawing Creators**
- **Clear but Challenging**: Make recognizable drawings that aren't too obvious
- **Good Hints**: Provide clues that help without giving away the answer
- **Think Like a Guesser**: Consider what details are most important
- **Artistic Style**: Your unique style makes drawings more interesting

#### **For Quiz Players**
- **Look for Key Details**: Focus on distinctive features and shapes
- **Use Hints Wisely**: Combine visual clues with provided hints
- **Trust Your Instincts**: First impressions are often correct
- **Speed vs. Accuracy**: Balance quick guessing with careful observation
- **Learn from Mistakes**: Incorrect guesses teach you about other players' styles

#### **Community Engagement**
- **Participate Regularly**: More drawings mean more variety and fun
- **Creative Subjects**: Draw diverse topics to keep the game interesting
- **Respectful Competition**: Enjoy friendly rivalry with other Reddit users
- **Share Strategies**: Discuss techniques and approaches with the community

## Current Development Status

This game is currently in active development with the following features implemented:

### ✅ **Completed Features**
- **Custom Title Screen**: Animated "What Did I Draw?" branding with smooth transitions
- **Drawing System**: Full-featured canvas with 8 colors, 5 brush sizes, and undo functionality
- **Responsive UI**: Mobile-optimized interface that works on all screen sizes
- **Drawing Tools**: Complete toolset with color palette, brush size selector, and stroke counter
- **Answer/Hint Input**: Modal form system for completing drawings with validation
- **Navigation System**: Back buttons, confirmations, and smooth scene transitions
- **Quiz Interface**: Basic structure for viewing and guessing drawings
- **Leaderboard Display**: Top 5 scores system with proper formatting
- **API Integration**: Client-server communication structure with TypeScript types

### 🚧 **In Development**
- **Drawing Playback System**: Stroke-by-stroke replay functionality
- **Scoring Algorithm**: Base score + time bonus calculation system
- **Redis Storage**: Data persistence and compression for drawings and scores
- **Server Endpoints**: Complete API implementation for all game features
- **Drawing Validation**: Input sanitization and profanity filtering
- **Mobile Touch Optimization**: Enhanced touch controls and responsiveness

### 📋 **Planned Features**
- **Atomic Score Updates**: Concurrent user handling with Redis transactions
- **Performance Optimization**: Caching and compression for better scalability
- **Security Features**: XSS prevention and comprehensive input validation
- **Testing Suite**: Unit, integration, and performance tests
- **Reddit Integration**: Full Devvit platform integration with user authentication

## Development Setup

### Prerequisites
> Make sure you have Node.js 22+ installed on your machine before running!

### Installation
1. Clone this repository or create from template
2. Run `npm install` to install dependencies
3. Set up your Devvit development environment
4. Run `npm run dev` to start development server

### Development Commands

- `npm run dev`: Starts development server with live Reddit integration
- `npm run build`: Builds client and server bundles for production
- `npm run deploy`: Uploads new version to Reddit for testing
- `npm run launch`: Publishes app for community review
- `npm run check`: Runs TypeScript checks, linting, and formatting

### Testing Your Game
1. Run `npm run dev` in your terminal
2. Open the provided Reddit playtest URL
3. Click "Launch App" to test in full-screen mode
4. Test both drawing creation and quiz functionality

## Architecture Overview

### Technology Stack
- **Frontend**: Phaser.js 3.x for 2D graphics and game engine
- **Backend**: Express.js with Devvit server capabilities
- **Database**: Redis for fast data storage and leaderboards
- **Build System**: Vite for fast development and optimized builds
- **Language**: TypeScript for type safety across client and server

### Project Structure
```
src/
├── client/          # Phaser.js game client
│   ├── game/        # Game scenes and logic
│   ├── main.ts      # Client entry point
│   └── index.html   # HTML template
├── server/          # Express API server
│   ├── core/        # Business logic
│   └── index.ts     # Server entry point
└── shared/          # Shared types and interfaces
    └── types/       # API type definitions
```

## Contributing

This project follows a structured development approach with detailed specifications:

1. **Requirements**: See `.kiro/specs/drawing-quiz-game/requirements.md`
2. **Design Document**: See `.kiro/specs/drawing-quiz-game/design.md`
3. **Implementation Tasks**: See `.kiro/specs/drawing-quiz-game/tasks.md`

## Credits

- Built with [Phaser.js](https://phaser.io/) game engine
- Powered by [Reddit's Devvit](https://developers.reddit.com/) platform
- Thanks to the Phaser team for their excellent template foundation
