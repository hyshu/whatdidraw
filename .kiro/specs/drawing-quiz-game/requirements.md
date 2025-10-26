# Requirements Document

## Introduction

What Did I Draw is a drawing quiz game application that runs on Reddit's Devvit platform. Users create drawings with answers and hints, while other users attempt to guess what was drawn by watching the drawing process replay in stages. The system includes scoring and per-drawing rankings integrated with Reddit's user system.

## Glossary

- **Drawing_System**: The canvas-based drawing interface that captures user strokes and metadata
- **Playback_System**: The stroke replay engine that shows drawings being created over time
- **Scoring_System**: The algorithm that calculates points based on guess timing and accuracy
- **Storage_System**: The Redis-based data persistence layer for drawings and scores
- **Quiz_Interface**: The user interface for viewing and guessing drawings
- **Canvas**: The 600x400px HTML5 drawing surface
- **Stroke**: A continuous drawing action with points, color, width, and timing data
- **Guess_Session**: A user's attempt to identify a drawing during playback

## Requirements

### Requirement 1

**User Story:** As a player, I want to create drawings with answers and hints, so that other users can enjoy guessing what I drew.

#### Acceptance Criteria

1. WHEN a user accesses drawing mode, THE Drawing_System SHALL provide a 600x400px canvas for drawing
2. WHILE drawing, THE Drawing_System SHALL capture stroke data including coordinates, color, width, and timestamps
3. THE Drawing_System SHALL provide drawing tools including pen, eraser, undo, and clear functions
4. THE Drawing_System SHALL offer 8 color options (black, red, green, blue, yellow, magenta, cyan, white)
5. THE Drawing_System SHALL provide 5 brush sizes (1px, 3px, 5px, 8px, 12px)
6. WHEN saving a drawing, THE Drawing_System SHALL require an answer between 1-50 characters
7. WHERE a hint is provided, THE Drawing_System SHALL accept hints up to 100 characters
8. THE Drawing_System SHALL limit drawings to a maximum of 1000 strokes to prevent performance issues

### Requirement 2

**User Story:** As a player, I want to watch drawings being created step-by-step and guess what they represent, so that I can participate in the quiz game.

#### Acceptance Criteria

1. WHEN viewing a quiz, THE Playback_System SHALL replay drawing strokes in chronological order
2. THE Quiz_Interface SHALL allow users to submit guesses at any point during playback
3. THE Playback_System SHALL provide play/pause controls and progress indication
4. WHEN a guess is submitted, THE Quiz_Interface SHALL provide immediate feedback on correctness
5. THE Quiz_Interface SHALL display the correct answer after an incorrect guess or completion

### Requirement 3

**User Story:** As a player, I want to earn points based on how quickly and efficiently I guess drawings, so that I can compete with others.

#### Acceptance Criteria

1. WHEN a correct guess is made, THE Scoring_System SHALL calculate base score as (total strokes - viewed strokes) × 100
2. WHEN a correct guess is made, THE Scoring_System SHALL calculate time bonus as max(0, (60 - elapsed seconds) × 10)
3. THE Scoring_System SHALL combine base score and time bonus for total score
4. THE Storage_System SHALL record the user's score with drawing ID and timestamp, keeping only the highest score per user per drawing
5. THE Scoring_System SHALL maintain rankings per drawing showing top 5 scores

### Requirement 4

**User Story:** As a player, I want to see leaderboards for each drawing, so that I can see how I compare to other players on specific drawings.

#### Acceptance Criteria

1. THE Quiz_Interface SHALL display top 5 scores for each drawing
2. THE Storage_System SHALL maintain user score history across all drawings
3. THE Quiz_Interface SHALL show score breakdown including base points and time bonus
4. THE Quiz_Interface SHALL display the user's rank within the top 5 if applicable

### Requirement 5

**User Story:** As a player, I want the game to work smoothly on mobile devices, so that I can play anywhere.

#### Acceptance Criteria

1. THE Drawing_System SHALL support touch input for mobile devices
2. THE Quiz_Interface SHALL adapt layout for screen sizes below 768px
3. THE Drawing_System SHALL provide appropriately sized UI elements for touch interaction
4. THE Quiz_Interface SHALL remain fully functional on mobile browsers

