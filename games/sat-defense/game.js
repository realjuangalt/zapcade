class Tower {
  constructor(x, y, type = 'firewall', canvasWidth, canvasHeight, getNearestEnemy, game, logEvent) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 12;
    this.range = 80;
    this.damage = 1;
    this.fireRate = 1000;
    this.lastShot = 0;
    this.health = 7;
    this.cost = 7;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.getNearestEnemy = getNearestEnemy;
    this.game = game;
    this.logEvent = logEvent;
  }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = this.x + this.radius * Math.cos(angle);
      const y = this.y + this.radius * Math.sin(angle);
      ctx[i === 0 ? 'moveTo' : 'lineTo'](x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  update() {
    if (Date.now() - this.lastShot < this.fireRate) return;
    const target = this.getNearestEnemy(this.x, this.y, this.range);
    if (target) {
      this.game.projectiles.push(new Projectile(this.x, this.y, target, this.damage, this.game, this.logEvent));
      this.lastShot = Date.now();
    }
  }
}

class Enemy {
  constructor(x, y, type = 'basic', base, game, logEvent) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = 10;
    this.health = 3;
    this.speed = 2;
    this.rewardModifier = 1;
    this.damage = 3;
    this.base = base;
    this.game = game;
    this.logEvent = logEvent;
  }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.size);
    ctx.lineTo(this.x + this.size * Math.cos(Math.PI / 6), this.y + this.size * Math.sin(Math.PI / 6));
    ctx.lineTo(this.x - this.size * Math.cos(Math.PI / 6), this.y + this.size * Math.sin(Math.PI / 6));
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  update() {
    const dx = this.base.x - this.x;
    const dy = this.base.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.base.radius + this.size) {
      const damage = Math.min(this.base.health, this.damage);
      this.base.health -= damage;
      this.game.baseHealthLost += damage;
      this.logEvent(`Enemy reached base, -${damage} health`);
      this.health = 0;
      return;
    }
    const vx = (dx / dist) * this.speed;
    const vy = (dy / dist) * this.speed;
    this.x += vx;
    this.y += vy;
  }
}

class Projectile {
  constructor(x, y, target, damage, game, logEvent) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = 5;
    this.radius = 2;
    this.game = game;
    this.logEvent = logEvent;
  }
  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  update() {
    if (!this.target || this.target.health <= 0) return false;
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < this.speed) {
      this.target.health -= this.damage;
      if (this.target.health <= 0) {
        this.game.sats += 5 * this.target.rewardModifier;
        this.logEvent(`Enemy defeated, +${5 * this.target.rewardModifier} sats`);
        this.game.explosions.push(new Explosion(this.target.x, this.target.y));
      }
      return false;
    }
    const vx = (dx / dist) * this.speed;
    const vy = (dy / dist) * this.speed;
    this.x += vx;
    this.y += vy;
    return true;
  }
}

