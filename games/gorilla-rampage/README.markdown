# Gorilla Rampage

## Overview
**Gorilla Rampage** is a browser-based, mobile-optimized arcade melee game inspired by classic beat-'em-up action. Players control a gorilla defending its territory against waves of human enemies using melee attacks (punch/kick), grabbing enemies or items with the "B" button, and throwing grabbed objects with the "A" button when the joystick is fully extended. The game features an emulator-like architecture, with `index.html` acting as a reusable "console" providing a canvas and input controls, and `game.js` implementing the game logic as a "cartridge." Designed for seamless play on mobile devices with touch controls, it also supports keyboard and mouse inputs for desktop users. The game uses mockup sprites (canvas-drawn shapes) as placeholders, with support for custom graphic assets in the future.

## Features
- **Mobile-First Design**: Intuitive touch controls with dual joysticks for movement and attacking, plus a "B" button for grabbing.
- **Cross-Platform Support**: Playable on mobile (touch) and desktop (WASD, mouse, space bar) with consistent gameplay.
- **Dynamic Melee Combat**: Punch or kick enemies, grab enemies or items, and throw grabbed objects for higher damage, aiming for a high score.
- **Wave-Based Enemies**: Fight 3-5 human enemies per wave, with increasing difficulty and occasional item spawns.
- **Health System**: Start with 100 health, lose 5 per enemy hit, with game over at 0.
- **Smooth Performance**: Optimized for 60 FPS on mid-range mobile devices using lightweight canvas rendering.
- **Modular Architecture**: The `Interface` class in `index.html` supports swapping `game.js` with other games, enabling extensibility.
- **In-Canvas UI**: Score, health, wave number, and held object status displayed within the canvas.

## Installation

### Prerequisites
- A modern web browser (e.g., Chrome, Safari, Firefox) with JavaScript enabled.
- Python 3.x for running a local web server (e.g., `python -m http.server`).
- No external dependencies are required, as the game runs entirely client-side.

### Setup
1. **Clone or Download the Repository**:
   ```bash
   git clone <repository-url>
   cd gorilla-rampage
   ```
   Alternatively, download the ZIP file and extract it.

2. **File Structure**:
   Ensure the following files are in the project directory:
   - `index.html`: The main interface file.
   - `game.js`: The game logic for Gorilla Rampage.
   - `README.md`: This file.
   - `LICENSE`: The license file.
   - (Optional) `assets/`: Folder for future graphic assets (e.g., `gorilla.png`, `human.png`, `rock.png`).

3. **Serve the Files**:
   - **Recommended: Local Python Server**:
     ```bash
     python -m http.server 8000
     ```
     Access the game at `http://localhost:8000`.
   - **Alternative: Open Directly**:
     Open `index.html` in a browser using the `file://` protocol (e.g., `file:///path/to/gorilla-rampage/index.html`). Note: Some browsers may restrict features when using `file://`.

4. **Play**:
   - On **mobile**, use the left joystick to move, the right joystick to punch/kick ("A") or throw (when holding and fully extended), and the "B" button to grab/release.
   - On **desktop**, use WASD to move, mouse to aim, left-click to punch/kick or throw ("A"), and space bar to grab/release ("B").
   - Tap/click the canvas to restart after a game over.

## Usage
- **Game Objective**: Defeat waves of human enemies to earn points (+10 for punch/kick kills, +15 for throw kills). Avoid taking damage (-5 points and health per hit) to survive and achieve a high score.
- **Controls**:
  - **Mobile**:
    - Left Joystick: Move the gorilla (constant speed of 2).
    - Right Joystick: Aim and trigger punch/kick ("A") when deflected; throw held objects when fully extended (`dist >= 1`).
    - "B" Button: Grab an enemy or item, or release the held object.
  - **Desktop**:
    - WASD: Move the gorilla (constant speed of 5).
    - Mouse: Aim (cursor position).
    - Left Mouse Click: Punch/kick ("A") when empty-handed; throw held objects when aimed.
    - Space Bar: Grab/release ("B").
  - **Restart**: Tap/click the canvas when the "GAME OVER" screen appears.
- **Scoring**:
  - Punch/Kick kill: +10 points.
  - Throw kill (enemy or item): +15 points.
  - Taking damage: -5 points and -5 health.
- **Health**: Starts at 100, decrements by 5 per enemy hit. Game over when health reaches 0.
- **Waves**: 3-5 enemies spawn per wave, with speed increasing by 0.1 per wave. Items (e.g., rocks) spawn occasionally and can be grabbed/thrown.

## Development
To create a new game compatible with the `Interface` class:
1. **Understand the Interface**:
   - The `Interface` class in `index.html` provides a canvas (`ui.canvas`, `ui.ctx`) and callbacks: `onMove`, `onAim`, `onShoot`, `onAction`, `onRestart`, `onResize`.
   - See the [Cosmic Defender Interface Schema](#) for details (available in the project documentation).
2. **Create a New Game**:
   - Write a `game.js` file with a class (e.g., `MyGame`) that accepts `ui` and implements the required callbacks.
   - Use `ui.ctx` for rendering and `ui.canvas` for bounds.
   - Example template:
     ```javascript
     class MyGame {
       constructor(ui) {
         this.ui = ui;
         this.player = { x: ui.canvas.width / 2, y: ui.canvas.height - 50 };
         this.init();
       }
       init() {
         this.ui.setCallback('onMove', (dx, dy, isMobile) => this.handleMove(dx, dy, isMobile));
         this.ui.setCallback('onAim', (x, y) => this.handleAim(x, y));
         this.ui.setCallback('onShoot', (dist, isActive) => this.handleShoot(dist, isActive));
         this.ui.setCallback('onAction', () => this.handleAction());
         this.ui.setCallback('onRestart', () => this.handleRestart());
         this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
         this.loop();
       }
       handleMove(dx, dy, isMobile) {
         const speed = isMobile ? 2 : 5;
         this.player.x += dx * speed;
         this.player.y += dy * speed;
       }
       handleAim(x, y) {
         // Store aim coordinates
       }
       handleShoot(dist, isActive) {
         // Handle action (e.g., attack)
       }
       handleAction() {
         // Handle action (e.g., grab)
       }
       handleRestart() {
         // Reset game state
       }
       handleResize(width, height) {
         // Adjust positions
       }
       update() {
         // Update game state
       }
       render() {
         const ctx = this.ui.ctx;
         ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
         // Draw game elements
       }
       loop() {
         this.update();
         this.render();
         requestAnimationFrame(() => this.loop());
       }
     }
     const game = new MyGame(ui);
     ```
3. **Add Graphic Assets** (Optional):
   - Place sprites (e.g., PNG files) in an `assets/` folder.
   - Preload images in the constructor and render using `ctx.drawImage`.
   - Example:
     ```javascript
     this.image = new Image();
     this.image.src = 'assets/sprite.png';
     this.image.onload = () => { /* Render with ctx.drawImage */ };
     ```
   - Source permissively licensed assets from reliable platforms like [OpenGameArt](https://opengameart.org/).
4. **Test**:
   - Replace `game.js` with your new file and serve the project (`python -m http.server 8000`).
   - Ensure visuals stay within the canvas and inputs work across mobile and desktop.

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request with a detailed description.

Please ensure code adheres to the existing style and includes tests where applicable. For major changes, open an issue first to discuss.

## License
This project is proprietary software. **All Rights Reserved**. See the [LICENSE](./LICENSE) file for details.

## Contact
For questions, bug reports, or feature requests, please open an issue on the repository or contact the project maintainer at [your-email@example.com].

---

*Built with passion for retro arcade action!*