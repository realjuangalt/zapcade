Below is a detailed documentation for the schematic that `game.js` files in the Zapcade project must follow to properly interface with the `index.html` `Interface` class. This ensures that games like Cosmic Defender and Space Invaders (or any user-created games) can seamlessly integrate with the Zapcade game console interface, handling user inputs, canvas resizing, and game lifecycle events.

---

### Zapcade Game Schematic Documentation for `game.js`

#### Overview
The Zapcade project uses a centralized `Interface` class in `index.html` to manage the game console, including a canvas for rendering, a menu for selecting games, and input handling for both touch (joysticks, buttons) and desktop (keyboard, mouse) controls. Each game is contained in its own folder under `games/` (e.g., `games/cosmic-defender/`, `games/space-invaders/`), with a `game.js` file that defines the game logic. The `game.js` file must adhere to a specific schematic to integrate with the `Interface` class, ensuring compatibility with the input system, canvas management, and game lifecycle.

#### File Structure
- **Location**: Each game must have its own folder under `games/`, with a `game.js` file inside:
  ```
  project_root/
  ├── index.html
  ├── games/
  │   ├── game-name/
  │   │   ├── game.js
  ```
- **Example**:
  ```
  games/cosmic-defender/game.js
  games/space-invaders/game.js
  ```

#### Schematic for `game.js`
The `game.js` file must export a default class that interacts with the `Interface` instance (`ui`) provided by `index.html`. The class should handle game initialization, input events, rendering, and lifecycle events (e.g., resizing, restarting). Below is the required structure and API.

##### 1. **Class Definition**
- **Export a Default Class**:
  - The `game.js` file must export a default class using ES module syntax.
  - The class name should typically match the game’s purpose (e.g., `CosmicDefenderGame`), but it can be any valid name since the `Interface` class will instantiate it dynamically.
  - Example:
    ```javascript
    export default class GameName {
      // Class implementation
    }
    ```

##### 2. **Constructor**
- **Signature**:
  ```javascript
  constructor(ui) {
    this.ui = ui;
    // Initialize game state
  }
  ```
- **Parameters**:
  - `ui`: An instance of the `Interface` class from `index.html`. This provides access to the canvas, context, and input callbacks.
- **Responsibilities**:
  - Store the `ui` instance for accessing the canvas (`ui.canvas`), context (`ui.ctx`), and setting callbacks for input events.
  - Initialize the game state (e.g., player position, enemies, score).
  - Call an `init` method (or similar) to set up input callbacks and start the game loop.
- **Example**:
  ```javascript
  constructor(ui) {
    this.ui = ui;
    this.player = {
      x: this.ui.canvas.width / 2,
      y: this.ui.canvas.height - 50,
      radius: 15
    };
    this.score = 0;
    this.enemies = [];
    this.init();
  }
  ```

##### 3. **Initialization Method (`init`)**
- **Purpose**: Set up input callbacks and start the game loop.
- **Method**:
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
- **Callbacks**:
  - The `Interface` class provides several callbacks to handle user input and lifecycle events. The game must implement corresponding methods to process these events.
  - **Required Callbacks**:
    - `onMove`: Handles movement input (e.g., from the left joystick or WASD keys).
    - `onAim`: Handles aiming input (e.g., from the right joystick or mouse).
    - `onShoot`: Handles shooting input (e.g., from the right joystick or mouse click).
    - `onAction`: Handles action input (e.g., from the "B" button or spacebar).
    - `onRestart`: Handles restart input (e.g., from clicking the canvas after game over).
    - `onResize`: Handles canvas resizing (e.g., when the window is resized).
  - **Callback Signatures**:
    - `onMove(dx: number, dy: number, isMobile: boolean)`:
      - `dx`, `dy`: Normalized direction vector (-1 to 1) for movement.
      - `isMobile`: `true` if the input is from the joystick, `false` if from the keyboard.
    - `onAim(x: number, y: number)`:
      - `x`, `y`: Coordinates on the canvas where the player is aiming.
    - `onShoot(dist: number, isActive: boolean, dx: number, dy: number)`:
      - `dist`: Distance of joystick deflection (0 to 1, for mobile).
      - `isActive`: `true` if shooting is active, `false` if stopped.
      - `dx`, `dy`: Raw joystick deflection (-1 to 1, for mobile; 0 for desktop).
    - `onAction()`: No parameters; triggered by the "B" button or spacebar.
    - `onRestart()`: No parameters; triggered by clicking the canvas.
    - `onResize(w: number, h: number)`:
      - `w`, `h`: New canvas width and height (CSS dimensions).