class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.maxRadius = 40;
    this.startTime = Date.now();
    this.duration = 500;
  }
  draw(ctx) {
    const progress = (Date.now() - this.startTime) / this.duration;
    if (progress > 1) return false;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 0, 0, ${1 - progress})`;
    ctx.lineWidth = 1;
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius + (this.maxRadius - this.radius) * progress, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    return true;
  }
}

class Announcement {
  constructor(text, canvasWidth, canvasHeight) {
    this.text = text;
    this.startTime = Date.now();
    this.duration = 2000;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }
  draw(ctx) {
    const progress = (Date.now() - this.startTime) / this.duration;
    if (progress > 1) return false;
    ctx.save();
    ctx.fillStyle = `rgba(0, 255, 0, ${1 - progress})`;
    ctx.font = 'clamp(16px, 4vw, 18px) Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.canvasWidth / 2, this.canvasHeight / 4);
    ctx.restore();
    return true;
  }
}

export default class SatDefense {
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
      buttonActive: false // To debounce button clicks
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
    this.gridMode = false; // Can be set via ui.setGameConfig
    this.gridSize = 8; // Default grid size
    this.init();
  }

  init() {
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.ui.setCallback('onRestart', () => this.restart());
    this.ui.setCallback('place', (x, y) => this.handlePlace(x, y));
    this.ui.setGameConfig({ gridMode: this.gridMode, gridSize: this.gridSize });
    this.setControls();
    this.loop();
  }

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

    setTimeout(() => {
      const towerButton = document.getElementById('tower-1');
      const repairsButton = document.getElementById('small-repairs');
      const startWaveButton = document.getElementById('start-wave');
      const clearTowersButton = document.getElementById('clear-towers');
      const expandRangeButton = document.getElementById('expand-range');

      if (!towerButton || !repairsButton || !startWaveButton || !clearTowersButton || !expandRangeButton) {
        console.error('One or more buttons not found:', { towerButton, repairsButton, startWaveButton, clearTowersButton, expandRangeButton });
        return;
      }

      const addClickGlow = (button) => {
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 200);
      };

      const handleButtonClick = (button, eventName, condition, action) => {
        const handleClick = (e) => {
          if (this.game.buttonActive) return; // Debounce to prevent multiple triggers
          e.preventDefault();
          this.game.buttonActive = true;
          this.logEvent(`${eventName} button clicked`);
          this.logEvent(`State: waveActive=${this.game.waveActive}, gameOver=${this.game.gameOver}, sats=${this.game.sats}, towers=${this.game.towers.length}`);

          if (condition.call(this)) {
            const success = action.call(this);
            if (success) {
              this.updateUI();
              addClickGlow(button);
            } else {
              this.logEvent(`${eventName} action failed`);
            }
          } else {
            this.logEvent(`${eventName} click ignored: invalid state`);
          }
          // Reset buttonActive after a short delay to prevent rapid clicks
          setTimeout(() => {
            this.game.buttonActive = false;
          }, 300); // Increased debounce delay to 300ms
        };
        button.addEventListener('touchstart', handleClick, { once: true }); // Ensure single trigger per touch
        button.addEventListener('click', handleClick, { once: true }); // Ensure single trigger per click
      };

      handleButtonClick(towerButton, 'Firewall Tower', function() {
        return !this.game.waveActive && !this.game.gameOver && this.game.sats >= 7 && this.game.towers.length < this.game.maxTowerPoints;
      }, function() {
        this.game.placementMode = this.game.placementMode === 'firewall' ? null : 'firewall';
        this.logEvent(`Tower placement mode: ${this.game.placementMode}`);
        return true;
      });

      handleButtonClick(repairsButton, 'Small Repairs', function() {
        return !this.game.waveActive && !this.game.gameOver && this.game.sats >= 5;
      }, function() {
        return this.applySmallRepairs();
      });

      handleButtonClick(startWaveButton, 'Start Wave', function() {
        return !this.game.waveActive && !this.game.gameOver;
      }, function() {
        this.game.wave++;
        this.game.waveActive = true;
        this.game.placementMode = null;
        this.spawnWave();
        return true;
      });

      handleButtonClick(clearTowersButton, 'Clear Towers', function() {
        return !this.game.waveActive && !this.game.gameOver && this.game.towers.length > 0;
      }, function() {
        this.game.sats += this.game.towers.reduce((sum, tower) => sum + tower.cost, 0);
        this.game.towers = [];
        this.game.placementMode = null;
        this.logEvent('Towers cleared');
        return true;
      });

      handleButtonClick(expandRangeButton, 'Expand Range', function() {
        const cost = Math.round(10 * 1.5 ** (this.base.range / 50));
        return !this.game.waveActive && !this.game.gameOver && this.game.sats >= cost && this.base.range < this.canvasWidth / 2 - 50;
      }, function() {
        return this.applyExpandRange();
      });

      this.updateUI();
    }, 0);
  }

  handleMove(dx, dy, isMobile) {
    // No movement in tower defense
  }

  handleAim(x, y) {
    if (this.game.gameOver || !this.game.placementMode) return;
    this.aimX = x;
    this.aimY = y;
  }

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

  handleShoot(dist, isActive, dx, dy) {
    // No shooting in tower defense
  }

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

  handleResize(width, height) {
    this.canvasWidth = Math.round(width);
    this.canvasHeight = Math.round(height);
    this.base.x = Math.round(width / 2);
    this.base.y = Math.round(height / 2);
    this.base.range = Math.min(this.base.range, Math.round(width / 2 - 50));
    this.updateUI();
  }

  loop() {
    if (!this.game.gameOver) {
      this.update();
      this.render();
    }
    requestAnimationFrame(() => this.loop());
  }

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
    this.updateUI();

    if (this.base.health <= 0) {
      this.game.gameOver = true;
      this.logEvent(`Game over at wave ${this.game.wave}, sats: ${this.game.sats}`);
      this.updateUI();
    }
  }

  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw header bar
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

  logEvent(message) {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`${now} [EVENT] ${message}`);
  }

  spawnWave() {
    if (!this.game.waveActive) return;
    this.game.enemiesToSpawn = this.game.wave * 2;
    const interval = Math.max(200, 1000 / (1 + this.game.wave / 10));
    this.game.announcements.push(new Announcement(`Wave ${this.game.wave} Started!`, this.canvasWidth, this.canvasHeight));
    this.logEvent(`Wave ${this.game.wave} started, ${this.game.enemiesToSpawn} enemies`);
    this.game.spawnIntervalId = setInterval(() => {
      if (this.game.enemiesToSpawn <= 0 || this.game.gameOver) {
        clearInterval(this.game.spawnIntervalId);
        this.game.spawnIntervalId = null;
        return;
      }
      const edge = Math.floor(Math.random() * 4);
      let x, y;
      if (edge === 0) { x = Math.random() * this.canvasWidth; y = 0; }
      else if (edge === 1) { x = this.canvasWidth; y = Math.random() * this.canvasHeight; }
      else if (edge === 2) { x = Math.random() * this.canvasWidth; y = this.canvasHeight; }
      else { x = 0; y = Math.random() * this.canvasHeight; }
      this.game.enemies.push(new Enemy(x, y, 'basic', this.base, this.game, this.logEvent));
      this.game.enemiesToSpawn--;
      this.logEvent(`Enemy spawned, ${this.game.enemiesToSpawn} remaining to spawn`);
    }, interval);
  }

  checkWaveEnd() {
    if (this.game.waveActive && this.game.enemies.length == 0 && this.game.enemiesToSpawn == 0 && !this.game.spawnIntervalId && !this.game.gameOver) {
      this.game.waveActive = false;
      this.game.maxTowerPoints++;
      if (this.game.baseHealthLost > 0) {
        const restored = Math.floor(this.game.baseHealthLost / 2);
        this.base.health += restored;
        this.game.baseHealthLost = 0;
        this.logEvent(`Wave ${this.game.wave} ended, restored ${restored} base health`);
      }
      this.game.announcements.push(new Announcement(`Wave ${this.game.wave} Ended!`, this.canvasWidth, this.canvasHeight));
      this.logEvent(`Wave ${this.game.wave} ended, new tower points: ${this.game.maxTowerPoints}`);
      this.updateUI();
    }
  }

  applySmallRepairs() {
    if (this.game.sats < 5) return false; // Check if enough SATs
    const healthIncrease = 5; // Increase health by 5 points
    const newHealth = this.base.health + healthIncrease;
    if (newHealth <= this.base.health) return false; // Prevent wasting SATs if no health gain
    this.game.sats -= 5;
    this.base.health = newHealth; // No cap, health can increase indefinitely
    this.logEvent(`Small repairs applied, +${healthIncrease} base health`);
    return true;
  }

  applyExpandRange() {
    const cost = Math.round(10 * 1.5 ** (this.base.range / 50));
    if (this.game.sats < cost || this.base.range >= this.canvasWidth / 2 - 50) return false;
    this.game.sats -= cost;
    this.base.range += 10;
    this.logEvent(`Range expanded to ${this.base.range}, cost: ${cost} sats`);
    return true;
  }

  updateUI() {
    const towerButton = document.getElementById('tower-1');
    if (towerButton) {
      towerButton.disabled = this.game.waveActive || this.game.gameOver || this.game.sats < 7 || this.game.towers.length >= this.game.maxTowerPoints;
      towerButton.classList.toggle('active', this.game.placementMode === 'firewall' && !towerButton.disabled);
    }
    const repairsButton = document.getElementById('small-repairs');
    if (repairsButton) {
      repairsButton.disabled = this.game.waveActive || this.game.gameOver || this.game.sats < 5;
      repairsButton.classList.toggle('active', false);
    }
    const startWaveButton = document.getElementById('start-wave');
    if (startWaveButton) {
      startWaveButton.disabled = this.game.waveActive || this.game.gameOver;
      startWaveButton.classList.toggle('active', !this.game.waveActive && !this.game.gameOver);
    }
    const clearTowersButton = document.getElementById('clear-towers');
    if (clearTowersButton) {
      clearTowersButton.disabled = this.game.waveActive || this.game.gameOver || this.game.towers.length === 0;
      clearTowersButton.classList.toggle('active', !this.game.waveActive && !this.game.gameOver && this.game.towers.length > 0);
    }
    const rangeButton = document.getElementById('expand-range');
    if (rangeButton) {
      const rangeCost = Math.round(10 * 1.5 ** (this.base.range / 50));
      rangeButton.textContent = `Expand Range (${rangeCost} SATs)`;
      rangeButton.disabled = this.game.waveActive || this.game.gameOver || this.game.sats < rangeCost || this.base.range >= this.canvasWidth / 2 - 50;
      rangeButton.classList.toggle('active', !this.game.waveActive && !this.game.gameOver && this.game.sats >= rangeCost && this.base.range < this.canvasWidth / 2 - 50);
    }
  }
}