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
2. **Navigation** → Connect the UI pieces
3. **Data Models** → Structure the data properly
4. **Server Integration** → Replace mocks with real APIs
5. **Redis Storage** → Add production persistence
6. **Polish** → Mobile, errors, performance
7. **Security** → Validation and filtering
8. **Platform** → Devvit/Reddit integration
9. **Testing** → Comprehensive test coverage

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

- [ ] 1. Create drawing canvas system (Visual feedback immediately)
- [ ] 1.1 Implement basic Phaser drawing scene
  - Create new DrawingScene in Phaser
  - Set up 600x400px canvas
  - Wire up to main menu "Create Drawing" button
  - Basic mouse/touch drawing (simple lines first)
  - _Requirements: 1.1, 10.1_

- [ ] 1.2 Add drawing tools UI
  - Add color palette (8 colors) with visual buttons
  - Add brush size selector (5 sizes) with preview
  - Implement pen/eraser mode toggle
  - Add clear canvas button with confirmation
  - _Requirements: 1.3, 1.4, 1.5_

- [ ] 1.3 Implement stroke capture and undo
  - Capture stroke data in memory (coordinates, color, width)
  - Implement undo functionality with visual feedback
  - Add stroke counter display
  - Store strokes temporarily in component state
  - _Requirements: 1.2, 1.8_

- [ ] 1.4 Add answer and hint input UI
  - Create form for answer input (1-50 chars, required)
  - Create form for hint input (0-100 chars, optional)
  - Add character counter for both fields
  - Show inline validation feedback
  - Display UTF-8 character support message
  - _Requirements: 1.6, 1.7, 7.2_

### Phase 2: Playback System

- [ ] 2. Create playback and quiz system
- [ ] 2.1 Implement basic playback viewer
  - Create quiz scene with canvas display
  - Load and replay hardcoded stroke data
  - Add play/pause buttons
  - Show progress bar
  - _Requirements: 2.1, 2.3_

- [ ] 2.1.1 Implement stroke timing system
  - Extract timestamp data from each stroke
  - Calculate playback delays between consecutive strokes
  - Use requestAnimationFrame for smooth rendering
  - Preserve original drawing timing during replay
  - Handle pause/resume state during playback
  - Communicate stroke progress to Quiz_Interface in real-time
  - _Requirements: 2.1, 8.5_

- [ ] 2.2 Add quiz interaction
  - Add guess input field below canvas
  - Display hint if available (from drawing metadata)
  - Implement mock answer checking (hardcoded answers)
  - Show correct/incorrect feedback
  - Display answer after incorrect guess or completion
  - _Requirements: 2.2, 2.4, 2.5_

- [ ] 2.3 Add score display
  - Show score breakdown (base points / time bonus)
  - Display total score prominently
  - Calculate and show elapsed time
  - Display viewed stroke count
  - _Requirements: 3.3, 4.3_

- [ ] 2.4 Implement leaderboard UI
  - Create LeaderboardScene in Phaser
  - Display top 5 scores per drawing with mock data
  - Show score breakdown for each entry (base + time bonus)
  - Display user's rank if in top 5
  - Add navigation from quiz results to leaderboard
  - Show username for each score entry
  - Handle "no scores yet" empty state
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

### Phase 3: Navigation and State (Connect the pieces)

- [ ] 3. Implement navigation between modes
- [ ] 3.1 Connect drawing and quiz scenes
  - Add "Save Drawing" button (saves to localStorage for now)
  - Show confirmation message with drawing ID after save
  - Display "Create Another" and "Play Quiz" options after save
  - Add "Play Quiz" from main menu
  - Create mode switcher in UI
  - _Requirements: 10.1, 10.2, 10.6_

- [ ] 3.2 Add localStorage persistence
  - Auto-save drawing every 5 seconds
  - Restore drawing on page refresh
  - Save quiz progress state
  - Implement session state for navigation (session:lastMode)
  - Clear drawing draft after successful save
  - Clear quiz state on completion or explicit quit
  - _Requirements: 10.3, 10.4, 10.5_

- [ ] 3.2.1 Implement auto-save mechanism
  - Set up setInterval timer (5 seconds) for drawing state
  - Check for stroke changes before saving to avoid unnecessary writes
  - Handle localStorage quota exceeded error gracefully
  - Provide visual feedback on auto-save (e.g., "Draft saved" indicator)
  - Debounce auto-save during rapid drawing to avoid performance impact
  - Clear auto-save timer when leaving drawing mode
  - _Requirements: 10.3, Design: State Management_

- [ ] 3.3 Add navigation prompts
  - Prompt "Save drawing before leaving?" when leaving Create mode with unsaved strokes
  - Display "Play Another" and "Create Drawing" options after quiz completion
  - Add back button to return to previous mode using session:lastMode
  - Implement unified navigation structure (Create / Play / Leaderboard)
  - _Requirements: 10.2, 10.4, 10.6_

