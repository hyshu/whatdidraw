# Implementation Plan

## Current Status Analysis
The project has a basic Phaser.js game structure with mock API endpoints, but lacks the core drawing functionality, proper data models, Redis storage, and scoring system required by the design.

## Implementation Strategy
This plan follows a **UI-first approach** where visual, interactive features are implemented before backend logic. This allows for:
- Immediate visual feedback during development
- Early user testing and iteration
- Progressive enhancement from mock to real functionality
- Easier debugging with visible results

The phases progress from:
1. **Visual Foundation** → See drawing and playback working
2. **Data Models** → Structure the data properly
3. **Server Integration** → Replace mocks with real APIs
4. **Redis Storage** → Add production persistence
5. **Security** → Validation and filtering
6. **Testing** → Comprehensive test coverage

## Core Implementation Tasks

### Phase 0: Initial Setup and Branding

- [x] 0. Configure game branding and initial setup
- [x] 0.1 Remove Phaser default branding
  - Remove or hide Phaser logo from boot/preloader
  - Customize boot screen background
  - Remove default Phaser template assets if any
  - _Requirements: Initial setup_

- [x] 0.2 Design and implement custom title screen
  - Create custom title screen with game branding ("What Did I Draw?" or similar)
  - Add custom background color/design matching game theme
  - Design main menu buttons with consistent visual style
  - Implement custom font/typography if needed
  - Add basic animations or visual polish to title screen
  - Ensure mobile-friendly layout and touch targets
  - _Requirements: 10.1, UX consistency_

### Phase 1: Visual Foundation

- [x] 1. Create drawing canvas system (Visual feedback immediately)
- [x] 1.1 Implement basic Phaser drawing scene
  - Create new DrawingScene in Phaser
  - Set up 360x360px canvas
  - Wire up to main menu "Create Drawing" button
  - Basic mouse/touch drawing (simple lines first)
  - _Requirements: 1.1, 10.1_

- [x] 1.2 Add drawing tools UI
  - Add color palette (8 colors) with visual buttons
  - Add brush size selector (5 sizes) with preview
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 1.3 Implement stroke capture and undo
  - Capture stroke data in memory (coordinates, color, width)
  - Implement undo functionality with visual feedback
  - Add stroke counter display
  - Store strokes temporarily in component state
  - _Requirements: 1.2, 1.3, 1.10_

- [x] 1.4 Add answer and hint input UI
  - Add "Finish" button to complete drawing (triggers answer/hint input modal/screen)
  - Create form for answer input (1-50 chars, required) shown after clicking "Finish"
  - Create form for hint input (0-100 chars, optional) shown after clicking "Finish"
  - Add character counter for both fields
  - Show inline validation feedback
  - Display UTF-8 character support message
  - Return to title screen after submitting answer and hint
  - _Requirements: 1.6, 1.7, 1.8, 7.2_

- [x] 1.4.1 Add back button and layout optimization
  - Add "Back" button in top-left corner of drawing scene
  - Size back button smaller than primary UI elements to avoid interference
  - Ensure back button doesn't overlap with drawing tools or canvas
  - Position back button with appropriate padding (e.g., 10-15px from edges)
  - _Requirements: 10.5, 10.6, 10.7_

- [x] 1.4.2 Implement responsive layout for mobile and desktop
  - Design layout to prevent horizontal scrolling on all screen sizes
  - Ensure drawing tools, canvas, and buttons don't overlap on mobile (below 768px)
  - Stack UI elements vertically on narrow screens if needed
  - Test layout on common mobile screen widths (320px, 375px, 414px, 768px)
  - Test layout on desktop screen widths (1024px, 1440px, 1920px)
  - Ensure all interactive elements remain accessible without overlap
  - Use flexible positioning (flexbox/grid) for adaptive layouts
  - _Requirements: 5.2, 5.3, 5.5, 5.6, 5.7_

