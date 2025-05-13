export class GameSelector {
  constructor(interface) {
    this.interface = interface;
    this.canvas = interface.canvas;
    this.ctx = interface.ctx;
    this.gamesList = interface.gamesList || [];
    this.coverImages = new Map();
    this.scrollY = 0;
    this.maxScrollY = 0;
    this.isDragging = false;
    this.startY = 0;
    this.lastY = 0;
    this.loadImages();
    this.setupInput();
  }

  async loadImages() {
    for (const game of this.gamesList) {
      try {
        const img = new Image();
        img.src = `./games/${game}/assets/cover.png`;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            console.error(`Failed to load cover for ${game}`);
            resolve();
          };
        });
        this.coverImages.set(game, img);
      } catch (error) {
        console.error(`Error loading cover for ${game}:`, error);
      }
    }
  }

  display() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const tileSize = 100;
    const padding = 10;
    const cols = Math.floor(this.canvas.width / (tileSize + padding));
    const rows = Math.ceil(this.gamesList.length / cols);
    this.maxScrollY = Math.max(0, (rows * (tileSize + padding)) - this.canvas.height);

    this.ctx.fillStyle = '#F5F5F5';
    this.ctx.font = '16px Arial, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    this.gamesList.forEach((game, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = col * (tileSize + padding) + padding;
      const y = row * (tileSize + padding) + padding - this.scrollY;
      const img = this.coverImages.get(game);
      if (img && y + tileSize >= 0 && y <= this.canvas.height) {
        this.ctx.drawImage(img, x, y, tileSize, tileSize);
        this.ctx.fillText(this.interface.formatGameName(game), x + tileSize / 2, y + tileSize + 20);
      }
    });
  }

  setupInput() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.startY = e.clientY;
      this.lastY = this.startY;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaY = this.lastY - e.clientY;
        this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + deltaY));
        this.lastY = e.clientY;
        this.display();
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.startY = e.touches[0].clientY;
      this.lastY = this.startY;
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        const deltaY = this.lastY - e.touches[0].clientY;
        this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY + deltaY));
        this.lastY = e.touches[0].clientY;
        this.display();
      }
    });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener('click', async (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top + this.scrollY;
      const tileSize = 100;
      const padding = 10;
      const cols = Math.floor(this.canvas.width / (tileSize + padding));

      this.gamesList.forEach(async (game, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const tileX = col * (tileSize + padding) + padding;
        const tileY = row * (tileSize + padding) + padding;
        if (x >= tileX && x <= tileX + tileSize && y >= tileY && y <= tileY + tileSize) {
          try {
            const module = await import(`./games/${game}/game.js`);
            this.interface.currentGame = new module.default(this.interface);
            this.interface.canvas.onclick = null;
          } catch (error) {
            console.error(`Failed to load game ${game}:`, error);
            this.ctx.fillStyle = '#F5F5F5';
            this.ctx.font = '24px Arial, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`Failed to load ${game}`, this.canvas.width / 2, this.canvas.height / 2);
            setTimeout(() => this.display(), 2000);
          }
        }
      });
    });
  }
}