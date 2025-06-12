# Zapcade

## Overview
**Zapcade** is a web-based game console platform designed to host multiple games through a unified interface, supporting mobile, tablet, and desktop devices with touch (custom buttons, joysticks), keyboard, and mouse controls. The platform features an emulator-like architecture, with `index.html` serving as a reusable "console" providing a canvas, input controls, and a dynamic game menu, while `game.js` files in the `games/` directory implement game logic as "cartridges." Enhanced with continuous rendering for smoother gameplay, Zapcade showcases games like **Sat Defense**, a strategic tower defense game where players protect a base using tactical tower placement. The platform is designed for seamless cross-platform play and extensibility, and we warmly invite developers to create and contribute new games!

## Features
- **Mobile-First Design**: Intuitive touch controls with custom buttons for actions in Sat Defense (e.g., tower placement, wave start) and optional joysticks, plus an action button for specific interactions.
- **Cross-Platform Support**: Playable on mobile (touch) and desktop (mouse click, keyboard) with consistent gameplay across both.
- **Engaging Gameplay**: Sat Defense offers strategic tower management and wave defense with real-time SATs and health tracking, exemplifying the platform's capabilities.
- **Smooth Performance**: Optimized for 60 FPS on mid-range mobile devices using lightweight canvas rendering with continuous loops.
- **Modular Architecture**: The `Interface` class in `index.html` supports swapping `game.js` files (e.g., `sat-defense/game.js`), enabling easy addition of new games.
- **In-Canvas & Status Bar UI**: Sat Defense leverages a status bar for real-time updates (e.g., "Wave 1 | Towers 0/3 | Budget 21 | Health 21"), enhancing user feedback.

## Installation

### Prerequisites
- A modern web browser (e.g., Chrome, Safari, Firefox) with JavaScript enabled.
- No external dependencies or server setup required.

### Setup
1. **Clone or Download the Repository**:
   ```bash
   git clone <repository-url>
   cd zapcade
   ```
   Alternatively, download the ZIP file and extract it.

2. **File Structure**:
   Ensure the following files are in the project directory:
   - `index.html`: The main interface file.
   - `games/`: Directory containing game folders (e.g., `sat-defense/`).
   - `games/sat-defense/game.js`: Logic for Sat Defense (example game).
   - `games/games.json`: List of game folders.
   - `README.md`: This file.
   - `LICENSE`: The license file.

3. **Update `games.json`**:
   ```json
   {
     "games": ["sat-defense"]
   }
   ```
   Add or modify game folder names as needed to include other games.

4. **Run the Game**:
   - Double-click `index.html` to open it directly in your web browser (e.g., `file:///path/to/zapcade/index.html`). Most modern browsers will run it without issues, though some security features (e.g., file access restrictions) may be limited.

5. **Play**:
   - On **mobile**, use the right joystick to preview tower placement in Sat Defense, with custom buttons for tower placement, repairs, wave start, tower clearing, and range expansion.
   - On **desktop**, use mouse clicks for tower placement in Sat Defense, with the same custom buttons for actions.
   - Tap/click the canvas to restart after a game over.

## Usage
- **Sat Defense Objective**: Place towers to defend the base from enemy waves, managing SATs and health.
- **Controls**:
  - **Mobile**:
    - Right Joystick: Preview tower placement.
    - Custom Buttons: "Firewall Tower" (7 SATs), "Small Repairs" (5 SATs), "Start Wave", "Clear Towers", "Expand Range".
  - **Desktop**:
    - Mouse Click: Place towers.
    - Custom Buttons: Same as mobile.
  - **Restart**: Tap/click the canvas when the "GAME OVER" screen appears.
- **Resources** (Sat Defense):
  - SATs: Currency for towers (7 SATs), repairs (5 SATs), range expansion (variable cost).
  - Health: Base health starts at 21, reduced by enemy damage.

## Development
We invite developers to create new games for Zapcade! To get started:
1. **Understand the Interface**:
   - The `Interface` class in `index.html` provides a canvas (`ui.canvas`, `ui.ctx`), callbacks (`onResize`, `place`, `onRestart`), control customization (`ui.setCustomControls`), and dimensions (`ui.width`, `ui.height` in CSS pixels).
   - For detailed integration help, refer to the [Interface Schema](#) in the project documentation (available in the repository).
2. **Create a New Game**:
   - Write a `game.js` file with a class (e.g., `MyGame`) that accepts `ui` and implements the required callbacks.
   - Use `ui.ctx` for rendering and `ui.width`, `ui.height` for boundaries.
   - Example template (adaptable for a tower defense style like Sat Defense):
     ```javascript
     export default class MyGame {
       constructor(ui) {
         this.ui = ui;
         this.canvasWidth = ui.width;
         this.canvasHeight = ui.height;
         this.game = { /* state, e.g., towers, SATs */ };
         this.init();
       }
       init() {
         this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
         this.ui.setCallback('place', (x, y) => this.handlePlace(x, y));
         this.ui.setCallback('onRestart', () => this.restart());
         this.setControls();
         this.loop();
       }
       // Implement handlers, update, render, loop
     }
     ```
3. **Test**:
   - Create a new folder under `games/` (e.g., `games/my-game/`), add `game.js`, update `games.json`, and double-click `index.html` to test.
   - Ensure visuals stay within the canvas and inputs work across platforms.
4. **Submit Your Game**:
   - Once your game is ready, fork the repository, create a feature branch, and submit a pull request with your `game.js` and updated `games.json`.
   - Include a brief description of your game in the pull request for review.

## Contributing
Contributions are welcome! To contribute a new game or enhance the platform:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit changes (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request with a detailed description.

Please ensure code adheres to the existing style (e.g., `#F5F5F5` text, `#F7931A` accents, `#1A1A1A` background) and includes tests where applicable. For major changes or new game submissions, open an issue first to discuss.

## License
This project is proprietary software. **All Rights Reserved**. See the [LICENSE](./LICENSE) file for details.

## Contact
For questions, bug reports, feature requests, or to discuss new game submissions, please open an issue on the repository or contact the project maintainer at [your-email@example.com].

---

*Built with love for strategic and arcade gaming! Last updated: 12:19 AM CDT, Thursday, June 12, 2025.*