### Phase 4: Data Models and Backend (Now add the real logic)

- [ ] 4. Implement data models
- [ ] 4.1 Create proper TypeScript interfaces
  - Add Stroke and Point interfaces
  - Add Drawing interface with metadata (id, createdBy, createdAt, answer, hint, strokes, totalStrokes)
  - Add Score interface with breakdown (id, drawingId, userId, score, baseScore, timeBonus, elapsedTime, viewedStrokes, submittedAt)
  - Update existing mock data to use new types
  - Ensure hint is optional field in Drawing interface
  - _Requirements: 1.6, 1.7, 1.8, 6.2, 8.1_

- [ ] 4.2 Add basic validation (client-side first)
  - Validate stroke count (1-1000)
  - Validate coordinates within bounds
  - Check answer length (1-50 chars)
  - Simple text sanitization (remove HTML tags)
  - _Requirements: 7.2, 7.3, 7.4_

### Phase 5: Server Integration (Replace mocks with real API)

- [ ] 5. Update server endpoints
- [ ] 5.1 Implement drawing save endpoint
  - Replace mock POST /api/drawing
  - Add basic validation server-side
  - Generate simple ID (timestamp for now)
  - Store in memory/JSON file temporarily
  - _Requirements: 8.1, 8.2_

- [ ] 5.2 Implement drawing retrieval
  - Replace mock GET /api/drawing
  - Return saved drawings from storage
  - Add random selection logic
  - Handle "no drawings" case
  - _Requirements: 8.3, 8.4_

- [ ] 5.3 Implement scoring endpoint
  - Replace mock POST /api/guess or POST /api/scores
  - Calculate real scores: base = (total - viewed) × 100
  - Calculate time bonus: max(0, (60 - elapsed) × 10)
  - Store scores in memory for now
  - Return score breakdown (base + time bonus)
  - Return updated rankings and user's rank
  - _Requirements: 3.1, 3.2, 3.3, 8.6, 8.7, 8.8_

- [ ] 5.4 Implement leaderboard endpoint
  - Create GET /api/leaderboard/:id
  - Return top 5 scores for a drawing
  - Include score breakdown for each entry (base + time bonus)
  - Include username, total score, and submission time
  - Handle "no scores yet" case
  - _Requirements: 4.1, 4.2, 4.3_

### Phase 6: Redis and Production Features (Make it production-ready)

- [ ] 6. Add Redis storage
- [ ] 6.1 Set up Redis connection
  - Configure Redis client for Devvit
  - Implement connection error handling
  - Create key naming schema
  - Test basic operations
  - _Requirements: 6.1_

- [ ] 6.2 Migrate to Redis storage
  - Move drawing storage to Redis
  - Implement ID generation with INCR
  - Add score storage in Redis
  - Create leaderboard with sorted sets
  - _Requirements: 6.1, 6.3, 4.1_

- [ ] 6.3 Add data compression
  - Implement coordinate rounding (3→1 decimal)
  - Shorten property names
  - Verify compression ratio
  - Update decompression for client
  - _Requirements: 6.2_

- [ ] 6.4 Implement atomic updates
  - Add WATCH/MULTI/EXEC for scores and leaderboard updates
  - Check existing score before update (only update if new score is higher)
  - Keep only highest score per user per drawing
  - Implement retry mechanism (up to 3 attempts with 10ms exponential backoff)
  - Update leaderboard in same transaction using ZADD
  - Trim leaderboard to top 5 using ZREMRANGEBYRANK
  - Handle concurrent submissions safely
  - Test race conditions
  - _Requirements: 3.4, 9.2, 9.3, 9.4_

### Phase 7: Polish and Optimization

- [ ] 7. Add mobile support
- [ ] 7.1 Implement touch optimization
  - Implement touch event handling with 50ms debouncing
  - Create responsive UI with 44px minimum touch targets
  - Add mobile-specific layout adjustments below 768px
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7.2 Add error handling
  - Add client-side error handling for network timeouts (30 seconds)
  - Implement exponential backoff retry (1s, 2s, 4s, max 3 retries)
  - Implement server-side error responses with proper format (error, message, code, details)
  - Add user-friendly error messages for each error type:
    - Canvas initialization failure: "Unable to load drawing canvas. Please refresh the page."
    - Network timeout: "Connection timeout. Retrying..."
    - Missing drawing (404): "This drawing no longer exists. Try another one."
    - Invalid input (400): Show specific validation message
    - Redis failure (500): "Unable to process request. Please try again."
  - Add localStorage full error handling
  - Provide refresh/retry buttons where appropriate
  - _Requirements: Error handling from design document_

- [ ] 7.3 Add performance optimizations
  - Optimize rendering with requestAnimationFrame
  - Add viewport meta tag for mobile
  - Ensure smooth 60fps operation
  - _Requirements: 5.4, mobile optimization_