- [x] 1.5 Test Phase 1 implementation
  - Verify drawing canvas initializes correctly (360x360px)
  - Test mouse and touch drawing functionality
  - Test all drawing tools (color palette, brush sizes)
  - Test stroke capture stores correct data (coordinates, color, width)
  - Test undo functionality removes last stroke correctly
  - Test stroke counter updates accurately
  - Test "Finish" button appears and is clickable
  - Verify clicking "Finish" opens answer/hint input form
  - Test answer input validation (1-50 chars, required field)
  - Test hint input validation (0-100 chars, optional field)
  - Test character counter displays correctly for both fields
  - Verify UTF-8 character support message is displayed
  - Test returning to title screen after submitting answer and hint
  - Test "Back" button appears in top-left corner
  - Verify back button is smaller than primary UI elements
  - Test back button doesn't overlap with drawing tools or canvas
  - Test back button returns to title screen
  - Test layout on mobile screen widths (320px, 375px, 414px, 768px)
  - Test layout on desktop screen widths (1024px, 1440px, 1920px)
  - Verify no horizontal scrolling on any screen size
  - Verify no UI element overlaps on mobile or desktop
  - Test UI elements stack properly on narrow screens
  - Verify all interactive elements remain accessible on all screen sizes
  - _Requirements: 1.1-1.8, 5.2-5.4, 10.1, 10.2, 10.6_

### Phase 2: Playback System

- [x] 2. Create playback and quiz system
- [x] 2.1 Implement basic playback viewer
  - Create quiz scene with canvas display
  - Load and replay hardcoded stroke data
  - Add play/pause buttons
  - Show progress bar
  - _Requirements: 2.1, 2.3_

- [x] 2.1.1 Implement stroke timing system
  - Extract timestamp data from each stroke
  - Calculate playback delays between consecutive strokes
  - Use requestAnimationFrame for smooth rendering
  - Preserve original drawing timing during replay
  - Handle pause/resume state during playback
  - Communicate stroke progress to Quiz_Interface in real-time
  - _Requirements: 2.1, 8.5_

- [x] 2.2 Add quiz interaction
  - Add guess input field below canvas
  - Display hint if available (from drawing metadata)
  - Implement mock answer checking (hardcoded answers)
  - Show correct/incorrect feedback
  - Display answer after incorrect guess or completion
  - _Requirements: 2.2, 2.4, 2.5_

- [x] 2.3 Add score display
  - Show score breakdown (base points / time bonus)
  - Display total score prominently
  - Calculate and show elapsed time
  - Display viewed stroke count
  - _Requirements: 3.3, 4.3_

- [x] 2.4 Implement leaderboard UI
  - Create LeaderboardScene in Phaser
  - Display top 5 scores per drawing with mock data
  - Show score breakdown for each entry (base + time bonus)
  - Display user's rank if in top 5
  - Add navigation from quiz results to leaderboard
  - Show username for each score entry
  - Handle "no scores yet" empty state
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.5 Test Phase 2 implementation
  - Verify quiz scene loads and displays canvas correctly
  - Test playback replays hardcoded stroke data accurately
  - Test play/pause button functionality
  - Verify progress bar updates during playback
  - Test stroke timing system preserves original drawing timing
  - Verify requestAnimationFrame provides smooth rendering
  - Test pause/resume state transitions
  - Test stroke progress communication in real-time
  - Test guess input field accepts user input
  - Verify hint displays correctly when available
  - Test answer checking with mock data (correct/incorrect feedback)
  - Verify answer is displayed after incorrect guess or completion
  - Test score display shows breakdown (base + time bonus)
  - Verify elapsed time calculation is accurate
  - Test viewed stroke count displays correctly
  - Test leaderboard scene displays top 5 scores with mock data
  - Verify score breakdown displays for each leaderboard entry
  - Test user rank display when in top 5
  - Verify "no scores yet" empty state displays correctly
  - Test navigation from quiz results to leaderboard
  - _Requirements: 2.1-2.5, 3.3, 4.1-4.4, 8.5_

