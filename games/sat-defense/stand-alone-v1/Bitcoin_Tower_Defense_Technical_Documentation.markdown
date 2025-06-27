# Bitcoin Tower Defense: Technical Documentation

## Overview
Bitcoin Tower Defense is a browser-based, mobile-first strategy game where players defend a central base (representing a Bitcoin stash) from waves of enemies using towers. Built as a single `index.html` file with inline CSS and vanilla JavaScript, it uses HTML5 Canvas for rendering and features a cypherpunk aesthetic with neon-glow hollow polygons. This document details the design goals, build approach, current implementation, and planned future features.

## Design Goals
1. **Mobile-First Experience**:
   - Optimize for touch-based interactions on mobile devices.
   - Responsive UI with adaptive canvas and button sizes.
   - Ensure smooth performance on low-end devices.

2. **Minimal Dependencies**:
   - Single `index.html` file with no external libraries.
   - Use vanilla JavaScript and CSS for portability and simplicity.

3. **Extensible Architecture**:
   - Modular classes for towers, enemies, projectiles, and other entities.
   - Flexible UI to accommodate new tools and actions.
   - Scalable game mechanics for future enemy/tower types and obstacles.

4. **Cypherpunk Aesthetic**:
   - Hollow polygons with neon glows (green base, yellow towers, red enemies).
   - Dark theme with Matrix-inspired green borders and text.
   - Bitcoin-themed economy using SATs as currency and health.

5. **Engaging Gameplay**:
   - Strategic tower placement with economic trade-offs.
   - Dynamic wave progression with increasing difficulty.
   - Clear feedback via animations, announcements, and UI updates.

6. **Robust Debugging**:
   - Timestamped console logs for key events (e.g., tower placement, wave changes).
   - Avoid excessive logging to maintain clarity.

## Build Approach
### Architecture
- **Single File**: All code resides in `index.html`, with inline `<style>` for CSS and `<script>` for JavaScript, ensuring easy deployment and no external dependencies.
- **HTML5 Canvas**: Used for rendering game entities (base, towers, enemies, projectiles, explosions, announcements).
- **Object-Oriented Design**: Classes (`Tower`, `Enemy`, `Projectile`, `Explosion`, `Announcement`) encapsulate entity logic, with `draw` and `update` methods for rendering and state changes.
- **Game State Management**: Centralized `game` object tracks SATs, wave number, tower points, entities, and flags (e.g., `waveActive`, `gameOver`).
- **Event-Driven Input**: Canvas click handler for tower placement; button event listeners for tools and actions.

### Key Components
1. **Game Loop**:
   - Driven by `requestAnimationFrame` for 60fps rendering.
   - Clears canvas, applies zoom (based on base range), renders entities, updates states, checks wave end, and updates UI.
   - Stops on game over with `cancelAnimationFrame`.

2. **Rendering**:
   - Uses `ctx.save()`/`ctx.restore()` for isolated drawing states.
   - Zoom effect: `zoom = Math.min(1.5, Math.max(0.5, 1 / (base.range / 200)))`, centered on base.
   - Entities drawn as hollow polygons with neon glows (e.g., green circle for base, yellow hexagon for towers).

3. **UI Layout**:
   - Flexbox-based layout: 10% header, 70% game area, 20% controls.
   - Controls split into tools (3x3 grid) and actions (vertical list).
   - Buttons styled with neon green borders, glow on active/hover, dimmed when disabled.
   - Responsive design with `clamp` for font sizes and media queries for portrait/landscape.

4. **Economy and Health**:
   - SATs serve as both currency and health metric.
   - Base health starts at 21; enemies deduct 3 health on reaching base.
   - Towers cost 7 SATs; Small Repairs tool adds 5 health for 5 SATs.
   - Enemy kills yield 5 SATs; half of base health lost per wave is restored.

5. **Wave Mechanics**:
   - Waves spawn `wave * 2` enemies at map edges with dynamic intervals (`Math.max(200, 1000 / (1 + wave / 10))` ms).
   - Wave ends when all enemies are spawned and defeated; increments `maxTowerPoints`.
   - Announcements ("Wave X Started!", "Wave X Ended!") display for 2 seconds.

