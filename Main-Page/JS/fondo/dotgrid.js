class DotGrid {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.canvas = document.createElement('canvas');
    this.canvas.className = 'dot-grid-canvas';
    // Estilo para asegurar que el canvas llene el div
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';

    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.dots = [];
    this.mouse = { x: -1000, y: -1000 };

    // CONFIGURACIÓN (Ajusta 'force' si quieres más repulsión)
    this.config = {
      dotSize: 3,
      gap: 25,
      color: '#1b3b59', // Azul oscuro
      proximity: 120,   // Radio de detección
      force: 40,        // Fuerza de levantamiento
      returnSpeed: 0.1  // Velocidad de retorno
    };

    this.init();
  }

  init() {
    this.resize();

    // Resize observer es mejor que window.resize para elementos div
    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(this.container);

    // Detectar movimiento en el contenedor
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });

    this.container.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    this.animate();
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.createDots();
  }

  createDots() {
    this.dots = [];
    // Calculamos columnas y filas basándonos en el tamaño actual
    const cols = Math.floor(this.width / this.config.gap);
    const rows = Math.floor(this.height / this.config.gap);

    // Centramos la grilla
    const startX = (this.width - ((cols - 1) * this.config.gap)) / 2;
    const startY = (this.height - ((rows - 1) * this.config.gap)) / 2;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = startX + i * this.config.gap;
        const y = startY + j * this.config.gap;
        this.dots.push({
          baseX: x,
          baseY: y,
          x: x,
          y: y
        });
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this.config.color;

    this.dots.forEach((dot) => {
      // Calcular distancia
      const dx = this.mouse.x - dot.baseX;
      const dy = this.mouse.y - dot.baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let targetX = dot.baseX;
      let targetY = dot.baseY;

      // Física de repulsión
      if (distance < this.config.proximity) {
        const angle = Math.atan2(dy, dx);
        const forceMultiplier = (this.config.proximity - distance) / this.config.proximity;
        const moveDistance = forceMultiplier * this.config.force;

        // Mover en dirección opuesta al mouse
        targetX -= Math.cos(angle) * moveDistance;
        targetY -= Math.sin(angle) * moveDistance;
      }

      // Suavizado (Lerp)
      dot.x += (targetX - dot.x) * this.config.returnSpeed;
      dot.y += (targetY - dot.y) * this.config.returnSpeed;

      // Dibujar
      this.ctx.beginPath();
      this.ctx.arc(dot.x, dot.y, this.config.dotSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Iniciar cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
  new DotGrid('dot-grid-container');
});