##### 4. **Input Handling Methods**
- **Implement the following methods to handle input events**:
  - `handleMove(dx, dy, isMobile)`:
    - Update the player’s movement based on the direction vector.
    - Example:
      ```javascript
      handleMove(dx, dy, isMobile) {
        if (this.gameOver) return;
        this.isMobileInput = isMobile;
        this.player.dx = dx;
        this.player.dy = dy;
      }
      ```
  - `handleAim(x, y)`:
    - Update the aiming direction or target position.
    - Example:
      ```javascript
      handleAim(x, y) {
        if (this.gameOver) return;
        this.aimX = x;
        this.aimY = y;
      }
      ```
  - `handleShoot(dist, isActive, dx, dy)`:
    - Handle shooting mechanics, potentially scaling shot speed based on `dist`.
    - Example:
      ```javascript
      handleShoot(dist, isActive, dx, dy) {
        if (this.gameOver) return;
        this.isShooting = isActive;
        if (!this.isShooting) return;
        const speedFactor = dist * 5;
        // Add shooting logic
      }
      ```
  - `handleAction()`:
    - Handle an action (e.g., toggle weapon, pause).
    - Example:
      ```javascript
      handleAction() {
        if (this.gameOver) return;
        this.weaponMode = this.weaponMode === 'Gun' ? 'Bomb' : 'Gun';
      }
      ```
  - `restart()`:
    - Reset the game state to restart after game over.
    - Example:
      ```javascript
      restart() {
        if (!this.gameOver) return;
        this.player = {
          x: this.ui.canvas.width / 2,
          y: this.ui.canvas.height - 50,
          radius: 15,
          dx: 0,
          dy: 0
        };
        this.score = 0;
        this.gameOver = false;
      }
      ```
  - `handleResize(w, h)`:
    - Adjust game elements (e.g., player position) when the canvas resizes.
    - Example:
      ```javascript
      handleResize(width, height) {
        this.player.x = width / 2;
        this.player.y = height - 50;
      }
      ```

##### 5. **Game Loop**
- **Implement a Game Loop**:
  - Use `requestAnimationFrame` to continuously update and render the game.
  - Example:
    ```javascript
    loop() {
      this.update();
      this.render();
      requestAnimationFrame(() => this.loop());
    }

    update() {
      if (this.gameOver) return;
      // Update game state (e.g., move player, spawn enemies)
    }

    render() {
      const ctx = this.ui.ctx;
      ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
      // Render game elements (e.g., player, enemies, UI)
    }
    ```

##### 6. **Rendering**
- **Use `ui.ctx` for Rendering**:
  - Draw on the canvas using `this.ui.ctx`, which is the 2D rendering context provided by the `Interface`.
  - The canvas dimensions are available as `this.ui.canvas.width` and `this.ui.canvas.height` (CSS dimensions).
  - Example:
    ```javascript
    render() {
      const ctx = this.ui.ctx;
      ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

      // Render player
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Render UI (e.g., score)
      ctx.fillStyle = '#F5F5F5';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
    ```

##### 7. **Game Over Handling**
- **Display Game Over State**:
  - When the game ends, display a "Game Over" message and instructions to restart (e.g., "Tap to Restart").
  - The `Interface` triggers the `onRestart` callback when the canvas is clicked, which should call your `restart` method.
  - Example:
    ```javascript
    render() {
      const ctx = this.ui.ctx;
      ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

      // Render game elements...

      if (this.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
        ctx.fillStyle = '#F5F5F5';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', this.ui.canvas.width / 2, this.ui.canvas.height / 2 - 20);
        ctx.font = '20px Arial';
        ctx.fillText('Tap to Restart', this.ui.canvas.width / 2, this.ui.canvas.height / 2 + 20);
      }
    }
    ```

