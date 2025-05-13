export default class GorillaRampageGame {
  constructor(ui) {
    console.log('GorillaRampageGame loaded - Refactored Version (Schema Aligned, No Instantiation)'); // Debug log
    this.ui = ui;
    this.player = {
      x: this.ui.canvas.width / 2,
      y: this.ui.canvas.height - 50,
      keyboardSpeed: 5,
      mobileSpeed: 2,
      radius: 20,
      dx: 0,
      dy: 0,
      health: 100,
      heldObject: null,
      lastAttack: 0,
      attackCooldown: 500, // ms
      lastGrab: 0,
      grabCooldown: 1000 // ms
    };
    this.enemies = [];
    this.items = [];
    this.score = 0;
    this.wave = 1;
    this.gameOver = false;
    this.isMobileInput = false;
    this.aimX = 0;
    this.aimY = 0;
    this.lastWaveSpawn = 0;
    this.waveInterval = 5000; // ms
    this.maxEnemies = 5;
    this.init();
  }

  init() {
    this.ui.setCallback('onMove', (dx, dy, isMobile) => this.handleMove(dx, dy, isMobile));
    this.ui.setCallback('onAim', (x, y) => this.handleAim(x, y));
    this.ui.setCallback('onShoot', (dist, isActive, dx, dy) => this.handleShoot(dist, isActive, dx, dy));
    this.ui.setCallback('onAction', () => this.handleAction());
    this.ui.setCallback('onRestart', () => this.restart());
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.spawnWave();
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
    if (this.gameOver || !isActive || Date.now() - this.player.lastAttack < this.player.attackCooldown) return;
    this.player.lastAttack = Date.now();

    if (this.player.heldObject && dist >= 1) {
      // Throw held object
      const obj = this.player.heldObject;
      const speed = 7;
      const directionX = dx || (this.aimX - this.player.x) / this.ui.canvas.width;
      const directionY = dy || (this.aimY - this.player.y) / this.ui.canvas.height;
      const mag = Math.sqrt(directionX * directionX + directionY * directionY);
      const normalizedDx = mag > 0 ? directionX / mag : 0;
      const normalizedDy = mag > 0 ? directionY / mag : 0;
      obj.dx = normalizedDx * speed;
      obj.dy = normalizedDy * speed;
      obj.isThrown = true;
      this.player.heldObject = null;
    } else if (!this.player.heldObject) {
      // Punch/Kick
      this.enemies = this.enemies.filter(e => {
        const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
        if (dist < this.player.radius + e.radius + 10) {
          this.score += 10;
          return false;
        }
        return true;
      });
    }
  }

  handleAction() {
    if (this.gameOver || Date.now() - this.player.lastGrab < this.player.grabCooldown) return;
    this.player.lastGrab = Date.now();

    if (this.player.heldObject) {
      // Release held object
      this.player.heldObject = null;
      return;
    }

    // Try to grab enemy
    for (let e of this.enemies) {
      const dist = Math.sqrt((e.x - this.player.x) ** 2 + (e.y - this.player.y) ** 2);
      if (dist < this.player.radius + e.radius + 10) {
        this.player.heldObject = { ...e, type: 'enemy' };
        this.enemies = this.enemies.filter(enemy => enemy !== e);
        return;
      }
    }

    // Try to grab item
    for (let i of this.items) {
      const dist = Math.sqrt((i.x - this.player.x) ** 2 + (i.y - this.player.y) ** 2);
      if (dist < this.player.radius + i.radius && !i.isGrabbed) {
        this.player.heldObject = { ...i, type: 'item' };
        i.isGrabbed = true;
        return;
      }
    }
  }

  spawnWave() {
    if (this.gameOver || Date.now() - this.lastWaveSpawn < this.waveInterval || this.enemies.length > 0) return;
    this.lastWaveSpawn = Date.now();
    const enemyCount = Math.min(3 + Math.floor(this.wave / 2), this.maxEnemies);
    for (let i = 0; i < enemyCount; i++) {
      this.enemies.push({
        x: Math.random() * (this.ui.canvas.width - 20) + 10,
        y: Math.random() * (this.ui.canvas.height / 2) + 10,
        radius: 10,
        speed: 1 + this.wave * 0.1
      });
    }
    // Spawn an item occasionally
    if (Math.random() < 0.3) {
      this.items.push({
        x: Math.random() * (this.ui.canvas.width - 20) + 10,
        y: Math.random() * (this.ui.canvas.height - 100) + 50,
        radius: 5,
        isGrabbed: false
      });
    }
    this.wave++;
  }

  update() {
    if (this.gameOver) return;

    // Move player
    const speed = this.isMobileInput ? this.player.mobileSpeed : this.player.keyboardSpeed;
    const magnitude = Math.sqrt(this.player.dx ** 2 + this.player.dy ** 2);
    if (magnitude > 0) {
      const directionX = this.player.dx;
      const directionY = this.player.dy;
      this.player.x += directionX * speed;
      this.player.y += directionY * speed;
      this.player.x = Math.max(this.player.radius, Math.min(this.ui.canvas.width - this.player.radius, this.player.x));
      this.player.y = Math.max(this.player.radius, Math.min(this.ui.canvas.height - this.player.radius, this.player.y));
    }

    // Update enemies
    this.enemies.forEach(e => {
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.sqrt(dx ** 2 + dy ** 2);
      if (dist > 1) {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
      // Player-enemy collision
      if (dist < this.player.radius + e.radius) {
        this.player.health -= 5;
        this.score = Math.max(0, this.score - 5);
        this.enemies = this.enemies.filter(enemy => enemy !== e);
        if (this.player.health <= 0) this.gameOver = true;
      }
    });

    // Update thrown objects
    if (this.player.heldObject && this.player.heldObject.isThrown) {
      const obj = this.player.heldObject;
      obj.x += obj.dx;
      obj.y += obj.dy;
      // Check collision with enemies
      this.enemies = this.enemies.filter(e => {
        const dist = Math.sqrt((obj.x - e.x) ** 2 + (obj.y - e.y) ** 2);
        if (dist < obj.radius + e.radius) {
          this.score += 15;
          return false;
        }
        return true;
      });
      // Remove object if out of bounds
      if (obj.x < 0 || obj.x > this.ui.canvas.width || obj.y < 0 || obj.y > this.ui.canvas.height) {
        this.player.heldObject = null;
      }
    }

    this.spawnWave();
  }

  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);

    // Render player (gorilla mockup: large circle with arm circles)
    ctx.fillStyle = '#8B4513'; // Brown, aligned with Zapcade theme
    ctx.beginPath();
    ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5C2D0C'; // Darker brown for arms
    ctx.beginPath();
    ctx.arc(this.player.x - 10, this.player.y - 10, 5, 0, Math.PI * 2); // Left arm
    ctx.arc(this.player.x + 10, this.player.y - 10, 5, 0, Math.PI * 2); // Right arm
    ctx.fill();

    // Render enemies (human mockup: circle with limb lines)
    ctx.fillStyle = '#FFDAB9'; // Beige (peach) for enemies
    ctx.strokeStyle = '#1A1A1A'; // Matte black for limbs
    ctx.lineWidth = 2;
    this.enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x - 5, e.y + 10); // Left arm
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + 5, e.y + 10); // Right arm
      ctx.stroke();
    });

    // Render items (small circles)
    ctx.fillStyle = '#D3D3D3'; // Light gray, aligned with Zapcade theme
    this.items.forEach(i => {
      if (!i.isGrabbed) {
        ctx.beginPath();
        ctx.arc(i.x, i.y, i.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Render held object
    if (this.player.heldObject) {
      ctx.fillStyle = this.player.heldObject.type === 'enemy' ? '#FFDAB9' : '#D3D3D3';
      ctx.beginPath();
      ctx.arc(
        this.player.heldObject.isThrown ? this.player.heldObject.x : this.player.x + 15,
        this.player.heldObject.isThrown ? this.player.heldObject.y : this.player.y - 15,
        this.player.heldObject.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
      if (this.player.heldObject.type === 'enemy' && !this.player.heldObject.isThrown) {
        ctx.strokeStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.moveTo(this.player.x + 15, this.player.y - 15);
        ctx.lineTo(this.player.x + 10, this.player.y - 5); // Left arm
        ctx.moveTo(this.player.x + 15, this.player.y - 15);
        ctx.lineTo(this.player.x + 20, this.player.y - 5); // Right arm
        ctx.stroke();
      }
    }

    // Render UI
    ctx.fillStyle = '#F5F5F5'; // Light white, aligned with Zapcade theme
    ctx.font = '20px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.score}`, 10, 30);
    ctx.fillText(`Health: ${this.player.health}`, 10, 50);
    ctx.fillText(`Wave: ${this.wave}`, 10, 70);
    ctx.fillText(`Holding: ${this.player.heldObject ? this.player.heldObject.type : 'None'}`, 10, 90);

    // Game over screen
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, this.ui.canvas.width, this.ui.canvas.height);
      ctx.fillStyle = '#F5F5F5';
      ctx.font = '40px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.ui.canvas.width / 2, this.ui.canvas.height / 2 - 20);
      ctx.font = '20px Arial, sans-serif';
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
      radius: 20,
      dx: 0,
      dy: 0,
      health: 100,
      heldObject: null,
      lastAttack: 0,
      attackCooldown: 500,
      lastGrab: 0,
      grabCooldown: 1000
    };
    this.enemies = [];
    this.items = [];
    this.score = 0;
    this.wave = 1;
    this.gameOver = false;
    this.isMobileInput = false;
    this.lastWaveSpawn = 0;
    this.spawnWave();
  }

  handleResize(width, height) {
    this.player.x = width / 2;
    this.player.y = height - 50;
  }
}