### Phase 3: Data Models and Backend (Now add the real logic)

- [x] 3. Implement data models
- [x] 3.1 Create proper TypeScript interfaces
  - Add Stroke and Point interfaces
  - Add Drawing interface with metadata (id, createdBy, createdAt, answer, hint, strokes, totalStrokes)
  - Add Score interface with breakdown (id, drawingId, userId, score, baseScore, timeBonus, elapsedTime, viewedStrokes, submittedAt)
  - Update existing mock data to use new types
  - Ensure hint is optional field in Drawing interface
  - _Requirements: 1.2, 1.9, 3.1, 3.2, 3.3, 8.1_

- [x] 3.2 Add basic validation (client-side first)
  - Validate stroke count (1-1000)
  - Validate coordinates within bounds (360x360)
  - Check answer length (1-50 chars)
  - Simple text sanitization (remove HTML tags)
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 3.3 Test Phase 3 implementation
  - Verify Stroke and Point interfaces are properly defined
  - Test Drawing interface includes all required metadata fields
  - Test Score interface includes breakdown fields (base, time bonus, etc.)
  - Verify hint is optional in Drawing interface
  - Test mock data uses new TypeScript types correctly
  - Test stroke count validation (1-1000 range)
  - Verify coordinates are validated within canvas bounds (360x360)
  - Test answer length validation (1-50 chars)
  - Test hint length validation (0-100 chars)
  - Verify text sanitization removes HTML tags
  - Test validation error messages are user-friendly
  - Verify TypeScript compiler catches type errors
  - _Requirements: 1.6-1.8, 6.2, 7.2-7.4, 8.1_

### Phase 4: Server Integration (Replace mocks with real API)

- [x] 4. Update server endpoints
- [x] 4.1 Implement drawing save endpoint
  - Replace mock POST /api/drawing
  - Add basic validation server-side
  - Generate simple ID (timestamp for now)
  - Store in memory/JSON file temporarily
  - _Requirements: 8.1, 8.2_

- [x] 4.2 Implement drawing retrieval
  - Replace mock GET /api/drawing
  - Return saved drawings from storage
  - Add random selection logic
  - Handle "no drawings" case
  - _Requirements: 8.3, 8.4_

- [x] 4.3 Implement scoring endpoint
  - Replace mock POST /api/guess or POST /api/scores
  - Calculate real scores: base = (total - viewed) × 100
  - Calculate time bonus: max(0, (60 - elapsed) × 10)
  - Store scores in memory for now
  - Return score breakdown (base + time bonus)
  - Return updated rankings and user's rank
  - _Requirements: 3.1, 3.2, 3.3, 8.6, 8.7, 8.8_

- [x] 4.4 Implement leaderboard endpoint
  - Create GET /api/leaderboard/:id
  - Return top 5 scores for a drawing
  - Include score breakdown for each entry (base + time bonus)
  - Include username, total score, and submission time
  - Handle "no scores yet" case
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 4.5 Test Phase 4 implementation
  - Test POST /api/drawing saves drawing correctly
  - Verify server-side validation rejects invalid stroke counts
  - Test ID generation creates unique IDs
  - Verify drawings are stored in memory/JSON file correctly
  - Test GET /api/drawing returns saved drawings
  - Verify random selection logic works correctly
  - Test "no drawings" case returns appropriate response
  - Test drawing retrieval with valid and invalid IDs
  - Test POST /api/scores calculates base score correctly: (total - viewed) × 100
  - Test time bonus calculation: max(0, (60 - elapsed) × 10)
  - Verify score breakdown is returned correctly
  - Test score storage in memory
  - Verify rankings are updated after score submission
  - Test user's rank is calculated correctly
  - Test GET /api/leaderboard/:id returns top 5 scores
  - Verify score breakdown is included for each entry
  - Test username, total score, and submission time are included
  - Verify "no scores yet" case is handled correctly
  - Test all endpoints handle errors gracefully
  - Verify API responses match expected format
  - _Requirements: 3.1-3.3, 4.1-4.3, 8.1-8.8_