#### Full Example `game.js`
Here’s a complete example of a `game.js` file that adheres to the schematic:

```javascript
export default class CosmicDefenderGame {
  constructor(ui) {
    this.ui = ui;
    this.player = { 
      x: this.ui.canvas.width / 2,
      y: this.ui.canvas.height - 50,
      keyboardSpeed: 5, 
      mobileSpeed: 2, 
      radius: 15,
      dx: 0,
      dy: 0
    };
    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;
    this.weaponMode = 'Gun';
    this.bombAmmo = 5;
    this.lastShot = 0;
    this.shootCooldown = 200;
    this.enemySpawnRate = 1000;
    this.lastSpawn = 0;
    this.isMobileInput = false;
    this.autoShoot = true;
    this.isShooting = false;
    this.init();
  }

  init() {
    this.ui.setCallback('onMove', (dx, dy, isMobile) => this.handleMove(dx, dy, isMobile));
    this.ui.setCallback('onAim', (x, y) => this.handleAim(x, y));
    this.ui.setCallback('onShoot', (dist, isActive, dx, dy) => this.handleShoot(dist, isActive, dx, dy));
    this.ui.setCallback('onAction', () => this.toggleWeapon());
    this.ui.setCallback('onRestart', () => this.restart());
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.loop();
  }

  handleMove(dx, dy, isMobile) {
    if (this.gameOver) return;
    this.isMobileInput = isMobile;
    this.player.dx = dx;
    this.player.dy = dy;
  }

  handleAim(x, y) {
    if (this.gameOver) return;
    this.aimX = x;
    this.aimY = y;
  }

  handleShoot(dist, isActive, dx, dy) {
    if (this.gameOver) return;
    this.isShooting = isActive;
    if (!this.autoShoot || !this.isShooting) return;
    if (Date.now() - this.lastShot < this.shootCooldown) return;
    this.lastShot = Date.now();
    const speedFactor = dist * 5;
    const directionX = dx || (this.aimX - this.player.x) / this.ui.canvas.width;
    const directionY = dy || (this.aimY - this.player.y) / this.ui.canvas.height;
    const mag = Math.sqrt(directionX * directionX + directionY * directionY);
    const normalizedDx = mag > 0 ? directionX / mag : 0;
    const normalizedDy = mag > 0 ? directionY / mag : 0;
    if (this.weaponMode === 'Gun') {
      this.bullets.push({
        x: this.player.x,
        y: this.player.y,
        dx: normalizedDx * speedFactor,
        dy: normalizedDy * speedFactor,
        radius: 5,
        type: 'gun'
      });
    } else if (this.bombAmmo > 0) {
      this.bullets.push({
        x: this.player.x,
        y: this.player.y,
        dx: normalizedDx * speedFactor * 0.5,
        dy: normalizedDy * speedFactor * 0.5,
        radius: 10,
        type: 'bomb'
      });
      this.bombAmmo--;
    }
  }

  toggleWeapon() {
    if (this.gameOver) return;
    this.weaponMode = this.weaponMode === 'Gun' ? 'Bomb' : 'Gun';
  }

  spawnEnemy() {
    if (Date.now() - this.lastSpawn < this.enemySpawnRate || this.gameOver) return;
    this.lastSpawn = Date.now();
    this.enemies.push({
      x: Math.random() * (this.ui.canvas.width - 20) + 10,
      y: -10,
      radius: 10,
      speed: 1 + this.score / 100
    });
  }

  update() {
    if (this.gameOver) return;

    const speed = this.isMobileInput ? this.player.mobileSpeed : this.player.keyboardSpeed;
    const magnitude = Math.sqrt(this.player.dx * this.player.dx + this.player.dy * this.player.dy);
    if (magnitude > 0) {
      const directionX = this.player.dx;
      const directionY = this.player.dy;
      this.player.x += directionX * speed;
      this.player.y += directionY * speed;
      this.player.x = Math.max(this.player.radius, Math.min(this.ui.canvas.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.ui.canvas.height - this.player.radius, this.player.y));
    }

    this.bullets = this.bullets.filter(b => {
      b.x += b.dx;
      b.y += b.dy;
      return b.y > -b.radius && b.y < this.ui.canvas.height + b.radius &&
             b.x > -b.radius && b.x < this.ui.canvas.width + b.radius;
    });

    this.enemies.forEach(e => {
      e.y += e.speed;
      if (e.y > this.ui.canvas.height) {
        this.enemies = this.enemies.filter(enemy => enemy !== e);
        this.score = Math.max(0, this.score - 5);
      }
    });

    this.bullets.forEach(b => {
      this.enemies = this.enemies.filter(e => {
        const dist = Math.sqrt((b.x - e.x) ** 2 + (b.y - e.y) ** 2);
        if (dist < b.radius + e.radius) {
          this.score += b.type === 'gun' ? 10 : 15;
          return false;
        }
        return true;
      });
    });

    this.enemies.forEach(e => {
      const dist = Math.sqrt((this.player.x - e.x) ** 2 + (this.player.y - e.y) ** 2);
      if (dist < this.player.radius + e.radius) this.gameOver = true;
    });

    this.spawnEnemy();
  }

  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();

    this.bullets.forEach(b => {
      ctx.fillStyle = b.type === 'gun' ? 'yellow' : 'red';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = 'purple';
    this.enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#F5F5F5';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 10, 30);
    ctx.fillText(`${this.weaponMode}: ${this.weaponMode === 'Gun' ? '∞' : this.bombAmmo}`, 10, 50);

    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
      ctx.fillStyle = '#F5F5F5';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.ui.canvas.width / 2, this.ui.canvas.height / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText('Tap to Restart', this.ui.canvas.width / 2, this.ui.canvas.height / 2 + 20);
    }
  }

  loop() {
    this.update();
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  restart() {
    if (!this.gameOver) return;
    this.player = { 
      x: this.ui.canvas.width / 2,
      y: this.ui.canvas.height - 50,
      keyboardSpeed: 5, 
      mobileSpeed: 2, 
      radius: 15,
      dx: 0,
      dy: 0
    };
    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.gameOver = false;
    this.bombAmmo = 5;
    this.weaponMode = 'Gun';
    this.isMobileInput = false;
    this.isShooting = false;
  }

  handleResize(width, height) {
    this.player.x = width / 2;
    this.player.y = height - 50;
  }
}
```

