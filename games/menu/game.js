export default class GameMenu {
  constructor(ui) {
    this.ui = ui;
    this.canvas = ui.canvas; // Ensure canvas is assigned
    this.canvasWidth = ui.width;
    this.canvasHeight = ui.height;
    this.games = [];
    this.scrollY = 0;
    this.scrollSpeed = 5;
    this.lastTouchY = null;
    this.selectedIndex = null;
    this.cardWidth = 200; // Landscape width
    this.cardHeight = 120; // Landscape height
    this.cardGap = 10;
    this.padding = 10;
    this.init();
  }

  async init() {
    if (!this.canvas) {
      console.error('Canvas is undefined in GameMenu');
      return;
    }
    this.ui.setCallback('onResize', (w, h) => this.handleResize(w, h));
    this.ui.setCallback('place', (x, y) => this.handlePlace(x, y));
    this.ui.resetControls();
    await this.loadGamesList();
    this.setupScrollListeners();
    this.loop();
  }

  async loadGamesList() {
    try {
      const response = await fetch('./games/games.json');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      this.games = await Promise.all(data.games.map(async (name) => {
        let thumbnail = null;
        try {
          const img = new Image();
          img.src = `./games/${name}/thumbnail.png`;
          await new Promise((resolve) => {
            img.onload = () => { thumbnail = img; resolve(); };
            img.onerror = () => resolve(null); // Fallback to null if thumbnail fails
          });
        } catch (e) {
          console.warn(`Thumbnail load failed for ${name}:`, e);
          thumbnail = null;
        }
        return { name, thumbnail, displayName: this.formatGameName(name) };
      }));
    } catch (error) {
      console.error('Failed to load games list:', error);
      this.games = [
        { name: 'sat-defense', thumbnail: null, displayName: 'Sat Defense' },
        { name: 'cosmic-defender', thumbnail: null, displayName: 'Cosmic Defender' },
        { name: 'gorilla-rampage', thumbnail: null, displayName: 'Gorilla Rampage' }
      ];
    }
  }

  formatGameName(folderName) {
    return folderName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  handleResize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  setupScrollListeners() {
    if (!this.canvas) return; // Safety check
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.scrollY += e.deltaY * this.scrollSpeed / 100;
      this.clampScroll();
    });

    this.canvas.addEventListener('touchstart', (e) => {
      this.lastTouchY = e.touches[0].clientY;
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.lastTouchY !== null) {
        const deltaY = e.touches[0].clientY - this.lastTouchY;
        this.scrollY -= deltaY * this.scrollSpeed / 50;
        this.clampScroll();
        this.lastTouchY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.lastTouchY = null;
    });
  }

  clampScroll() {
    const totalHeight = Math.ceil(this.games.length / Math.floor((this.canvasWidth - this.padding * 2) / (this.cardWidth + this.cardGap))) * (this.cardHeight + this.cardGap) - this.cardGap + this.padding * 2;
    this.scrollY = Math.max(0, Math.min(this.scrollY, totalHeight - this.canvasHeight));
  }

  handlePlace(x, y) {
    const cardsPerRow = Math.floor((this.canvasWidth - this.padding * 2) / (this.cardWidth + this.cardGap));
    const startX = this.padding + (this.canvasWidth - cardsPerRow * (this.cardWidth + this.cardGap) + this.cardGap) / 2;
    const startY = this.padding - this.scrollY;

    this.games.forEach((game, index) => {
      if (game.name === 'menu') return;
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);
      const cardX = startX + col * (this.cardWidth + this.cardGap);
      const cardY = startY + row * (this.cardHeight + this.cardGap);
      if (x >= cardX && x <= cardX + this.cardWidth && y >= cardY && y <= cardY + this.cardHeight) {
        this.ui.loadGame(game.name);
      }
    });
  }

  loop() {
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  render() {
    const ctx = this.ui.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = 'rgba(42, 42, 42, 0.8)';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const cardsPerRow = Math.floor((this.canvasWidth - this.padding * 2) / (this.cardWidth + this.cardGap));
    const startX = this.padding + (this.canvasWidth - cardsPerRow * (this.cardWidth + this.cardGap) + this.cardGap) / 2;
    const startY = this.padding - this.scrollY;

    this.games.forEach((game, index) => {
      if (game.name === 'menu') return;
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);
      const x = startX + col * (this.cardWidth + this.cardGap);
      const y = startY + row * (this.cardHeight + this.cardGap);

      ctx.save();
      ctx.strokeStyle = '#F7931A';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#F7931A';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#2A2A2A';
      ctx.fillRect(x, y, this.cardWidth, this.cardHeight);
      ctx.strokeRect(x, y, this.cardWidth, this.cardHeight);
      ctx.restore();

      if (game.thumbnail) {
        ctx.drawImage(game.thumbnail, x + 5, y + 5, this.cardWidth - 10, this.cardHeight - 10);
      } else {
        ctx.fillStyle = '#F5F5F5';
        ctx.font = '14px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(game.displayName, x + this.cardWidth / 2, y + this.cardHeight / 2);
      }
    });
  }
}