6. **Input Handling**:
   - Tower placement via canvas clicks, with 10ms debouncing.
   - Normalized coordinates ([0,1]) for resize stability.
   - Buttons toggle placement mode or trigger actions, disabled during waves or game over.

7. **Logging**:
   - Events like game start, tower placement, enemy spawn/removal, wave start/end, and game over are logged with timestamps.
   - Example: `2025-06-10 19:06:00 [EVENT] Tower placed at (x, y), cost: 7 sats`.

### Implementation Details
- **Canvas Setup**:
  - Size: `min(window.innerWidth * 0.95, 800)` x `min(window.innerHeight * 0.7, 600)`.
  - Border: 2px green (#00ff00) with matching glow.

- **Entities**:
  - **Base**: Hollow green circle, radius 25px, range 150px (expandable), shoots 1 damage every 1000ms.
  - **Tower**: Hollow yellow hexagon, radius 20px, range 100px, shoots 1 damage every 1000ms, costs 7 SATs.
  - **Enemy**: Hollow red triangle, size 15px, 3 health, 2px/frame speed, deals 3 damage to base.
  - **Projectile**: Hollow white circle, radius 3px, 5px/frame speed, 1 damage.
  - **Explosion**: Hollow red circle, expands 15px to 50px over 500ms, fading out.
  - **Announcement**: Green text, fades over 2000ms, centered at canvas top-quarter.

- **Constraints**:
  - Towers require 50px minimum distance from base center.
  - Limited by `maxTowerPoints` (starts at 3, +1 per wave).
  - Actions/tools disabled during waves or game over.

- **Error Handling**:
  - `isUpdatingUI` flag prevents recursive UI updates.
  - Try-catch in `updateUI` logs errors without breaking the game.
  - `gameOver` cancels animation frame to stop updates.

## Future Steps and Features
### Planned Enhancements
1. **New Enemy Types**:
   - **Fast Enemy**: 10px size, 1 health, 4 speed, 2 SAT reward, spawns in waves 5+.
   - **Tank Enemy**: 20px size, 10 health, 1 speed, 10 SAT reward, every 5th wave.
   - **Stealth Enemy**: Semi-transparent, ignored by standard towers unless a detection tower is present.
   - **Implementation**: Add `EnemyType` enum, vary stats/visuals in `Enemy` constructor, adjust `spawnWave` to mix types based on wave number.

2. **New Tower Types**:
   - **Splash Tower**: 0.5 damage to enemies within 50px of target, 10 SATs, 2 tower points.
   - **Slowing Tower**: Reduces enemy speed by 50% for 3s, 8 SATs, 1 tower point, no damage.
   - **Sniper Tower**: 200px range, 3 damage, 2000ms fire rate, 12 SATs, 2 tower points.
   - **Implementation**: Add `TowerType` enum, create buttons in `#tool-buttons` grid, extend `Tower` with type-specific logic.

3. **Damage Types**:
   - Introduce kinetic, EMP, and crypto damage types.
   - Enemies have resistances (e.g., tanks resist kinetic, fast enemies resist EMP).
   - **Implementation**: Add `damageType` to `Projectile`, `resistanceMap` to `Enemy`, modify damage in `Projectile.update`.

4. **Tower Upgrades**:
   - Upgrade individual towers between waves (e.g., +50% damage for 5 SATs, +20% range for 3 SATs).
   - Add "Select Tower" mode to click and upgrade towers on canvas.
   - **Implementation**: Add `upgrades` object to `Tower`, create "Upgrade" button, display options on tower click.

5. **Obstacles/Barriers**:
   - Placeable obstacles with 50 health, 5 SATs cost, enemies navigate around.
   - **Implementation**: Create `Obstacle` class, add to `game.obstacles`, implement A* pathfinding for enemies.

6. **Thematic Enhancements**:
   - Enemy names (e.g., "Phishing Bot") and tower names (e.g., "Encryption Cannon") shown on hover.
   - Display Bitcoin security tips between waves (e.g., "Use a hardware wallet").
   - **Implementation**: Add `name` to `Enemy`/`Tower`, render tooltips with `ctx.fillText`, show tips in modal post-wave.

7. **Visual Feedback**:
   - Floating text for SAT gain/loss (e.g., "+5" or "-3" at base/enemy).
   - Highlight base range during placement mode.
   - **Implementation**: Create `TextEffect` class, toggle range circle opacity in `Base.draw`.

8. **Audio**:
   - Sound effects for shots, enemy defeats, and wave completion using `AudioContext`.
   - **Implementation**: Create `AudioManager` class for sine wave shots, noise explosions.

9. **Difficulty Scaling**:
   - Increase enemy health/speed every 10 waves (+0.5 health, +0.2 speed).
   - Boss waves every 10 waves with high-health enemy (50 health, 20 SAT reward).
   - **Implementation**: Scale `Enemy` stats in constructor, add boss logic in `spawnWave`.

10. **UI Enhancements**:
    - Pause button to halt waves/updates.
    - Wave timer or enemy counter in header.
    - **Implementation**: Add `game.paused` flag, pause `gameLoop`/`spawnWave`, render timer with `ctx.fillText`.

### Development Roadmap
1. **Short-Term (1-2 Weeks)**:
   - Implement Fast and Tank enemy types.
   - Add Splash and Slowing towers.
   - Introduce floating text for SAT changes.
   - Add pause button and wave counter.

2. **Medium-Term (3-4 Weeks)**:
   - Develop obstacle placement with basic pathfinding.
   - Implement tower upgrades and selection mode.
   - Add Bitcoin-themed tooltips and security tips.
   - Introduce damage types and resistances.

3. **Long-Term (5-8 Weeks)**:
   - Add Stealth enemies and Sniper towers.
   - Implement audio effects with `AudioContext`.
   - Scale difficulty with boss waves and stat increases.
   - Polish UI with animations and enhanced feedback.

### Technical Considerations
- **Performance**: Monitor frame rate with additional entities; optimize by culling off-screen objects.
- **Pathfinding**: Use grid-based A* for obstacles, balancing accuracy and performance.
- **State Management**: Ensure new features (e.g., pause, upgrades) integrate with `game` object without conflicts.
- **Mobile Testing**: Validate touch accuracy and button sizing for new tools.
- **Extensibility**: Maintain class-based structure for new entity types; use enums for type safety.

### Potential Challenges
- **Pathfinding Complexity**: A* may impact performance with many enemies; consider simplified algorithms or grid optimization.
- **UI Clutter**: 3x3 tool grid may feel crowded with new tools; explore tabbed or scrollable UI if needed.
- **Balance**: New towers/enemies require playtesting to avoid overpowered or trivial gameplay.
- **Audio Compatibility**: Ensure `AudioContext` works across browsers, with fallback for unsupported devices.

## Current Implementation Summary
- **Core Mechanics**: Players defend a base (21 health) with towers (7 SATs, 100px range), earning 5 SATs per enemy kill. Waves spawn `wave * 2` enemies; half base health lost is restored post-wave.
- **Tools**: Firewall Tower (7 SATs), Small Repairs (5 SATs for +5 health).
- **UI**: 3x3 tool grid, vertical action buttons, responsive header with wave/SATs/health stats.
- **Visuals**: Hollow polygons (green base, yellow towers, red enemies), neon glows, green map border.
- **Constraints**: Towers need 50px distance from base; actions disabled during waves.
- **Logging**: Key events (e.g., placement, wave changes) logged with timestamps.

## Conclusion
Bitcoin Tower Defense achieves a mobile-friendly, standalone tower defense experience with a unique Bitcoin-themed economy and cypherpunk aesthetic. The modular architecture and extensible UI provide a strong foundation for future enhancements, including new entities, mechanics, and thematic elements. By addressing performance, balance, and UI challenges, the game can evolve into a rich, engaging strategy title with broad appeal.