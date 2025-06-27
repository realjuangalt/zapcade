Bitcoin Tower Defense: Idea Document
Overview
Bitcoin Tower Defense is a browser-based, mobile-friendly strategy game where players protect a virtual Bitcoin stash (represented by a central base) from waves of enemies using defensive towers. The game runs in a single index.html file with no external dependencies, using vanilla JavaScript and HTML5 Canvas. It features a cypherpunk aesthetic with hollow polygons, neon glow effects, and a Bitcoin-inspired theme. This document details the current feature set, design elements, and ideas for future development, providing a blueprint for recreation.
Current Features
Core Gameplay

Objective: Protect the central base (a Bitcoin stash) from enemies that spawn from random canvas edges, aiming to reach the base and deduct health (sats).
Base:
Positioned at the canvas center (canvas.width / 2, canvas.height / 2).
Represented as a hollow green circle with a neon glow, radius 25 pixels.
Health equals total sats (game.sats + 7 * towers.length, max 100).
Acts as a shooting tower with:
Damage: 1 per projectile.
Range: Starts at 150 pixels, expandable by 10px increments.
Fire rate: 1000ms.
Targets the nearest enemy within range.


Displays health as white text inside the circle.
Range circle: Hollow, green (rgba(0, 255, 0, 0.2)), matches base color.


