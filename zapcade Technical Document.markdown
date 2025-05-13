Below is a technical README for the Zapcade project, providing an overview of the project, its file structure, setup instructions, game integration requirements, and development guidelines. This README is tailored for developers who want to understand, run, or extend Zapcade with new games.

---

# Zapcade Technical README

## Overview

Zapcade is a web-based game console that allows users to play multiple games through a unified interface. It supports cross-platform play on mobile, tablets, and desktops, with touch controls (joysticks, buttons) for mobile devices and keyboard/mouse controls for desktops. Games are dynamically loaded from a `games/` directory, and the menu is populated using a `games.json` file, making it easy to add new games.

The project is built using HTML, CSS, and JavaScript, with no external dependencies, and is designed to run on a simple static server (e.g., `python -m http.server`).

## File Structure

The project has the following structure:

```
project_root/
├── index.html          # Main entry point and interface logic
├── games/              # Directory containing all games
│   ├── cosmic-defender/
│   │   ├── game.js     # Game logic for Cosmic Defender
│   ├── space-invaders/
│   │   ├── game.js     # Game logic for Space Invaders
│   ├── games.json      # List of game folders for the menu
└── README.md           # This documentation file
```

- **`index.html`**: Contains the `Interface` class, which manages the canvas, input handling, and game menu. It dynamically loads games based on user selection.
- **`games/` Directory**:
  - Each game resides in its own subdirectory (e.g., `cosmic-defender/`, `space-invaders/`).
  - Each game folder contains a `game.js` file that defines the game logic.
- **`games.json`**: A JSON file listing the game folder names, used to populate the menu dynamically.
- **`README.md`**: This technical documentation.

## Setup Instructions

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Safari).
- Python 3.x (to run a local server).

### Running Zapcade

1. **Clone or Download the Project**:
   - Clone the repository or download the project files to your local machine.

2. **Create or Update `games.json`**:
   - Ensure the `games.json` file exists in the `games/` directory.
   - Update it with the list of game folders:
     ```json
     {
       "games": ["cosmic-defender", "space-invaders"]
     }
     ```
   - Add any additional game folders as needed (e.g., `["cosmic-defender", "space-invaders", "new-game"]`).

3. **Start a Local Server**:
   - Navigate to the project root directory in a terminal.
   - Run the following command to start a local server:
     ```bash
     python -m http.server 8000
     ```
   - This serves the files at `http://localhost:8000`.

4. **Access Zapcade**:
   - Open a web browser and navigate to `http://localhost:8000`.
   - The Zapcade interface should load, displaying the menu with the games listed in `games.json`.

## Interface Features

### Game Menu
- The menu is accessible via a burger icon (top-right).
- It dynamically populates based on `games.json`, formatting folder names into readable display names (e.g., `cosmic-defender` → "Cosmic Defender").
- Clicking a game loads its `game.js` file from `games/game-name/game.js`.

### Canvas
- The game renders on a canvas element with a maximum width of 400px and a height calculated as `100vh - 210px` (to leave space for the header and controls).
- The canvas is bordered with a Bitcoin orange (`#F7931A`) style and a subtle glow effect.

### Controls
- **Mobile/Touch**:
  - Left joystick (`#move`): Controls movement.
  - Right joystick (`#aim`): Controls aiming and shooting (speed scales with joystick deflection).
  - "B" button (`#action`): Triggers actions (e.g., toggle weapon).
- **Desktop**:
  - WASD: Movement.
  - Mouse: Aiming.
  - Left-click: Shooting.
  - Spacebar: Action.
  - Click on canvas: Restart after game over.

## Game Integration (`game.js` Schematic)

Each game must provide a `game.js` file in its folder (e.g., `games/game-name/game.js`) that adheres to the following schematic to integrate with the `Interface` class.

### Requirements
- **Export a Default Class**:
  ```javascript
  export default class GameName {
    // Implementation
  }
  ```
- **Constructor**:
  - Takes a single parameter `ui` (the `Interface` instance).
  - Initializes game state and sets up callbacks.
  - Example:
    ```javascript
    constructor(ui) {
      this.ui = ui;
      this.player = {
        x: this.ui.canvas.width / 2,
        y: this.ui.canvas.height - 50,
        radius: 15
      };
      this.score = 0;
      this.init();
    }
    ```