- [x] 4.6 Integrate client with server APIs
  - [x] 4.6.1 Update Drawing.ts to save via API
    - Replace localStorage.setItem in saveDrawing() method (line 455-468)
    - Implement fetch POST to /api/drawing endpoint
    - Send drawing data including answer, hint, strokes, totalStrokes, createdBy, createdAt
    - Handle API response and store drawingId returned from server
    - Display success/error messages to user
    - Add loading state during API call
    - Implement error handling with user-friendly messages
    - Keep localStorage as fallback for offline mode (optional)
    - _Requirements: 8.1, 8.2_
    - _Files: src/client/game/scenes/Drawing.ts_

  - [x] 4.6.2 Update Quiz.ts to load drawings via API
    - Replace localStorage.getItem in create() method (line 62-69)
    - Implement fetch GET to /api/drawing endpoint (or /api/drawing/random)
    - Handle "no drawings available" case with user-friendly message
    - Parse and validate drawing data structure
    - Store drawing metadata (id, answer) for later score submission
    - Add loading indicator while fetching drawing
    - Implement retry logic on failure (3 attempts with exponential backoff)
    - _Requirements: 8.3, 8.4_
    - _Files: src/client/game/scenes/Quiz.ts_

  - [x] 4.6.3 Update Quiz.ts to submit guesses via API
    - Add fetch POST to /api/scores in handleGuessSubmit() method
    - Send guess text, drawingId, elapsed time, and viewed stroke count
    - Receive score breakdown (baseScore, timeBonus, totalScore) from server
    - Receive updated rankings and user's rank
    - Display score results to user
    - Navigate to leaderboard with score data
    - Handle incorrect guess feedback
    - Pause playback during guess submission
    - _Requirements: 8.6, 8.7, 8.8_
    - _Files: src/client/game/scenes/Quiz.ts_

  - [x] 4.6.4 Update Leaderboard.ts to load scores via API
    - Replace mock data in loadLeaderboard() method (line 59-68)
    - Implement fetch GET to /api/leaderboard/:drawingId endpoint
    - Display real score data with breakdown (base + time bonus)
    - Show username, total score, and submission time for each entry
    - Handle empty leaderboard case with "No scores yet" message
    - Highlight current user's rank if in top 5
    - Add loading indicator while fetching leaderboard
    - Implement refresh functionality to reload leaderboard
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.8_
    - _Files: src/client/game/scenes/Leaderboard.ts_

  - [x] 4.6.5 Add error handling for API calls
    - Implement centralized API client utility (optional)
    - Add network timeout handling (30 seconds per request)
    - Implement retry logic with exponential backoff (1s, 2s, 4s)
    - Display user-friendly error messages for different error types
    - Handle network failures gracefully
    - Handle server errors (4xx, 5xx status codes)
    - Handle JSON parse errors
    - Add fallback to localStorage on API failure (optional)
    - Log errors to console for debugging
    - _Requirements: 9.7_
    - _Files: src/client/game/scenes/Drawing.ts, Quiz.ts, Leaderboard.ts_

  - [x] 4.6.6 Test Phase 4.6 implementation
    - Test drawing save via POST /api/drawing from Drawing.ts
    - Verify drawingId is returned and stored correctly
    - Test drawing load via GET /api/drawing from Quiz.ts
    - Verify drawing data is parsed and displayed correctly
    - Test guess submission via POST /api/scores from Quiz.ts
    - Verify score calculation and display is correct
    - Test leaderboard load via GET /api/leaderboard/:id from Leaderboard.ts
    - Verify top 5 scores are displayed with correct data
    - Test error handling for network failures
    - Test error handling for invalid API responses
    - Test retry logic with simulated failures
    - Verify timeout handling (30 seconds)
    - Test full flow: create drawing → save via API → load in quiz → submit guess → view leaderboard
    - Verify data consistency: client → server → storage → server → client
    - Test on different network conditions (slow, offline, intermittent)
    - _Requirements: 8.1-8.8, 9.7_