#### Integration with `index.html`
- **Loading**:
  - The `Interface` class in `index.html` loads the game using dynamic imports:
    ```javascript
    const module = await import(`./games/${gameName}/game.js`);
    this.currentGame = new module.default(this);
    ```
  - The `game.js` file must be in the correct folder (`games/game-name/game.js`) and export a default class.
- **Canvas Access**:
  - The game uses `this.ui.canvas` for dimensions and `this.ui.ctx` for rendering, ensuring consistency with the interface’s canvas setup.
- **Input Handling**:
  - The game registers callbacks via `ui.setCallback`, which the `Interface` class calls based on user input (touch, keyboard, mouse).
- **Lifecycle Events**:
  - The `onResize` and `onRestart` callbacks ensure the game adapts to window resizing and user-initiated restarts.

#### Best Practices
- **Coordinate System**:
  - Use `this.ui.canvas.width` and `this.ui.canvas.height` for positioning and bounds checking, as these reflect the CSS dimensions of the canvas.
- **Performance**:
  - Keep the game loop efficient by minimizing heavy computations in `update` and `render`.
  - Use `requestAnimationFrame` for smooth animation.
- **Error Handling**:
  - Ensure game logic (e.g., collision detection, input handling) gracefully handles edge cases (e.g., `gameOver` state).
- **Styling**:
  - Use colors and fonts consistent with the interface’s theme (e.g., `#F5F5F5` for text, as used in the interface).

#### Adding a New Game
1. Create a new folder under `games/` (e.g., `games/new-game/`).
2. Add a `game.js` file following the schematic above.
3. Update `games.json` to include the new folder name:
   ```json
   {
     "games": ["cosmic-defender", "space-invaders", "new-game"]
   }
   ```
4. The menu will automatically include the new game, formatted as "New Game".

This schematic ensures that all games integrate seamlessly with the Zapcade interface, providing a consistent user experience across different games. If you need further clarification or assistance with implementing a specific game, let me know!