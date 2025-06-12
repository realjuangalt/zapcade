export default class CosmicDefenderGame {
  constructor(ui) {
    this.ui = ui;
    this.canvasWidth = ui.width; // CSS pixels
    this.canvasHeight = ui.height;
    this.player = {
      x: this.canvasWidth / 2,
      y: this.canvasHeight - 50,
      keyboardSpeed: 5,
      mobileSpeed: 5,
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
    this.lastShotTime = 0;
    this.shootCooldown = 200; // ms
    this.enemySpawnRate = 1000; // ms
    this.lastSpawnTime = 0;
    this.isMobileInput = false;
    this.autoShoot = true;
    this.isShooting = false;
    this.init();
  }

  init() {
    this.ui.setCallback('onMove', (dx, dy, isMobile) => this.handleMove(dx, dy, isMobile));
    this.ui.setCallback('onAim', (x, y) => this.handleAim(x, y));
    this.ui.setCallback('onShoot', (dist, isActive, dx, dy) => this.handleShoot(dist, isActive, dx, dy));
    this.ui.setCallback('onAction', () => this.toggleWeaponMode());
    this.ui.setCallback('onRestart', () => this.restart());
    this.ui.setCallback('onResize', (width, height) => this.handleResize(width, height));
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
    if (Date.now() - this.lastShotTime < this.shootCooldown) return;
    this.lastShotTime = Date.now();
    const speedFactor = dist * 5;
    const directionX = dx || (this.aimX - this.player.x) / 100;
    const directionY = dy || (this.aimY - this.player.y) / 100;
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

  toggleWeaponMode() {
    if (this.gameOver) return;
    this.weaponMode = this.weaponMode === 'Gun' ? 'Bomb' : 'Gun';
  }

  spawnEnemy() {
    if (Date.now() - this.lastSpawnTime < this.enemySpawnRate || this.gameOver) return;
    this.lastSpawnTime = Date.now();
    this.enemies.push({
      x: Math.random() * (this.canvasWidth - 20) + 10,
      y: -10,
      radius: 10,
      speed: 1 + this.score / 100
    });
  }

  update() {
    if (this.gameOver) return;

    // Apply constant movement with fixed speed
    const speed = this.isMobileInput ? this.player.mobileSpeed : this.player.keyboardSpeed;
    const magnitude = Math.sqrt(this.player.dx * this.player.dx + this.player.dy * this.player.dy);
    if (magnitude > 0) {
      const directionX = this.player.dx;
      const directionY = this.player.dy;
      this.player.x += directionX * speed;
      this.player.y += directionY * speed;
      this.player.x = Math.max(this.player.radius, Math.min(this.canvasWidth - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.canvasHeight - this.player.radius, this.player.y));
    }

    // Update bullets
    this.bullets = this.bullets.filter(b => {
      b.x += b.dx;
      b.y += b.dy;
      return b.y > -b.radius && b.y < this.canvasHeight + b.radius &&
             b.x > -b.radius && b.x < this.canvasWidth + b.radius;
    });

    // Update enemies
    this.enemies.forEach(e => {
      e.y += e.speed;
      if (e.y > this.canvasHeight) {
        this.enemies = this.enemies.filter(enemy => enemy !== e);
        this.score = Math.max(0, this.score - 5);
      }
    });

    // Collision detection
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

    // Player-enemy collision
    this.enemies.forEach(e => {
      const dist = Math.sqrt((this.player.x - e.x) ** 2 + (this.player.y - e.y) ** 2);
      if (dist < this.player.radius + e.radius) this.gameOver = true;
    });

    this.spawnEnemy();
  }

  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Render player
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Render bullets
    this.bullets.forEach(b => {
      ctx.fillStyle = b.type === 'gun' ? 'yellow' : 'red';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render enemies
    ctx.fillStyle = 'purple';
    this.enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 10, 30);

    // Render ammo
    ctx.fillText(`${this.weaponMode}: ${this.weaponMode === 'Gun' ? '∞' : this.bombAmmo}`, 10, 50);

    // Game over screen
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      ctx.fillStyle = 'white';
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText('Tap to Restart', this.canvasWidth / 2, this.canvasHeight / 2 + 20);
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
      x: this.canvasWidth / 2,
      y: this.canvasHeight - 50,
      keyboardSpeed: 5,
      mobileSpeed: 5,
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
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.player.x = Math.min(this.player.x, width - this.player.radius);
    this.player.y = Math.min(this.player.y, height - this.player.radius);
  }
}