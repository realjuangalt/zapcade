# Zapcade Game Schematic Documentation for `game.js`

## Overview
Zapcade is a web-based game platform that uses a centralized `Interface` class in `index.html` to manage a game console, featuring a canvas for rendering, a dynamic game menu, and input handling for touch (joysticks, buttons), keyboard, and mouse controls. Each game resides in its own folder under `games/` (e.g., `games/sat-defense/`, `games/cosmic-defender/`), with a `game.js` file defining the game logic. The `game.js` file must follow a schematic to integrate with the `Interface` class, supporting continuous rendering and custom controls as demonstrated by the updated `SatDefense` game.

## File Structure
- **Location**: Each game must have its own folder under `games/`, with a `game.js` file inside:
  ```
  project_root/
  ├── index.html
  ├── games/
  │   ├── sat-defense/
  │   │   ├── game.js
  │   ├── cosmic-defender/
  │   │   ├── game.js
  │   ├── gorilla-rampage/
  │   │   ├── game.js
  ```
- **Example**:
  ```
  games/sat-defense/game.js
  ```

## Schematic for `game.js`
The `game.js` file must export a default class that interacts with the `Interface` instance (`ui`) provided by `index.html`. The class should handle game initialization, input events, continuous rendering, lifecycle events, and optionally custom controls.

### 1. Class Definition
- **Export a Default Class**:
  - The `game.js` file must export a default class using ES module syntax.
  - Example:
    ```javascript
    export default class GameName {
      // Class implementation
    }
    ```

### 2. Constructor
- **Signature**:
  ```javascript
  constructor(ui) {
    this.ui = ui;
    this.canvasWidth = ui.width;
    this.canvasHeight = ui.height;
    this.init();
  }
  ```
- **Parameters**:
  - `ui`: An instance of the `Interface` class from `index.html`. Provides access to the canvas (`ui.canvas`), context (`ui.ctx`), input callbacks, control customization, and dimensions (`ui.width`, `ui.height` in CSS pixels).
- **Responsibilities**:
  - Store the `ui` instance.
  - Initialize the game state (e.g., base position, towers, SATs).
  - Call an `init` method to set up callbacks, start the continuous game loop, and set custom controls.
- **Example (SatDefense)**:
  ```javascript
  constructor(ui) {
    this.ui = ui;
    this.canvasWidth = ui.width;
    this.canvasHeight = ui.height;
    this.game = {
      sats: 21,
      wave: 0,
      maxTowerPoints: 3,
      towers: [],
      enemies: [],
      projectiles: [],
      explosions: [],
      announcements: [],
      placementMode: null,
      waveActive: false,
      gameOver: false,
      enemiesToSpawn: 0,
      baseHealthLost: 0,
      lastPlacementTime: 0,
      spawnIntervalId: null,
      buttonActive: false
    };
    this.base = {
      x: Math.round(this.canvasWidth / 2),
      y: Math.round(this.canvasHeight / 2),
      radius: 15,
      range: Math.min(100, Math.round(this.canvasWidth / 2 - 50)),
      damage: 1,
      fireRate: 1000,
      lastShot: 0,
      health: 21
    };
    this.aimX = null;
    this.aimY = null;
    this.clickActive = false;
    this.lastClickTime = 0;
    this.gridMode = false;
    this.gridSize = 8;
    this.init();
  }
  ```

### 3. Initialization Method (`init`)
- **Purpose**: Set up input callbacks, start the continuous game loop, and set custom controls.
- **Method**:
  ```javascript
  init() {
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.ui.setCallback('place', (x, y) => this.handlePlace(x, y));
    this.ui.setCallback('onRestart', () => this.restart());
    this.setControls();
    this.loop();
  }
  ```
- **Callbacks**:
  - **Required Callbacks for `SatDefense`**:
    - `onResize(w: number, h: number)`: Adjusts canvas dimensions and game state.
    - `place(x: number, y: number)`: Places towers at specified coordinates.
    - `onRestart()`: Resets the game state.