- **Initialization (`init`)**:
  - Sets up input callbacks and starts the game loop.
  - Example:
    ```javascript
    init() {
      this.ui.setCallback('onMove', (dx, dy, isMobile) => this.handleMove(dx, dy, isMobile));
      this.ui.setCallback('onAim', (x, y) => this.handleAim(x, y));
      this.ui.setCallback('onShoot', (dist, isActive, dx, dy) => this.handleShoot(dist, isActive, dx, dy));
      this.ui.setCallback('onAction', () => this.handleAction());
      this.ui.setCallback('onRestart', () => this.restart());
      this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
      this.loop();
    }
    ```
- **Input Handling Methods**:
  - `handleMove(dx: number, dy: number, isMobile: boolean)`: Handles movement.
  - `handleAim(x: number, y: number)`: Handles aiming.
  - `handleShoot(dist: number, isActive: boolean, dx: number, dy: number)`: Handles shooting.
  - `handleAction()`: Handles action input.
  - `restart()`: Resets the game state.
  - `handleResize(w: number, h: number)`: Adjusts for canvas resizing.
- **Game Loop**:
  - Implement `update` and `render` methods, called via a `loop` method using `requestAnimationFrame`.
  - Example:
    ```javascript
    loop() {
      this.update();
      this.render();
      requestAnimationFrame(() => this.loop());
    }
    ```
- **Rendering**:
  - Use `this.ui.ctx` to draw on the canvas.
  - Use `this.ui.canvas.width` and `this.ui.canvas.height` for dimensions.

### Example `game.js`
See the [Cosmic Defender `game.js`](#) for a complete implementation example (refer to previous conversations for the full code).

## Adding a New Game

1. **Create a Game Folder**:
   - Add a new folder under `games/` (e.g., `games/new-game/`).
   - Example:
     ```
     games/new-game/
     ├── game.js
     ```

2. **Implement `game.js`**:
   - Follow the schematic above to create a `game.js` file that exports a default class with the required methods.
   - Ensure it handles all input callbacks and renders on the provided canvas.

3. **Update `games.json`**:
   - Add the new folder name to `games.json`:
     ```json
     {
       "games": ["cosmic-defender", "space-invaders", "new-game"]
     }
     ```
   - The menu will automatically include the new game, formatted as "New Game".

4. **Test the Game**:
   - Run the local server (`python -m http.server 8000`).
   - Open `http://localhost:8000` in a browser.
   - Select the new game from the menu and verify it loads and functions correctly.

## Development Guidelines

### Styling
- **Colors**:
  - Use `#F5F5F5` for light white text (matches the interface).
  - Use `#F7931A` (Bitcoin orange) for accents.
  - Use `#1A1A1A` (matte black) for backgrounds.
- **Fonts**:
  - Use `'Arial, sans-serif'` for consistency with the interface.
  - Use font sizes of 20px or larger for readability (e.g., 24px for game over text).

### Performance
- Optimize the game loop (`update`, `render`) to avoid lag, especially on mobile devices.
- Minimize canvas redraws by only clearing and redrawing necessary areas.

### Error Handling
- Handle edge cases in input methods (e.g., check for `gameOver` state).
- Provide clear feedback on the canvas if the game fails to load (handled by `index.html`).

### Cross-Platform Compatibility
- Test games on both mobile (touch controls) and desktop (keyboard/mouse) to ensure compatibility.
- Use `this.ui.canvas` dimensions for positioning to handle different screen sizes.

## Troubleshooting

- **Game Not Loading**:
  - Verify the folder name in `games.json` matches the actual folder (e.g., `new-game` must exist as `games/new-game/`).
  - Check that `game.js` exports a default class.
  - Ensure the local server is running (`python -m http.server`).
- **Menu Empty**:
  - Confirm `games.json` exists in `games/` and contains the correct list of folders.
  - Check the browser console for fetch errors.
- **Input Not Working**:
  - Ensure all required callbacks (`onMove`, `onAim`, etc.) are registered in `init`.
  - Test both touch and keyboard/mouse inputs.

## Future Improvements
- **Dynamic Folder Discovery**:
  - Implement a build script to automatically generate `games.json` by scanning the `games/` directory.
- **Menu Enhancements**:
  - Add scrolling to the menu for large numbers of games.
  - Include game thumbnails or descriptions in the menu.
- **High-DPI Support**:
  - Enhance canvas rendering for high-DPI screens by scaling the resolution while preserving game element sizes.

---

This README provides a comprehensive guide for running Zapcade, integrating new games, and understanding the technical details of the project. If you need further assistance or want to implement any of the future improvements, let me know!