### Phase 5: Redis and Production Features (Make it production-ready)

- [x] 5. Add Redis storage
- [x] 5.1 Set up Redis connection
  - Configure Redis client for Devvit
  - Implement connection error handling
  - Create key naming schema
  - Test basic operations
  - _Requirements: 6.3_

- [x] 5.2 Migrate to Redis storage
  - Move drawing storage to Redis
  - Implement ID generation with INCR
  - Add score storage in Redis
  - Create leaderboard with sorted sets
  - _Requirements: 6.3, 3.4, 3.5, 8.1_

- [x] 5.3 Add data compression
  - Implement coordinate rounding (3→1 decimal)
  - Shorten property names
  - Verify compression ratio
  - Update decompression for client
  - _Requirements: 6.1, 6.2_

- [x] 5.4 Implement atomic updates
  - Add WATCH/MULTI/EXEC for scores and leaderboard updates
  - Check existing score before update (only update if new score is higher)
  - Keep only highest score per user per drawing
  - Implement retry mechanism (up to 3 attempts with 10ms exponential backoff)
  - Update leaderboard in same transaction using ZADD
  - Trim leaderboard to top 5 using ZREMRANGEBYRANK
  - Handle concurrent submissions safely
  - Test race conditions
  - _Requirements: 3.4, 9.2, 9.3, 9.4_

- [x] 5.5 Test Phase 5 implementation
  - Test Redis client connection for Devvit
  - Verify connection error handling works correctly
  - Test key naming schema follows conventions
  - Verify basic Redis operations (GET, SET, DEL, INCR)
  - Test drawing storage in Redis
  - Test ID generation with INCR
  - Verify score storage in Redis
  - Test leaderboard creation with sorted sets (ZADD, ZRANGE)
  - Test coordinate rounding (3 decimals → 1 decimal)
  - Test property name shortening
  - Verify compression ratio meets target (30-40% reduction)
  - Test decompression on client correctly restores data
  - Test WATCH/MULTI/EXEC transaction for atomic updates
  - Verify existing score check (only update if higher)
  - Test retry mechanism (3 attempts with exponential backoff)
  - Test leaderboard update in same transaction
  - Verify ZREMRANGEBYRANK trims to top 5 correctly
  - Test concurrent score submissions don't create conflicts
  - Verify race condition handling
  - Test Redis failures trigger appropriate error handling
  - _Requirements: 3.4, 4.1, 6.1-6.3, 9.2-9.4_

### Phase 6: Security and Validation

- [x] 6. Add security features
- [x] 6.1 Implement profanity filter
  - Install bad-words npm package
  - Configure filter with default dictionary
  - Add UTF-8 support for international text
  - Test with sample inputs
  - _Requirements: 7.1, 7.2_

- [x] 6.1.1 Test international character support (UTF-8)
  - Test Japanese and Chinese and Korean characters in answers and hints
  - Test emoji support (e.g., 🎨, 🖌️, 😀) in text fields
  - Verify character counting accuracy (1 emoji = 1 character, not byte count)
  - Test display rendering across different browsers and devices
  - Verify profanity filter doesn't incorrectly flag non-English text
  - Test text input handling on mobile keyboards (IME support)
  - _Requirements: 7.2 (UTF-8 support)_

