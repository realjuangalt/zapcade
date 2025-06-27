# Zapcade Technical README

## Overview
Zapcade is a web-based game console designed to host multiple games through a unified interface, supporting mobile, tablet, and desktop devices with touch (joysticks, buttons), keyboard, and mouse controls. Games are dynamically loaded from the `games/` directory, with the menu populated via `games.json`. The interface now includes a status bar for real-time game information and supports continuous rendering for smoother gameplay, enhancing the user experience with the latest `SatDefense` game.

## File Structure
```
project_root/
├── index.html          # Main interface logic
├── games/              # Game directories
│   ├── sat-defense/
│   │   ├── game.js
│   ├── cosmic-defender/
│   │   ├── game.js
│   ├── gorilla-rampage/
│   │   ├── game.js
│   ├── games.json      # List of game folders
└── README.md           # This documentation
```

## Setup Instructions
### Prerequisites
- Modern web browser (Chrome, Firefox, Safari).
- Python 3.x (for local server).

### Running Zapcade
1. **Clone/Download**: Clone or download the project.
2. **Update `games.json`**:
   ```json
   {
     "games": ["sat-defense", "cosmic-defender", "gorilla-rampage"]
   }
   ```
3. **Start Server**:
   ```bash
   python -m http.server 8000
   ```
4. **Access**: Open `http://localhost:8000`.

## Interface Features
### Game Menu
- Accessible via a burger icon (top-right).
- Populated from `games.json`, formatting folder names (e.g., `sat-defense` → "Sat Defense").
- Loads `game.js` from `games/game-name/game.js` using dynamic imports.

### Canvas
- Max width: 400px.
- Height: Dynamic, calculated as `window.innerHeight - headerHeight - controlsHeight - statusBarHeight - 20px` to avoid overlap.
- Styled with a Bitcoin orange (`#F7931A`) border and glow.
- Dimensions accessible via `ui.width` and `ui.height` (CSS pixels).
- Supports continuous rendering for real-time updates (e.g., enemy movement in `SatDefense`).

### Controls
- **Default (Mobile/Touch)**:
  - Left joystick (`#move`): Movement (not used in `SatDefense`).
  - Right joystick (`#aim`): Tower placement preview in `SatDefense`.
  - "B" button (`#action`): Not used by default in `SatDefense`.
- **Custom Controls** (for `SatDefense`):
  - Overrides default joysticks with buttons for tower placement, repairs, wave start, tower clearing, and range expansion via `ui.setCustomControls`.
- **Desktop**:
  - Mouse click: Tower placement or restart.
  - Keyboard not currently utilized in `SatDefense`.

## Game Integration (`game.js` Schematic)
### Requirements
- **Export Default Class**:
  ```javascript
  export default class GameName {
    // Implementation
  }
  ```
- **Constructor**:
  ```javascript
  constructor(ui) {
    this.ui = ui;
    this.canvasWidth = ui.width;
    this.canvasHeight = ui.height;
    this.init();
  }
  ```
- **Initialization (`init`)**:
  ```javascript
  init() {
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.ui.setCallback('place', (x, y) => this.handlePlace(x, y));
    this.ui.setCallback('onRestart', () => this.restart());
    this.setControls();
    this.loop();
  }
  ```
  - **Note**: `SatDefense` uses a simplified callback set, focusing on `place` for tower placement and `onResize` for canvas adjustments.