- [ ] 7.4 Add caching layer
  - Implement leaderboard cache (5-min TTL)
  - Add frequently accessed drawing cache (10-min TTL)
  - Set up cache invalidation
  - _Requirements: performance optimization_

- [ ] 7.4.1 Implement cache invalidation logic
  - Invalidate leaderboard:{drawingId} cache on new score submission
  - Use Redis DEL to remove cache keys immediately after score update
  - Handle cache miss scenarios by fetching from primary storage
  - Implement lazy refresh: repopulate cache on next request after TTL expiry
  - Track frequently accessed drawings (10+ accesses in last hour) for caching
  - Use cache:leaderboard:{drawingId} and cache:drawing:{drawingId} key patterns
  - _Requirements: Design: Performance Optimization - Caching_

### Phase 8: Security and Validation

- [ ] 8. Add security features
- [ ] 8.1 Implement profanity filter
  - Install bad-words npm package
  - Configure filter with default dictionary
  - Add UTF-8 support for international text
  - Test with sample inputs
  - _Requirements: 7.1, 7.5_

- [ ] 8.1.1 Test international character support (UTF-8)
  - Test Japanese and Chinese and Korean characters in answers and hints
  - Test emoji support (e.g., 🎨, 🖌️, 😀) in text fields
  - Verify character counting accuracy (1 emoji = 1 character, not byte count)
  - Test display rendering across different browsers and devices
  - Verify profanity filter doesn't incorrectly flag non-English text
  - Test text input handling on mobile keyboards (IME support)
  - _Requirements: 7.2 (UTF-8 support)_

- [ ] 8.2 Add comprehensive validation
  - Implement full input validation utilities
  - Add text sanitization (XSS prevention)
  - Validate all user inputs
  - Add server-side validation
  - _Requirements: 7.2, 7.3, 7.4_

### Phase 9: Platform Integration

- [ ] 9. Devvit platform integration
- [ ] 9.1 Configure Devvit environment
  - Set up Devvit app manifest
  - Configure permissions and capabilities
  - Test local Devvit environment
  - _Requirements: platform integration_

- [ ] 9.1.1 Understand Devvit platform constraints
  - Review Devvit Redis API documentation (key patterns, data types, limitations)
  - Understand custom post integration requirements
  - Learn Devvit app lifecycle and state management
  - Identify Devvit-specific performance considerations
  - Review Devvit's bundling and deployment process
  - Understand rate limits and quota restrictions
  - _Requirements: platform integration, Design: Devvit constraints_

- [ ] 9.2 Integrate Reddit authentication
  - Add Reddit user context to all endpoints
  - Implement user identification
  - Test authentication flow
  - _Requirements: 10.7_

- [ ] 9.2.1 Implement Reddit user context extraction
  - Extract username from Devvit context object in all API handlers
  - Pass user ID (username) to drawing save operations (createdBy field)
  - Pass user ID to score submission for attribution
  - Handle unauthenticated users gracefully (display error or prompt login)
  - Test user context persistence across Phaser scene transitions
  - Verify username display in leaderboards matches Reddit user
  - Ensure Reddit session persists throughout app lifecycle
  - _Requirements: 10.7, Design: Reddit Authentication_

### Phase 10: Testing

- [ ] 10. Testing and validation
- [ ] 10.1 Create unit tests
  - Test drawing validation logic (stroke count, bounds, format)
  - Test scoring algorithm (base score, time bonus, edge cases)
  - Test data compression/decompression (round-trip integrity)
  - Test text sanitization (HTML removal, profanity filter, XSS prevention)
  - Test atomic transaction retry logic (success, failure, partial failure)
  - _Requirements: All core requirements_

- [ ] 10.2 Add integration tests
  - Test complete drawing creation flow (save → retrieve with compression)
  - Test full quiz gameplay cycle (load → playback → guess → score)
  - Test score submission → ranking update (atomic operation verification)
  - Test concurrent score submissions (verify atomic updates prevent race conditions)
  - Test localStorage state management (save/restore across transitions)
  - _Requirements: 8.1-8.8, 9.1-9.7_

- [ ] 10.3 Add performance tests
  - Test canvas with 500+ strokes (rendering performance, memory usage)
  - Test concurrent score submissions (10+ simultaneous users on same drawing)
  - Test mobile touch responsiveness (input lag measurement, 60fps target)
  - Test Redis operations (query time under 50ms for 95th percentile)
  - Test compression efficiency (verify 30-40% reduction across sample set)
  - _Requirements: 6.2, Performance optimization requirements_

- [ ] 10.4 Add error handling tests
  - Test network failures (timeout, retry logic, error display)
  - Test invalid inputs (validation messages, submission prevention)
  - Test Redis failures (transaction retries, error recovery)
  - Test concurrent update conflicts (WATCH/MULTI/EXEC behavior)
  - Test localStorage full scenario
  - Test canvas initialization failures
  - _Requirements: Error handling requirements from design_