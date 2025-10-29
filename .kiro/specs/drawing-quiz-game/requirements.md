# Requirements Document

## Introduction

What Did I Draw is a drawing quiz game application that runs on Reddit's Devvit platform. Users create drawings with answers and hints, while other users attempt to guess what was drawn by watching the drawing process replay in stages. The system includes scoring and per-drawing rankings integrated with Reddit's user system.

## Glossary

- **Drawing_System**: The canvas-based drawing interface that captures user strokes and metadata
- **Playback_System**: The stroke replay engine that shows drawings being created over time
- **Scoring_System**: The algorithm that calculates points based on guess timing and accuracy
- **Storage_System**: The Redis-based data persistence layer for drawings and scores
- **Quiz_Interface**: The user interface for viewing and guessing drawings
- **Canvas**: The 360x360px HTML5 drawing surface
- **Stroke**: A continuous drawing action with points, color, width, and timing data
- **Guess_Session**: A user's attempt to identify a drawing during playback

## Requirements

### Requirement 1

**User Story:** As a player, I want to create drawings with answers and hints, so that other users can enjoy guessing what I drew.

#### Acceptance Criteria

1. WHEN a user accesses drawing mode, THE Drawing_System SHALL provide a 360x360px canvas for drawing
2. WHILE drawing, THE Drawing_System SHALL capture stroke data including coordinates, color, width, and timestamps
3. THE Drawing_System SHALL provide drawing tools including pen and undo functions
4. THE Drawing_System SHALL offer 8 color options (black, red, green, blue, yellow, magenta, cyan, white)
5. THE Drawing_System SHALL provide 5 brush sizes (1px, 3px, 5px, 8px, 12px)
6. THE Drawing_System SHALL provide a "Finish" button to complete the drawing and trigger the answer/hint input workflow
7. WHEN the "Finish" button is clicked, THE Drawing_System SHALL display a form for answer (1-50 chars, required) and hint (0-100 chars, optional) input
8. AFTER submitting answer and hint, THE Drawing_System SHALL return the user to the title screen
9. WHERE a hint is provided, THE Drawing_System SHALL accept hints up to 100 characters
10. THE Drawing_System SHALL limit drawings to a maximum of 1000 strokes to prevent performance issues

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
3. THE Drawing_System SHALL provide appropriately sized UI elements for touch interaction (minimum 44px)
4. THE Quiz_Interface SHALL remain fully functional on mobile browsers
5. THE system SHALL prevent UI element overlap on all screen sizes (mobile and desktop)
6. THE system SHALL prevent horizontal scrolling on all screen sizes by using responsive layouts
7. THE system SHALL stack UI elements vertically on narrow screens when necessary to maintain usability

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
3. THE Storage_System SHALL sanitize all text input to prevent XSS attacks by removing HTML/script tags before storage
4. THE Drawing_System SHALL require minimum drawing activity (at least 1 stroke) and maximum 1000 strokes
5. THE Drawing_System SHALL remove HTML tags from all user-generated content before storage for XSS protection

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
3. THE Storage_System SHALL track drawing creation and quiz attempts for each user
4. THE system SHALL provide a unified navigation structure with three main modes: Create Drawing, Play Quiz, and per-drawing Leaderboards
5. THE system SHALL provide a "Back" button in the top-left corner of all game screens (drawing, quiz, leaderboard) to return to the previous screen
6. THE "Back" button SHALL be sized smaller than primary UI elements to avoid visual interference
7. THE "Back" button SHALL not overlap with any other UI components or interactive elements

### Requirement 11

**User Story:** As a player, I want to see Reddit user profiles in leaderboards and track my quiz history, so that I can connect with other players and review my past performance.

#### Acceptance Criteria

1. THE Quiz_Interface SHALL display Reddit user avatars (32x32px or 40x40px) next to usernames in all leaderboards
2. THE Quiz_Interface SHALL format usernames using Reddit style (u/username) in leaderboards
3. THE Storage_System SHALL maintain a complete quiz history for each user including drawing ID, score, rank, and submission timestamp
4. THE Quiz_Interface SHALL provide a quiz history view showing all quizzes the user has answered, sorted by most recent first
5. THE quiz history view SHALL display drawing reference (thumbnail or title), score, rank, and answered date for each entry
6. AFTER answering a quiz, THE system SHALL navigate to the quiz history view instead of the drawing leaderboard
7. THE quiz history view SHALL provide navigation to individual drawing leaderboards and options to play another quiz or create a drawing
8. THE drawing leaderboard view SHALL provide a "My History" button in the top-right corner (same row as Back button) to navigate to the user's quiz history view

### Requirement 12

**User Story:** As a player, I want to see global player rankings based on total scores, so that I can compare my overall performance with all players across all quizzes.

#### Acceptance Criteria

1. THE Quiz_Interface SHALL display a global ranking showing top players ranked by total score
2. THE Scoring_System SHALL calculate each player's total score as the sum of their best scores from all unique quizzes answered
3. THE Quiz_Interface SHALL display Reddit user avatars (32x32px or 40x40px) and usernames (u/username format) in the global ranking
4. THE global ranking SHALL show each player's total score, number of quizzes answered, and global rank position
5. THE Quiz_Interface SHALL highlight the current user's rank if they appear in the global ranking
6. THE Storage_System SHALL maintain global player statistics including total score, quiz count, and last updated timestamp
7. THE Storage_System SHALL update the global ranking atomically when any user's score changes
8. THE global ranking SHALL support pagination with configurable limits (default: top 50 players)
9. THE system SHALL implement caching for the global ranking with 5-minute TTL to reduce database load
10. THE system SHALL invalidate the global ranking cache whenever any score is updated
11. THE Quiz_Interface SHALL provide navigation to the global ranking from the title screen via a "Ranking" button
12. THE global ranking SHALL display an empty state message "No players yet. Be the first!" when no scores exist
13. THE global ranking SHALL provide a "Back" button to return to the title screen

### Requirement 13

**User Story:** As a player, I want convenient navigation buttons on the title screen, so that I can easily access my quiz history and the global ranking.

#### Acceptance Criteria

1. THE title screen SHALL display a "Ranking" button that navigates to the global ranking
2. THE title screen SHALL display a "My History" button that navigates to the user's quiz history
3. THE "Ranking" and "My History" buttons SHALL be sized smaller than primary action buttons (approximately 60-70% size)
4. THE "Ranking" and "My History" buttons SHALL be horizontally aligned below the main action buttons
5. THE title screen layout SHALL stack buttons vertically on narrow screens (below 768px) to prevent overlap
6. THE title screen navigation buttons SHALL remain accessible on all screen sizes without causing horizontal scrolling