### Requirement 6

**User Story:** As a system administrator, I want drawing and score data to be efficiently stored and retrieved, so that the game performs well at scale.

#### Acceptance Criteria

1. THE Storage_System SHALL compress drawing data before Redis storage
2. THE Storage_System SHALL achieve 30-40% size reduction through coordinate rounding and property shortening
3. THE Storage_System SHALL use efficient Redis key structures for drawings, scores, and rankings
4. THE Storage_System SHALL maintain data integrity across all operations
5. THE Storage_System SHALL provide fast retrieval for random drawings and top scores

### Requirement 7

**User Story:** As a content moderator, I want inappropriate content to be filtered, so that the game remains family-friendly.

#### Acceptance Criteria

1. THE Drawing_System SHALL validate answer text against profanity filters
2. THE Drawing_System SHALL enforce character limits on answers (1-50 chars) and hints (0-100 chars), supporting UTF-8 characters
3. THE Storage_System SHALL sanitize all text input to prevent XSS attacks by removing HTML/script tags
4. THE Drawing_System SHALL require minimum drawing activity (at least 1 stroke) and maximum 1000 strokes
5. THE Quiz_Interface SHALL escape all user-generated content for safe display

### Requirement 8

**User Story:** As a developer, I want system components to integrate seamlessly, so that data flows correctly between drawing creation, storage, playback, and scoring.

#### Acceptance Criteria

1. WHEN a drawing is saved in Drawing_System, THE Storage_System SHALL immediately persist all stroke data, metadata, answer, and hint with a unique drawing ID
2. THE Storage_System SHALL provide the drawing ID back to Drawing_System for user confirmation
3. WHEN Quiz_Interface requests a drawing, THE Storage_System SHALL retrieve and provide complete drawing data to Playback_System
4. THE Playback_System SHALL initialize with drawing data from Storage_System and notify Quiz_Interface when ready for user interaction
5. DURING playback, THE Playback_System SHALL communicate stroke progress to Quiz_Interface for real-time UI updates
6. WHEN a guess is submitted in Quiz_Interface, THE Scoring_System SHALL receive guess text, elapsed time, and viewed stroke count from both Quiz_Interface and Playback_System
7. AFTER score calculation, THE Scoring_System SHALL send score data to Storage_System for persistence and ranking updates
8. THE Storage_System SHALL return updated rankings to Quiz_Interface for immediate display

### Requirement 9

**User Story:** As a user, I want consistent data synchronization across all game features, so that my drawings, scores, and progress are always up-to-date.

#### Acceptance Criteria

1. THE Storage_System SHALL ensure atomic operations for all drawing saves and score updates
2. WHEN multiple users guess the same drawing simultaneously, THE Scoring_System SHALL handle concurrent score submissions without data loss using Redis WATCH/MULTI/EXEC
3. THE Storage_System SHALL maintain data consistency between individual drawing scores and per-drawing rankings
4. WHEN a user's score is updated, THE Storage_System SHALL update the per-drawing leaderboard in a single atomic transaction
5. THE Quiz_Interface SHALL display current rankings after score submission
6. THE Storage_System SHALL validate all inter-component data transfers against expected schemas
7. WHEN any component fails to process data, THE system SHALL provide appropriate error handling and user feedback

### Requirement 10

**User Story:** As a player, I want smooth navigation between creating drawings and playing quizzes, so that I can seamlessly switch between different game modes.

#### Acceptance Criteria

1. THE Quiz_Interface SHALL provide direct navigation to Drawing_System for creating new drawings
2. AFTER saving a drawing, THE Drawing_System SHALL offer options to create another drawing or play available quizzes
3. THE Quiz_Interface SHALL maintain user session state when transitioning between drawing and guessing modes using localStorage
4. WHEN returning from Drawing_System to Quiz_Interface, THE system SHALL preserve any in-progress quiz state
5. THE Storage_System SHALL track drawing creation and quiz attempts for each user
6. THE system SHALL provide a unified navigation structure with three main modes: Create Drawing, Play Quiz, and per-drawing Leaderboards
7. THE Reddit integration SHALL maintain user authentication across all system components