- [x] 6.2 Add comprehensive validation
  - Implement full input validation utilities
  - Add text sanitization (XSS prevention)
  - Validate all user inputs
  - Add server-side validation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6.3 Test Phase 6 implementation
  - Test bad-words package installation and configuration
  - Verify profanity filter with default dictionary
  - Test profanity filter catches inappropriate words
  - Verify UTF-8 support for international text
  - Test Japanese characters in answers and hints
  - Test Chinese characters in answers and hints
  - Test Korean characters in answers and hints
  - Test emoji support (🎨, 🖌️, 😀) in text fields
  - Verify character counting accuracy (1 emoji = 1 char, not bytes)
  - Test display rendering across browsers (Chrome, Firefox, Safari)
  - Test display rendering on mobile devices
  - Verify profanity filter doesn't incorrectly flag non-English text
  - Test text input with IME support (mobile keyboards)
  - Test full input validation utilities
  - Verify text sanitization prevents XSS attacks
  - Test script tag injection is blocked
  - Test HTML entity encoding works correctly
  - Verify all user inputs (answer, hint, strokes) are validated
  - Test server-side validation matches client-side rules
  - Test validation error messages are descriptive
  - _Requirements: 7.1-7.5_

### Phase 7: User Profile, Quiz History, and Global Ranking

- [ ] 7. Enhance leaderboard with Reddit user profiles, quiz history, and global rankings
- [x] 7.1 Add Reddit user profile display to leaderboards
  - Fetch Reddit user avatar/icon from Reddit API
  - Display user avatar (32x32px or 40x40px) next to username in leaderboards
  - Format username with Reddit style (u/username)
  - Add fallback default avatar if user avatar unavailable
  - Implement avatar caching to reduce API calls (TTL: 1 hour)
  - Update drawing leaderboard (top 5 per drawing) to show avatars
  - _Requirements: 11.1, 11.2_

- [x] 7.1.1 Update title screen with ranking navigation buttons
  - Add "Ranking" button to title screen (navigates to global ranking)
  - Add "My History" button to title screen
  - Size both buttons smaller than primary action buttons (~60-70% size)
  - Position buttons horizontally aligned below main action buttons
  - Update TitleScene layout to accommodate new navigation buttons
  - Test button layout on mobile and desktop screen sizes
  - _Requirements: Title screen UI, navigation_