Enemies:
Spawn randomly from any canvas edge (top, bottom, left, right) at a distance of 1.2 times the canvas diagonal.
Represented as hollow red triangles with a neon glow, size 15 pixels.
Health: 3 (matches 3-sat reward on defeat).
Speed: 2 pixels per frame.
Move directly toward the base using vector normalization.
Deduct 10 sats from game.sats when reaching the base.
On defeat, trigger a hollow red (#ff0000) explosion animation (expands from 15 to 50 pixels over 500ms, fading out).


Towers:
Placed by clicking within the base’s range circle (minimum 50px from base center to avoid overlap).
Represented as hollow yellow hexagons with a neon glow, size 20 pixels.
Cost: 7 sats and 1 tower point per tower.
Limited by game.maxTowerPoints (starts at 3, +1 per wave).
Stats:
Damage: 1 per projectile.
Range: 100 pixels (hollow yellow circle, rgba(255, 255, 0, 0.2)).
Fire rate: 1000ms.
Targets the nearest enemy within range.




Waves:
Triggered by clicking “Start Wave” button.
Enemy count: wave * 2 (e.g., Wave 1: 2 enemies, Wave 5: 10 enemies).
Spawn interval: Dynamic, Math.max(200, 1000 / (1 + game.wave / 10)) ms (e.g., Wave 1: ~909ms, Wave 20: ~333ms, min 200ms).
Rewards:
3 sats per enemy kill.
wave * 2 sats on wave completion (1 sat per enemy).
+1 tower point on wave completion.




Game Over:
Occurs when base health (game.sats + 7 * towers.length) reaches 0.
Displays a centered overlay with “Game Over”, “Your Bitcoin stash was compromised!”, and a “Restart” button.



Visual Design

Aesthetic: Cypherpunk with hollow polygons and neon glows:
Base: Hollow green circle, #00ff00, glow effect.
Towers: Hollow yellow hexagons, #ffff00, glow effect.
Enemies: Hollow red triangles, #ff0000, glow effect.
Projectiles: Hollow white circles, #ffffff, size 3 pixels, glow effect.
Explosions: Hollow red circles, #ff0000, expanding and fading, glow effect.


Canvas:
Background: Dark gray (#333).
Edges: Orange glow (#f7931a) on left, blue glow (#00f) on right via box-shadow.
Size: Responsive, window.innerWidth * 0.9 x window.innerHeight * 0.7, capped at 800x600 pixels.


Zoom Effect:
Scales the canvas based on base range: zoom = Math.min(1.5, Math.max(0.5, 1 / (base.range / 200))).
Range 150px: Zoom ~1.33 (zoomed in).
Range 200px: Zoom = 1.
Range 400px: Zoom ~0.5 (zoomed out).


Centers view on the base using ctx.translate(-base.x * (zoom - 1), -base.y * (zoom - 1)) and ctx.scale(zoom, zoom).
UI elements (header, controls) remain unscaled by using ctx.save() and ctx.restore().



User Interface

Header (10% of screen):
Left: “Wave: X” (current wave number).
Right: “Towers: Y/Z | Sats: W” (current/max tower points, base health).
Background: Dark gray (#333).


Game Area (70% of screen):
Contains the canvas, centered, with enemies, towers, base, and projectiles.


Controls (20% of screen):
Game Controls: Horizontal row of buttons:
Place Tower: Toggles placement mode (disabled during waves, game over, insufficient sats, or max tower points). Text: “Place Tower (7 sats)” or “Stop Placing”.
Start Wave: Triggers the next wave (disabled during waves or game over). Text: “Start Wave”.
Clear Towers: Removes all towers, refunds 7 sats and tower points (disabled during waves or game over). Text: “Clear Towers”.
Expand Range: Increases base range by 10px, costs 10 * 1.5^(range/50) sats, max 500px (disabled during waves, game over, insufficient sats, or max range). Text: “Expand Range (X sats)”.


Weapons/Tools: Empty section for future buttons, styled as a dark gray (#2a2a2a) flex container.
Buttons: Dark gray (#555), white text, neon border/glow, responsive sizing (smaller on portrait orientation).


Game Over Overlay:
Centered, semi-transparent black (rgba(0, 0, 0, 0.8)), neon border (#fff), glow effect.
Shows “Game Over”, “Your Bitcoin stash was compromised!”, and a “Restart” button.



Mechanics

Sats:
Currency: Sats (satoshis), starting at 21.
Sources:
3 sats per enemy kill.
wave * 2 sats per wave completion.


Uses:
7 sats to place a tower.
10 * 1.5^(range/50) sats to expand base range.


Base health: sats + 7 * towers.length, capped at 100.


Tower Points:
Limit tower placement, starting at 3, +1 per wave.
Each tower costs 1 point.
Cleared via “Clear Towers” button, resetting to 0.


Zoom Effect:
Adjusts view scale based on base range, enhancing visibility of the expanding defense area.
Click coordinates are adjusted to account for zoom: x = base.x + ((clientX - rect.left) * (canvas.width / rect.width) - canvas.width / 2) / zoom.


Enemy Spawns:
Random edge selection (0: top, 1: right, 2: bottom, 3: left).
Positioned 1.2 * canvas diagonal away to appear off-screen.
Spawn interval decreases with wave number for increasing difficulty.



Logging

Purpose: Debugging and monitoring via browser console (F12).
Format: YYYY-MM-DD HH:MM:SS [EVENT] Details.
Events:
Game start: “Game started”.
Restart: “Game restarted”.
Tower placement: “Tower placed at (x, y), cost: 7 sats, points: Y/Z”.
Placement failure: “Tower placement failed at (x, y), reason: [not placing/game over/insufficient sats/max tower points/too close to base/outside base range]”.
Wave start: “Wave X started, N enemies”.
Wave end: “Wave X ended, rewarded N sats, new tower points: Z”.
Enemy defeat: “Enemy defeated, +3 sats”.
Range expansion: “Range expanded to Xpx, cost: Y sats”.
Range expansion failure: “Range expansion failed, insufficient sats: X < Y”.
Game over: “Game over at wave X, sats: Y”.
Game loop: “Game loop frame” (per frame, for debugging).
UI update: “Updating UI” or “UI update skipped to prevent recursion”.



Technical Details

Platform: Browser-based, single index.html with inline CSS and JavaScript.
Dependencies: None, uses vanilla JavaScript and HTML5 Canvas.
Canvas Rendering:
Uses ctx.save()/ctx.restore() for zoom and drawing isolation.
requestAnimationFrame for smooth 60fps rendering.
Clears canvas each frame with ctx.clearRect.


Event Handling:
Canvas click: Places towers with 100ms debouncing (game.lastPlacementTime).
Button clicks: Toggle placement, start waves, clear towers, expand range.
Resize: Adjusts canvas and base position responsively.


State Management:
game object tracks sats, wave, tower points, enemies, towers, projectiles, explosions, and flags (e.g., isPlacingTower, gameOver, waveActive, isUpdatingUI, rafId).
base object tracks position, range, and shooting stats.


Error Handling:
Prevents recursive updateUI calls with isUpdatingUI flag.
Cancels requestAnimationFrame on game over or reset using game.rafId.
Logs errors in updateUI with try-catch.



Design Elements

Cypherpunk Aesthetic:
Hollow polygons with neon glows (ctx.shadowColor, ctx.shadowBlur = 10).
Colors: Green (base), yellow (towers), red (enemies), white (projectiles), red (explosions).
Dark theme: #222 body, #333 canvas/controls, #2a2a2a weapons/tools.
Neon edge effects: Orange (#f7931a) left, blue (#00f) right.


Responsive Layout:
Header: 10% height, controls: 20% height, game area: 70% height.
Canvas scales to window.innerWidth * 0.95 x window.innerHeight * 0.7, capped at 800x600.
Buttons shrink in portrait mode for mobile usability.


Minimalist UI:
Clear, white monospace text for readability.
Buttons with neon borders and glows, disabled states (#444, no glow).
Game over overlay with semi-transparent background and neon styling.



Ideas for Future Development
These are planned enhancements to expand the game, as per your indications for new enemies, towers, and tools:

New Enemy Types:

Fast Enemy: Smaller (10px), 1 health, 4 speed, 1-sat reward, spawns in later waves.
Tank Enemy: Larger (20px), 10 health, 1 speed, 10-sat reward, appears every 5 waves.
Stealth Enemy: Partially transparent, ignored by towers unless a special tower type is present.
Implementation: Add an EnemyType enum in the Enemy class, vary stats and visuals, adjust spawn logic to mix types based on wave number.


New Tower Types:

Splash Tower: Deals 0.5 damage to all enemies within 50px of the target, costs 10 sats, 2 tower points.
Slowing Tower: Reduces enemy speed by 50% for 3 seconds, costs 8 sats, 1 tower point, no damage.
Sniper Tower: Long range (200px), high damage (3), slow fire rate (2000ms), costs 12 sats, 2 tower points.
Implementation: Extend Tower with a type property, add buttons to #weapons-tools for selection, adjust placement logic to check type-specific costs.


Damage Types:

Introduce damage types (e.g., kinetic, EMP, crypto) with enemy resistances (e.g., tank enemies resist kinetic, fast enemies resist EMP).
Towers specify a damage type (e.g., base: crypto, splash: kinetic).
Implementation: Add damageType to Projectile and resistance map to Enemy, modify damage calculation in Projectile.update.


Tower Upgrades:

Allow upgrading individual towers between waves (e.g., +50% damage for 5 sats, +20% range for 3 sats).
Add a “Select Tower” mode to click and upgrade towers on the canvas.
Implementation: Add upgrades object to Tower, create an “Upgrade” button in #game-controls, show upgrade options on tower click.


Obstacles:

Reintroduce obstacles (as initially planned) that enemies navigate around, with health (e.g., 50) and placement cost (e.g., 5 sats).
Implementation: Create an Obstacle class, add to game.obstacles, implement pathfinding (e.g., A* algorithm) for enemies.


Thematic Elements:

Add enemy names (e.g., “Phishing Bot”, “Malware Drone”) and tower names (e.g., “Firewall Tower”, “Encryption Cannon”) displayed on hover or in UI.
Show Bitcoin security tips between waves (e.g., “Use a hardware wallet for safety”).
Implementation: Add name to Enemy and Tower, render tooltips with ctx.fillText on hover, show tips in a modal after waves.


Visual Feedback:

Show sat gain/loss animations (e.g., “+3” or “-10” floating text at the base or enemy).
Highlight the base’s range circle when in placement mode.
Implementation: Add a TextEffect class for floating text, toggle range circle opacity in Base.draw.


Audio:

Add sound effects using AudioContext (no dependencies) for tower shots, enemy defeats, and wave completion.
Implementation: Create an AudioManager class to play generated sounds (e.g., sine waves for shots, noise for explosions).


Difficulty Scaling:

Increase enemy health or speed every 10 waves (e.g., +0.5 health, +0.2 speed).
Add boss waves every 10 waves with a single high-health enemy (e.g., 50 health, 20-sat reward).
Implementation: Modify Enemy constructor to scale stats based on game.wave, add boss logic in spawnWave.


UI Enhancements:

Add a pause button to #game-controls to halt waves and updates.
Show a wave timer or enemy counter in the header.
Implementation: Add game.paused flag, pause gameLoop and spawnWave, render timer with ctx.fillText.



Implementation Notes for Developers

Recreate the Game:
Use the provided code structure: single index.html with inline CSS and JavaScript.
Implement classes (Base, Tower, Enemy, Projectile, Explosion) as shown, with draw and update methods.
Set up gameLoop with requestAnimationFrame, using ctx.save/ctx.restore for zoom.
Handle events (click, resize) with debouncing and zoom-adjusted coordinates.
Use setTimeout for checkWaveEnd and setInterval for spawnWave.
Style UI with flexbox, dark theme, and neon effects (borders, shadows).


Key Mechanics:
Base health: sats + 7 * towers.length, max 100.
Tower placement: Within base range, 50px minimum distance, 7 sats, 1 tower point.
Enemy spawns: Random edge, wave * 2 count, dynamic interval.
Zoom: 1 / (base.range / 200), clamped 0.5–1.5.
Logging: Timestamped console.log for all events.


Pitfalls to Avoid:
Prevent recursive updateUI calls with isUpdatingUI flag.
Cancel requestAnimationFrame on game over/reset with rafId.
Ensure click coordinates account for zoom to avoid placement bugs.
Debounce clicks (100ms) to prevent multiple tower spawns.


Future Development:
Add new classes (EnemyType, TowerType, Obstacle) for planned features.
Extend #weapons-tools with buttons for new towers/tools.
Implement pathfinding for obstacles using a simple grid-based A* algorithm.
Test on mobile to ensure touch controls and button sizing work.



Conclusion
This document captures the complete feature set of the latest Bitcoin Tower Defense, including gameplay mechanics, visual design, UI, and technical details. It provides a clear roadmap for recreating the game and extending it with new enemies, towers, and features. The cypherpunk aesthetic, responsive design, and Bitcoin theme create a unique strategy experience, with ample room for future enhancements to deepen gameplay and engagement.