- **Custom Controls (Required for `SatDefense`)**:
  ```javascript
  setControls() {
    const customControls = `
      <style>
        #controls button.active {
          background: #666 !important;
          box-shadow: 0 0 10px #00ff00 !important;
        }
        #controls button.clicked {
          box-shadow: 0 0 15px #00ff00 !important;
          transition: box-shadow 0.2s ease-out;
        }
        #controls button:hover:not(:disabled) {
          background: #777;
          box-shadow: 0 0 10px #00ff00;
        }
        #controls button:disabled {
          background: #444;
          border-color: #666;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.5;
        }
      </style>
      <div style="display: flex; flex-direction: row; gap: 8px; width: 100%; padding: 8px;">
        <div style="flex: 2; display: flex; flex-direction: column; gap: 4px; background: #2a2a2a; padding: 4px; border-radius: 4px; border: 1px solid #00ff00; box-shadow: 0 0 5px #00ff00;">
          <div style="font-size: 10px; text-align: center; color: #00ff00; text-shadow: 0 0 3px #00ff00;">Tools</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; flex: 1;">
            <button id="tower-1" style="background: #555; color: #fff; border: 2px solid #00ff00; border-radius: 4px; font-size: 10px; padding: 4px; font-family: monospace; cursor: pointer;">Firewall Tower (7 SATs)</button>
            <button id="small-repairs" style="background: #555; color: #fff; border: 2px solid #00ff00; border-radius: 4px; font-size: 10px; padding: 4px; font-family: monospace; cursor: pointer;">Small Repairs (5 SATs)</button>
          </div>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 4px; background: #2a2a2a; padding: 4px; border-radius: 4px; border: 1px solid #00ff00; box-shadow: 0 0 5px #00ff00;">
          <div style="font-size: 10px; text-align: center; color: #00ff00; text-shadow: 0 0 3px #00ff00;">Actions</div>
          <button id="start-wave" style="background: #555; color: #fff; border: 2px solid #00ff00; border-radius: 4px; font-size: 10px; padding: 4px; font-family: monospace; cursor: pointer;">Start Wave</button>
          <button id="clear-towers" style="background: #555; color: #fff; border: 2px solid #00ff00; border-radius: 4px; font-size: 10px; padding: 4px; font-family: monospace; cursor: pointer;">Clear Towers</button>
          <button id="expand-range" style="background: #555; color: #fff; border: 2px solid #00ff00; border-radius: 4px; font-size: 10px; padding: 4px; font-family: monospace; cursor: pointer;">Expand Range</button>
        </div>
      </div>
    `;
    this.ui.setCustomControls(customControls);
    // Event listeners are set within the setTimeout callback in the game code
  }
  ```
- **Input Handling**:
  - `handleResize(w, h)`: Adjusts canvas dimensions and game state.
  - `handlePlace(x, y)`: Places towers in `SatDefense`.
  - `restart()`: Resets the game state.
- **Game Loop**:
  ```javascript
  loop() {
    if (!this.game.gameOver) {
      this.update();
      this.render();
    }
    requestAnimationFrame(() => this.loop());
  }
  ```
  - Continuous rendering ensures real-time updates for enemies and projectiles.
- **Boundary Checks**:
  - Use `this.canvasWidth` and `this.canvasHeight` (set from `ui.width` and `ui.height` in `handleResize`) for tower placement and rendering boundaries.

## Adding a New Game
1. Create a new folder under `games/` (e.g., `games/new-game/`).
2. Add a `game.js` file following the schematic, adapting the `SatDefense` pattern if a tower defense style is desired.
3. Update `games.json`:
   ```json
   {
     "games": ["sat-defense", "cosmic-defender", "gorilla-rampage", "new-game"]
   }
   ```
4. Test at `http://localhost:8000`.

## Development Guidelines
### Styling
- Colors: `#F5F5F5` (text), `#F7931A` (accents), `#1A1A1A` (background).
- Fonts: `'Arial, sans-serif'`, 10px+ for controls, 20px+ for readability.
### Performance
- Optimize the continuous game loop for mobile devices.
- Minimize canvas redraws within `render` where possible.
### Error Handling
- Handle edge cases in `handlePlace` and control events.
- Ensure custom controls are valid HTML.
### Cross-Platform
- Test touch, mouse, and keyboard inputs (though `SatDefense` primarily uses touch/mouse).
- Use `this.ui.width` and `this.ui.height` for positioning.

## Troubleshooting
- **Content Not Loading Initially**: Ensure `loop` runs continuously and `render` draws the initial state (e.g., base and header).
- **Game Freezes**: Verify `update` and `render` are called every frame, and check for infinite loops or unhandled exceptions.
- **Enemies Not Visible**: Confirm `enemies` array is populated and `render` includes the enemy drawing loop.
- **Controls Overlap**: Adjust `resizeCanvas` to account for the status bar height.

## Future Improvements
- Add real-time status bar updates via a callback from the game.
- Implement menu scrolling for many games.
- Enhance high-DPI canvas rendering with dynamic scaling.