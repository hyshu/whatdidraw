# What Did I Draw? - Interactive Drawing Quiz Game

An innovative drawing guessing game built for Reddit using Devvit and Phaser.js. Players create drawings with answers and hints, then watch as others try to guess what was drawn by viewing the drawing process replay in real-time.

## What This Game Is

**What Did I Draw?** is a unique drawing quiz game where creativity meets competition. Players draw pictures with digital tools, set answers and hints, then other players watch the drawing being created stroke-by-stroke and try to guess what it represents. The game combines artistic expression with puzzle-solving in an engaging social environment.

### Core Gameplay
- **Create Mode**: Draw on a 360×360px digital canvas with professional tools (8 colors, 5 brush sizes, undo) and set answer/hint
- **Quiz Mode**: Watch drawings being created in real-time playback and guess what they represent
- **Scoring System**: Earn points based on speed and accuracy - fewer strokes viewed and faster guesses earn higher scores
- **Leaderboards**: Compete with other Reddit users for top scores on individual drawings

## What Makes This Game Innovative

### 🎬 **Real-Time Drawing Playback**
Unlike static image guessing games, players watch drawings being created stroke-by-stroke in the exact order and timing they were originally drawn. This creates a unique "time-lapse art" experience where the drawing process itself becomes part of the puzzle.

### 🎯 **Strategic Timing System**
Players can guess at any point during the playback, creating strategic decisions: guess early with limited information for maximum points, or wait to see more strokes for a safer but lower-scoring guess.

### 🏆 **Per-Drawing Competition**
Each drawing has its own leaderboard showing the top 5 scores, creating focused competition around individual artworks rather than just global rankings. This encourages players to master specific drawings and compete directly.

### 🧮 **Sophisticated Scoring Algorithm**
Points are calculated using a dual-factor system:
- **Base Score**: (Total strokes - Viewed strokes) × 100 (rewards guessing with minimal information)
- **Time Bonus**: max(0, (60 - elapsed seconds) × 10) (rewards quick thinking)
- Only the highest score per user per drawing is kept, encouraging repeated attempts to improve

### 📱 **Mobile-First Design**
Built with responsive layouts that prevent UI overlap and horizontal scrolling on any screen size (320px to 1920px+). Touch-optimized drawing with 50ms debouncing ensures smooth mobile experience.

### 🎨 **Community-Driven Content**
Every drawing is created by real Reddit users with their own artistic style, cultural references, and creative interpretations, ensuring endless variety and community-relevant content.

### 🔄 **Seamless Mode Switching**
Players can fluidly switch between creating drawings and playing quizzes with intuitive navigation that maintains context.

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
2. **Game Layout**: Optimized interface for watching and guessing:
   - **Back Button**: Top-left corner for easy navigation
   - **Hint Display**: Top-right shows any hint provided by the artist
   - **Drawing Canvas**: Central 360×360px area where stroke playback occurs
   - **Progress Tracker**: Shows "Progress: X/Y strokes" and elapsed time
   - **Playback Controls**: Play/Pause button to control drawing replay
   - **Guess Input**: Text field for entering your answer (appears below canvas)
   - **Submit Button**: Blue button to submit your guess

#### **The Playback Experience**
1. **Drawing Loads**: A drawing created by another player loads with all stroke data
2. **Watch the Creation**: Click "Play" to see the drawing being created stroke-by-stroke
   - Strokes appear in the exact order and timing they were originally drawn
   - Progress counter shows how many strokes have been revealed
   - Timer tracks how long you've been watching
3. **Strategic Guessing**: You can guess at any point during playback:
   - **Early Guess**: Higher potential score but less visual information
   - **Wait and See**: More strokes revealed but lower scoring potential
   - **Pause Anytime**: Use pause button to study the current state

#### **Making Your Guess**
1. **Enter Your Answer**: Type in the guess input field (up to 50 characters)
2. **Submit**: Click "Submit Guess" or press Enter
3. **Instant Results**: Get immediate feedback with detailed scoring:
   - **Correct Guess**: 
     - Shows your total score with breakdown
     - Base Score: (Unseen strokes × 100) points
     - Time Bonus: (Seconds under 60 × 10) points
     - Options to "Play Again" or return to "Main Menu"
   - **Incorrect Guess**: Shows the correct answer with options to continue

#### **Advanced Quiz Features**
- **Real-Time Playback**: Drawings replay with original timing preserved using requestAnimationFrame
- **Stroke Progress Tracking**: Precise tracking of partial stroke completion for accurate scoring
- **Pause/Resume**: Full control over playback speed and timing
- **Score Breakdown**: Detailed explanation of how points were calculated
- **Replay Option**: Restart the same drawing to try for a better score
- **Mobile Optimized**: Touch-friendly controls with responsive layout

### 🏆 **Scoring & Leaderboards**

#### **How Scoring Works**
The game uses a sophisticated dual-factor scoring system that rewards both efficiency and speed:

**Base Score Calculation:**
- Formula: `(Total Strokes - Viewed Strokes) × 100`
- Rewards guessing with minimal visual information
- Example: If a drawing has 20 strokes and you guess after seeing 8, you get (20-8) × 100 = 1,200 base points