- [x] 7.2 Implement quiz history leaderboard (user's personal quiz history)
  - Create new QuizHistoryScene in Phaser
  - Create GET /api/user/:userId/quiz-history endpoint
  - Return list of all quizzes user has answered with scores
  - Display list with: drawing answer (or title), score, rank, answered date
  - Sort by most recent first (descending by submittedAt)
  - Add pagination if user has answered many quizzes (10 per page)
  - Include "View Leaderboard" button to navigate to specific drawing's leaderboard
  - Show "No quizzes answered yet" empty state
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 7.2.1 Implement global ranking (player total score rankings)
  - Create new GlobalRanking scene in Phaser
  - Create GET /api/leaderboard/global endpoint
  - Calculate total score for each player (sum of all best quiz scores)
  - Return list with: userId, totalScore, quizCount, rank
  - Fetch Reddit user profiles (avatars) for displayed players
  - Display players sorted by total score (descending)
  - Show player's rank, avatar (32x32px or 40x40px), username (u/username), total score, quiz count
  - Highlight current user's rank if in ranking
  - Support pagination (default: top 50 players, configurable)
  - Implement caching with 5-minute TTL to reduce load
  - Show "No players yet. Be the first!" empty state
  - Add "Back" button to return to title screen
  - _Requirements: Global ranking UI and functionality_

- [x] 7.3 Add Redis storage for quiz history and global ranking
  - Store user quiz history in Redis sorted set: `user:{userId}:quiz-history`
  - Score: timestamp (for chronological sorting)
  - Member: JSON string with {drawingId, score, baseScore, timeBonus, rank, submittedAt}
  - Update sorted set atomically when score is submitted
  - Implement retrieval with ZREVRANGE for recent-first order
  - Store global ranking in Redis sorted set: `global:leaderboard`
  - Score: user's total score (sum of all best quiz scores)
  - Member: userId
  - Store player stats in Redis hash: `player:{userId}:stats`
  - Fields: totalScore, quizCount, lastUpdated
  - Update global ranking and player stats atomically in score submission transaction
  - Calculate score difference when updating (subtract old score, add new score)
  - Increment quiz count only for first-time quiz answers (not for improved scores)
  - Implement cache for global ranking: `cache:global-leaderboard:{limit}`
  - Cache TTL: 5 minutes
  - Invalidate cache on any score update (DEL cache:global-leaderboard:*)
  - _Requirements: 11.3, 11.4, Global ranking storage_

- [x] 7.3.1 Rename Global Leaderboard to Global Ranking for better clarity
  - Rename GlobalLeaderboard.ts file to GlobalRanking.ts
  - Update class name from `GlobalLeaderboard` to `GlobalRanking`
  - Update scene name from `'GlobalLeaderboard'` to `'GlobalRanking'`
  - Update title display text from `'Leaderboard'` to `'Global Ranking'`
  - Update main.ts import statement and scene registration
  - Update MainMenu.ts button text from `'Leaderboard'` to `'Ranking'`
  - Update MainMenu.ts scene.start() call to use `'GlobalRanking'`
  - Update requirements.md: Change all "global leaderboard" references to "global ranking"
  - Update requirements.md: Update Requirement 12 and 13 acceptance criteria
  - Update requirements.md: Change "Leaderboard" button to "Ranking" button
  - Update tasks.md: Change all "global leaderboard" references to "global ranking" in Phase 7
  - _Requirements: UI clarity, consistent terminology_

- [ ] 7.4 Test Phase 7 implementation
  - Test Reddit user avatar fetching from API
  - Verify avatar display in drawing leaderboards (32x32px or 40x40px)
  - Test username formatting as u/username
  - Verify default avatar fallback when user avatar unavailable
  - Test avatar caching reduces redundant API calls (TTL: 1 hour)
  - Test "Leaderboard" button appears on title screen
  - Test "My History" button appears on title screen
  - Test button sizes are smaller than primary action buttons (~60-70%)
  - Test buttons are horizontally aligned and positioned correctly
  - Test button layout on mobile and desktop screen sizes
  - Test QuizHistoryScene displays user's answered quizzes
  - Verify quiz history sorted by most recent first
  - Test pagination for quiz history (10 per page)
  - Verify "No quizzes answered yet" empty state
  - Test navigation from quiz result to QuizHistoryScene
  - Verify quiz result summary displays correctly
  - Test "View Leaderboard" button navigation from quiz history
  - Test "Play Another Quiz" button starts new quiz
  - Test "Create Drawing" button navigates to drawing mode
  - Test GlobalRanking scene displays top players by total score
  - Verify GET /api/leaderboard/global endpoint returns correct data
  - Test global ranking sorted by total score (descending)
  - Verify player's rank, avatar, username, total score, quiz count display correctly
  - Test current user's rank is highlighted if in ranking
  - Test pagination for global ranking (default: top 50)
  - Verify "No players yet. Be the first!" empty state
  - Test "Back" button navigates to title screen from global ranking
  - Test "My History" button in LeaderboardScene navigates to QuizHistoryScene
  - Verify "My History" button is positioned correctly (top-right, same row as Back)
  - Test "My History" button on mobile and desktop screen sizes
  - Verify "My History" button doesn't overlap with other UI elements
  - Test Redis sorted set stores quiz history correctly
  - Verify ZREVRANGE retrieves history in correct order
  - Test global ranking Redis sorted set (`global:leaderboard`) stores correctly
  - Test player stats Redis hash (`player:{userId}:stats`) stores correctly
  - Verify atomic updates include global ranking and player stats
  - Test score difference calculation when updating (old score subtracted, new added)
  - Verify quiz count increments only for first-time answers
  - Test global ranking cache (TTL: 5 minutes) works correctly
  - Verify cache invalidation on score update
  - Test atomic updates when score is submitted
  - Test quiz history persistence across sessions
  - Verify data consistency between scores, quiz history, and global ranking
  - Test concurrent quiz submissions don't corrupt history or global ranking
  - Test global ranking updates correctly when multiple users submit scores
  - _Requirements: 11.1-11.8, Global ranking requirements_