### 4. Custom Controls (Required for `SatDefense`)
- **Method**: `setControls`
- **Purpose**: Replace the default joystick layout with custom HTML buttons for `SatDefense` actions.
- **Signature**:
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
    // Event listeners are set within setTimeout in the game code
  }
  ```
- **Notes**:
  - `SatDefense` uses custom buttons for all interactions, overriding the default joysticks.
  - Event listeners are dynamically added in a `setTimeout` callback to ensure DOM elements are available.

### 5. Input Handling Methods
- **Required Methods for `SatDefense`**:
  - `handleResize(w, h)`:
    ```javascript
    handleResize(width, height) {
      this.canvasWidth = width;
      this.canvasHeight = height;
      this.base.x = Math.round(width / 2);
      this.base.y = Math.round(height / 2);
      this.base.range = Math.min(this.base.range, Math.round(width / 2 - 50));
    }
    ```
  - `handlePlace(x, y)`:
    ```javascript
    handlePlace(x, y) {
      if (this.game.gameOver || this.game.waveActive || Date.now() - this.game.lastPlacementTime < 200) {
        this.logEvent('Placement failed: game over, wave active, or too soon');
        return;
      }
      if (this.game.sats < 7 || this.game.towers.length >= this.game.maxTowerPoints) {
        this.logEvent(`Placement failed: insufficient sats (${this.game.sats} < 7) or max towers (${this.game.towers.length}/${this.game.maxTowerPoints})`);
        return;
      }
      if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) {
        this.logEvent('Placement failed: outside canvas bounds');
        return;
      }
      this.game.towers.push(new Tower(x, y, this.game.placementMode, this.canvasWidth, this.canvasHeight, this.getNearestEnemy.bind(this), this.game, this.logEvent));
      this.game.sats -= 7;
      this.game.lastPlacementTime = Date.now();
      this.logEvent(`Tower placed at (${x}, ${y}), cost: 7 sats, towers: ${this.game.towers.length}/${this.game.maxTowerPoints}`);
      this.updateUI();
    }
    ```
  - `restart()`:
    ```javascript
    restart() {
      if (!this.game.gameOver) return;
      this.game.sats = 21;
      this.game.wave = 0;
      this.game.maxTowerPoints = 3;
      this.game.towers = [];
      this.game.enemies = [];
      this.game.projectiles = [];
      this.game.explosions = [];
      this.game.announcements = [];
      this.game.placementMode = null;
      this.game.waveActive = false;
      this.game.gameOver = false;
      this.game.enemiesToSpawn = 0;
      this.game.baseHealthLost = 0;
      if (this.game.spawnIntervalId) clearInterval(this.game.spawnIntervalId);
      this.game.spawnIntervalId = null;
      this.base.x = Math.round(this.canvasWidth / 2);
      this.base.y = Math.round(this.canvasHeight / 2);
      this.base.radius = 15;
      this.base.range = Math.min(100, Math.round(this.canvasWidth / 2 - 50));
      this.base.lastShot = 0;
      this.base.health = 21;
      this.aimX = null;
      this.aimY = null;
      this.clickActive = false;
      this.lastClickTime = 0;
      this.logEvent('Game restarted');
      this.updateUI();
      this.loop();
    }
    ```
- **Optional Methods for Custom Controls**:
  - Handled via event listeners in `setControls` (e.g., tower placement, wave start).

### 6. Game Loop
- **Implement a Continuous Game Loop**:
  ```javascript
  loop() {
    if (!this.game.gameOver) {
      this.update();
      this.render();
    }
    requestAnimationFrame(() => this.loop());
  }
  ```
  - Ensures real-time updates for enemies, projectiles, and UI elements.

### 7. Update and Render
- **Update Method**:
  ```javascript
  update() {
    if (this.game.gameOver) return;

    if (Date.now() - this.base.lastShot >= this.base.fireRate) {
      const target = this.getNearestEnemy(this.base.x, this.base.y, this.base.range);
      if (target) {
        this.game.projectiles.push(new Projectile(this.base.x, this.base.y, target, this.base.damage, this.game, this.logEvent));
        this.base.lastShot = Date.now();
      }
    }

    for (const tower of this.game.towers) {
      tower.update();
    }
    for (let i = this.game.enemies.length - 1; i >= 0; i--) {
      const enemy = this.game.enemies[i];
      enemy.update();
      if (enemy.health <= 0) {
        this.game.enemies.splice(i, 1);
        this.logEvent(`Enemy removed, ${this.game.enemies.length} enemies remain`);
      }
    }
    for (let i = this.game.projectiles.length - 1; i >= 0; i--) {
      const proj = this.game.projectiles[i];
      if (!proj.update()) this.game.projectiles.splice(i, 1);
    }
    for (let i = this.game.explosions.length - 1; i >= 0; i--) {
      if (!this.game.explosions[i].draw(this.ui.ctx)) this.game.explosions.splice(i, 1);
    }
    for (let i = this.game.announcements.length - 1; i >= 0; i--) {
      if (!this.game.announcements[i].draw(this.ui.ctx)) this.game.announcements.splice(i, 1);
    }

    this.checkWaveEnd();

    if (this.base.health <= 0) {
      this.game.gameOver = true;
      this.logEvent(`Game over at wave ${this.game.wave}, sats: ${this.game.sats}`);
    }
  }
  ```
- **Render Method**:
  ```javascript
  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw header bar (handled by status bar in interface)
    ctx.save();
    ctx.fillStyle = 'rgba(42, 42, 42, 0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, 30);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'clamp(12px, 3vw, 14px) Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const statsText = `Wave ${this.game.wave} | Towers ${this.game.towers.length}/${this.game.maxTowerPoints} | Budget ${this.game.sats} | Health ${this.base.health}`;
    ctx.fillText(statsText, this.canvasWidth / 2, 15);
    ctx.restore();

    // Draw base
    ctx.save();
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.base.x, this.base.y, this.base.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(this.base.x, this.base.y, this.base.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'clamp(10px, 2.5vw, 12px) Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.base.health, this.base.x, this.base.y);
    ctx.restore();

    // Draw towers
    for (const tower of this.game.towers) {
      tower.draw(ctx);
    }

    // Draw enemies
    for (const enemy of this.game.enemies) {
      enemy.draw(ctx);
    }

    // Draw projectiles
    for (const proj of this.game.projectiles) {
      proj.draw(ctx);
    }

    // Draw explosions
    for (const explosion of this.game.explosions) {
      if (!explosion.draw(ctx)) {
        const index = this.game.explosions.indexOf(explosion);
        if (index > -1) this.game.explosions.splice(index, 1);
      }
    }

    // Draw announcements
    for (const announcement of this.game.announcements) {
      if (!announcement.draw(ctx)) {
        const index = this.game.announcements.indexOf(announcement);
        if (index > -1) this.game.announcements.splice(index, 1);
      }
    }

    // Draw tower placement preview
    if (this.game.placementMode && this.aimX !== null && this.aimY !== null) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = this.aimX + 12 * Math.cos(angle);
        const y = this.aimY + 12 * Math.sin(angle);
        ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if (this.game.gameOver) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.fillStyle = '#00ff00';
      ctx.font = 'clamp(24px, 6vw, 28px) Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Game Over', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
      ctx.font = 'clamp(14px, 3.5vw, 16px) Arial, sans-serif';
      ctx.fillText('Tap to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
      ctx.restore();
    }
  }
  ```

### 8. Utility Methods
- **getNearestEnemy(x, y, range)**:
  ```javascript
  getNearestEnemy(x, y, range) {
    let closest = null;
    let minDist = Infinity;
    for (const enemy of this.game.enemies) {
      const dist = Math.hypot(enemy.x - x, enemy.y - y);
      if (dist < range && dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    }
    return closest;
  }
  ```
- **checkWaveEnd()**, `applySmallRepairs()`, `applyExpandRange()`, `updateUI()`: As implemented in `SatDefense`.

## Integration with `index.html`
- **Loading**: The `Interface` class loads games using dynamic imports (`await import(...)`).
- **Canvas Access**: Use `this.ui.canvas` and `this.ui.ctx`. Use `this.ui.width` and `this.ui.height` for CSS pixel dimensions, adjusted by `dpr` for high-DPI rendering.
- **Input Handling**: Register callbacks via `ui.setCallback` (e.g., `place` for `SatDefense`).
- **Custom Controls**: Use `ui.setCustomControls(html)` to override default controls with game-specific buttons.
- **Lifecycle Events**: Handle `onResize` and `onRestart` for state management.
- **Status Bar Integration**: The interface updates the `#status-bar` with game state; games can suggest updates via `updateUI` logging.

## Best Practices
- **Canvas Dimensions**: Use `this.ui.width` and `this.ui.height` (or stored `canvasWidth`, `canvasHeight` from `onResize`) for boundaries and rendering, as these are in CSS pixels. Avoid raw `canvas` dimensions unless scaled by `dpr`.
- **Custom Controls**: Match the interface’s Bitcoin orange and matte black theme.
- **Performance**: Optimize the continuous `loop` for mobile devices with minimal redraws.
- **Error Handling**: Validate inputs in `handlePlace` and control events.
- **Cross-Platform**: Test touch and mouse inputs, as `SatDefense` relies on click-based tower placement.

## Adding a New Game
1. Create a new folder under `games/` (e.g., `games/new-game/`).
2. Add a `game.js` file following the schematic, adapting the `SatDefense` pattern (e.g., tower defense or continuous rendering).
3. Update `games.json`:
   ```json
   {
     "games": ["sat-defense", "cosmic-defender", "gorilla-rampage", "new-game"]
   }
   ```
4. The menu will include the new game, with default or custom controls based on `setControls`.

## Troubleshooting
- **Content Not Loading**: Ensure `loop` runs continuously and `render` draws the initial state (e.g., base).
- **Game Freezes**: Verify `update` and `render` are called every frame, and check for unhandled exceptions.
- **Enemies Not Visible**: Confirm `enemies` array is populated and `render` includes the enemy loop.
- **Controls Not Responding**: Ensure `setControls` sets up event listeners correctly.

## Future Improvements
- Add a callback to update the status bar dynamically from the game.
- Implement menu scrolling for a large number of games.
- Enhance high-DPI rendering with configurable `dpr` scaling.