**Time Bonus Calculation:**
- Formula: `max(0, (60 - Elapsed Seconds) × 10)`
- Rewards quick thinking and recognition
- Example: If you guess in 25 seconds, you get (60-25) × 10 = 350 bonus points

**Total Score:**
- Only awarded for correct guesses
- Total = Base Score + Time Bonus
- Example: 1,200 + 350 = 1,550 total points

**Scoring Features:**
- **Partial Stroke Tracking**: Even partial completion of strokes affects scoring
- **Best Score Only**: Only your highest score per drawing is kept
- **Immediate Feedback**: See detailed score breakdown after each correct guess
- **Strategic Depth**: Balance between waiting for more information vs. time penalty

#### **Leaderboard System**
1. **Per-Drawing Competition**: Each drawing has its own top 5 leaderboard
2. **Access Methods**: 
   - Click "Leaderboard" from main menu (shows mock data)
   - Automatic display after quiz completion
3. **Ranking Display**:
   - **Position**: #1 through #5 with clear ranking
   - **Username**: Reddit usernames of top players
   - **Total Score**: Final point total prominently displayed
   - **Score Breakdown**: Shows base points and time bonus separately
4. **User Rank**: Your position displayed if you're in the top 5

#### **Competitive Features**
- **Individual Drawing Focus**: Compete specifically on drawings you find interesting
- **Score Improvement**: Replay drawings to beat your previous best
- **Community Recognition**: See and be seen by other Reddit users
- **Detailed Analytics**: Understand exactly how scores are calculated
- **Fair Competition**: Same drawing, same rules for all players

### 💡 **Pro Tips for Success**

#### **For Drawing Creators**
- **Clear but Challenging**: Make recognizable drawings that aren't too obvious
- **Good Hints**: Provide clues that help without giving away the answer
- **Think Like a Guesser**: Consider what details are most important
- **Artistic Style**: Your unique style makes drawings more interesting

#### **For Quiz Players**
- **Strategic Timing**: Decide when to guess based on risk vs. reward
- **Watch the Process**: The order of strokes often reveals the artist's intent
- **Use Hints Wisely**: Combine visual clues with provided hints for better guesses
- **Early Recognition**: Train yourself to identify subjects with minimal strokes
- **Pause and Study**: Use the pause button to analyze complex drawings
- **Learn Patterns**: Different artists have different drawing approaches

#### **Community Engagement**
- **Participate Regularly**: More drawings mean more variety and fun
- **Creative Subjects**: Draw diverse topics to keep the game interesting
- **Respectful Competition**: Enjoy friendly rivalry with other Reddit users
- **Share Strategies**: Discuss techniques and approaches with the community

## Current Development Status

This game is currently in active development with the following features implemented:

### ✅ **Completed Features**
- **Custom Title Screen**: Animated "What Did I Draw?" branding with smooth transitions and responsive scaling
- **Drawing System**: Full-featured canvas with 8 colors, 5 brush sizes, undo functionality, and stroke tracking
- **Responsive UI**: Mobile-optimized interface that works seamlessly on all screen sizes (320px to 1920px+)
- **Drawing Tools**: Complete toolset with color palette, brush size selector, stroke counter, and visual feedback
- **Answer/Hint Input**: Modal form system for completing drawings with character validation and UTF-8 support
- **Navigation System**: Back buttons with confirmation prompts, smooth scene transitions, and proper positioning
- **Quiz Interface**: Complete structure for viewing drawings, entering guesses, and receiving feedback
- **Drawing Playback System**: Stroke-by-stroke replay with original timing preservation using requestAnimationFrame
- **Playback Controls**: Play/pause/replay buttons with real-time progress tracking and state management
- **Scoring Algorithm**: Dual-factor calculation (base score + time bonus) with partial stroke progress tracking
- **Score Display**: Detailed breakdown showing base points, time bonus, unseen strokes, and elapsed time
- **Leaderboard System**: Top 5 rankings per drawing with score breakdowns and empty state handling
- **Answer Validation**: Case-insensitive matching with whitespace trimming and immediate feedback
- **API Integration**: Client-server communication structure with comprehensive TypeScript types
- **Game Flow**: Complete navigation between Create Drawing, Play Quiz, and Leaderboard modes
- **Input Validation**: Character limits, required fields, and user-friendly error messages
- **Mobile Touch Support**: Touch-optimized drawing with proper event handling
- **Comprehensive Testing**: 143 unit tests covering all Phase 1 and Phase 2 functionality

### 🚧 **In Development**
- **Redis Storage**: Data persistence and compression for drawings and scores
- **Server Endpoints**: Complete API implementation for all game features
- **Drawing Validation**: Input sanitization and profanity filtering
- **Performance Optimization**: Caching and compression for better scalability

### 📋 **Planned Features**
- **Atomic Score Updates**: Concurrent user handling with Redis transactions
- **Security Features**: XSS prevention and comprehensive input validation
- **Testing Suite**: Unit, integration, and performance tests

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
