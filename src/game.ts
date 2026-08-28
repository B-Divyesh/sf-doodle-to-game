import type { GameTemplate, Project } from './state';

type Direction = 'up' | 'down' | 'left' | 'right';
type GamePhase = 'ready' | 'playing' | 'won' | 'lost';

interface GameCallbacks {
  onHud: (score: string, detail: string) => void;
  onFinish: (message: string, won: boolean) => void;
}

interface MovingObject { x: number; y: number; vx: number; vy: number; size: number }

const WIDTH = 720;
const HEIGHT = 430;
const PLAYER_SIZE = 58;

const maze = [
  '111111111111',
  '100000100001',
  '101110101101',
  '101000100001',
  '101011111101',
  '100010000001',
  '111010111101',
  '100010100001',
  '101110101101',
  '100000000001',
  '111111111111',
];

export class TinyGame {
  private context: CanvasRenderingContext2D;
  private phase: GamePhase = 'ready';
  private frame = 0;
  private lastTime = 0;
  private startedAt = 0;
  private score = 0;
  private moves = 0;
  private player = { x: 56, y: HEIGHT / 2, size: PLAYER_SIZE };
  private objects: MovingObject[] = [];
  private pressed = new Set<Direction>();
  private heroImage?: HTMLImageElement;
  private objectImage?: HTMLImageElement;
  private audio?: AudioContext;
  private keyDown = (event: KeyboardEvent) => this.handleKey(event, true);
  private keyUp = (event: KeyboardEvent) => this.handleKey(event, false);

  constructor(private canvas: HTMLCanvasElement, private project: Project, private callbacks: GameCallbacks) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser cannot open the game canvas.');
    this.context = context;
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    this.loadImage(project.assets.hero, (image) => { this.heroImage = image; this.draw(); });
    this.loadImage(project.assets.object, (image) => { this.objectImage = image; this.draw(); });
    window.addEventListener('keydown', this.keyDown);
    window.addEventListener('keyup', this.keyUp);
    this.reset();
  }

  start(): void {
    cancelAnimationFrame(this.frame);
    this.phase = 'playing';
    this.score = 0;
    this.moves = 0;
    this.player = this.project.template === 'maze' ? { x: 1, y: 1, size: PLAYER_SIZE } : { x: 56, y: HEIGHT / 2, size: PLAYER_SIZE };
    this.objects = this.seedObjects(this.project.template);
    this.startedAt = performance.now();
    this.lastTime = this.startedAt;
    this.callbacks.onFinish('', false);
    this.tick(this.startedAt);
  }

  reset(): void {
    cancelAnimationFrame(this.frame);
    this.phase = 'ready';
    this.player = this.project.template === 'maze' ? { x: 1, y: 1, size: PLAYER_SIZE } : { x: 56, y: HEIGHT / 2, size: PLAYER_SIZE };
    this.objects = this.seedObjects(this.project.template);
    this.callbacks.onHud('Ready', this.instructions());
    this.draw();
  }

  dispose(): void {
    cancelAnimationFrame(this.frame);
    window.removeEventListener('keydown', this.keyDown);
    window.removeEventListener('keyup', this.keyUp);
    void this.audio?.close();
  }

  press(direction: Direction, active: boolean): void {
    if (active) {
      this.pressed.add(direction);
      if (this.project.template === 'maze' && this.phase === 'playing') this.moveMaze(direction);
    } else this.pressed.delete(direction);
  }

  private handleKey(event: KeyboardEvent, active: boolean): void {
    const direction = ({ ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' } as Record<string, Direction>)[event.key];
    if (direction) {
      event.preventDefault();
      if (!event.repeat || this.project.template !== 'maze') this.press(direction, active);
    }
  }

  private instructions(): string {
    if (this.project.template === 'dodge') return 'Stay clear of the falling drawings.';
    if (this.project.template === 'collect') return 'Collect every drawing you can.';
    return 'Find the green star. Every move counts.';
  }

  private seedObjects(template: GameTemplate): MovingObject[] {
    if (template === 'dodge') return Array.from({ length: this.project.speed === 'zippy' ? 7 : 5 }, (_, index) => ({
      x: 170 + Math.random() * (WIDTH - 210), y: -index * 90, vx: 0,
      vy: (this.project.speed === 'zippy' ? 185 : 125) + Math.random() * 45, size: 46,
    }));
    if (template === 'collect') return [{ x: WIDTH * .68, y: HEIGHT * .45, vx: 0, vy: 0, size: 48 }];
    return [];
  }

  private tick = (now: number): void => {
    if (this.phase !== 'playing') return;
    const delta = Math.min((now - this.lastTime) / 1000, .04);
    this.lastTime = now;
    if (this.project.template !== 'maze') this.updateContinuous(delta, now);
    this.draw();
    if (this.phase === 'playing') this.frame = requestAnimationFrame(this.tick);
  };

  private updateContinuous(delta: number, now: number): void {
    const velocity = this.project.speed === 'zippy' ? 280 : 205;
    let dx = 0, dy = 0;
    if (this.pressed.has('left')) dx -= 1;
    if (this.pressed.has('right')) dx += 1;
    if (this.pressed.has('up')) dy -= 1;
    if (this.pressed.has('down')) dy += 1;
    const length = Math.hypot(dx, dy) || 1;
    this.player.x = Math.max(8, Math.min(WIDTH - PLAYER_SIZE - 8, this.player.x + dx / length * velocity * delta));
    this.player.y = Math.max(8, Math.min(HEIGHT - PLAYER_SIZE - 8, this.player.y + dy / length * velocity * delta));

    if (this.project.template === 'dodge') {
      const elapsed = (now - this.startedAt) / 1000;
      const goal = this.project.score === 'long' ? 30 : 15;
      for (const object of this.objects) {
        object.y += object.vy * delta;
        if (object.y > HEIGHT + object.size) { object.y = -object.size; object.x = 90 + Math.random() * (WIDTH - 130); }
        if (this.collides(this.player, object)) return this.finish(`So close — you lasted ${Math.floor(elapsed)} seconds.`, false);
      }
      this.callbacks.onHud(`${Math.floor(elapsed)} / ${goal}s`, 'Keep moving');
      if (elapsed >= goal) this.finish(`Brilliant dodging — ${goal} seconds!`, true);
    } else {
      const target = this.objects[0];
      const goal = this.project.score === 'long' ? 10 : 5;
      if (target && this.collides(this.player, target)) {
        this.score += 1;
        target.x = 40 + Math.random() * (WIDTH - 100);
        target.y = 40 + Math.random() * (HEIGHT - 100);
        this.beep(520 + this.score * 35);
      }
      this.callbacks.onHud(`${this.score} / ${goal}`, 'Drawings collected');
      if (this.score >= goal) this.finish(`You found all ${goal} drawings!`, true);
    }
  }

  private moveMaze(direction: Direction): void {
    const offsets: Record<Direction, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
    const [dx, dy] = offsets[direction];
    const nextX = this.player.x + dx;
    const nextY = this.player.y + dy;
    if (maze[nextY]?.[nextX] === '0') {
      this.player.x = nextX;
      this.player.y = nextY;
      this.moves += 1;
      this.beep(250, .025);
      const par = this.project.score === 'long' ? 32 : 42;
      this.callbacks.onHud(`${this.moves} moves`, `Try for ${par} or fewer`);
      if (nextX === 10 && nextY === 9) this.finish(`Maze solved in ${this.moves} moves!`, true);
      this.draw();
    }
  }

  private finish(message: string, won: boolean): void {
    this.phase = won ? 'won' : 'lost';
    cancelAnimationFrame(this.frame);
    this.beep(won ? 720 : 150, .12);
    this.callbacks.onFinish(message, won);
    this.draw();
  }

  private collides(a: { x: number; y: number; size: number }, b: { x: number; y: number; size: number }): boolean {
    const padding = 10;
    return a.x + padding < b.x + b.size && a.x + a.size - padding > b.x && a.y + padding < b.y + b.size && a.y + a.size - padding > b.y;
  }

  private loadImage(source: string | undefined, callback: (image: HTMLImageElement) => void): void {
    if (!source) return;
    const image = new Image();
    image.onload = () => callback(image);
    image.src = source;
  }

  private draw(): void {
    const context = this.context;
    context.clearRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = '#fffdf7';
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.strokeStyle = '#d9d2c4';
    context.lineWidth = 1;
    for (let x = 24; x < WIDTH; x += 48) for (let y = 24; y < HEIGHT; y += 48) {
      context.beginPath(); context.arc(x, y, 1.6, 0, Math.PI * 2); context.fillStyle = '#c8c2b5'; context.fill();
    }
    if (this.project.template === 'maze') this.drawMaze();
    else {
      for (const object of this.objects) this.drawSprite(object, this.objectImage, this.project.template === 'collect' ? '#1859c9' : '#d8422e', this.project.template === 'collect' ? 'star' : 'burst');
      this.drawSprite(this.player, this.heroImage, '#237a4b', 'hero');
    }
    if (this.phase === 'ready') this.drawCurtain('Press “Start round”');
  }

  private drawMaze(): void {
    const cell = Math.min(WIDTH / maze[0].length, HEIGHT / maze.length);
    const offsetX = (WIDTH - cell * maze[0].length) / 2;
    const offsetY = (HEIGHT - cell * maze.length) / 2;
    maze.forEach((row, y) => [...row].forEach((tile, x) => {
      if (tile === '1') {
        this.context.fillStyle = '#172033';
        this.context.fillRect(offsetX + x * cell + 2, offsetY + y * cell + 2, cell - 4, cell - 4);
      }
    }));
    const goal = { x: offsetX + 10 * cell + 5, y: offsetY + 9 * cell + 5, size: cell - 10 };
    this.drawSprite(goal, this.objectImage, '#237a4b', 'star');
    const player = { x: offsetX + this.player.x * cell + 4, y: offsetY + this.player.y * cell + 4, size: cell - 8 };
    this.drawSprite(player, this.heroImage, '#d8422e', 'hero');
  }

  private drawSprite(item: { x: number; y: number; size: number }, image: HTMLImageElement | undefined, color: string, fallback: 'hero' | 'star' | 'burst'): void {
    const context = this.context;
    if (image) {
      context.save();
      context.shadowColor = 'rgba(23,32,51,.18)'; context.shadowBlur = 8; context.shadowOffsetY = 4;
      const ratio = Math.min(item.size / image.width, item.size / image.height);
      const width = image.width * ratio, height = image.height * ratio;
      context.drawImage(image, item.x + (item.size - width) / 2, item.y + (item.size - height) / 2, width, height);
      context.restore();
      return;
    }
    context.save(); context.translate(item.x + item.size / 2, item.y + item.size / 2);
    context.fillStyle = color; context.strokeStyle = '#172033'; context.lineWidth = 4;
    context.beginPath();
    const points = fallback === 'star' ? 10 : fallback === 'burst' ? 16 : 8;
    for (let index = 0; index < points; index++) {
      const radius = index % 2 === 0 ? item.size * .46 : item.size * (fallback === 'hero' ? .40 : .24);
      const angle = -Math.PI / 2 + index * Math.PI * 2 / points;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    }
    context.closePath(); context.fill(); context.stroke(); context.restore();
  }

  private drawCurtain(text: string): void {
    this.context.fillStyle = 'rgba(255,253,247,.84)'; this.context.fillRect(0, 0, WIDTH, HEIGHT);
    this.context.fillStyle = '#172033'; this.context.textAlign = 'center'; this.context.font = '700 25px system-ui';
    this.context.fillText(text, WIDTH / 2, HEIGHT / 2);
  }

  private beep(frequency: number, duration = .06): void {
    if (!this.project.sound) return;
    try {
      this.audio ??= new AudioContext();
      const oscillator = this.audio.createOscillator();
      const gain = this.audio.createGain();
      oscillator.frequency.value = frequency; oscillator.type = 'triangle'; gain.gain.value = .045;
      oscillator.connect(gain).connect(this.audio.destination); oscillator.start();
      gain.gain.exponentialRampToValueAtTime(.001, this.audio.currentTime + duration); oscillator.stop(this.audio.currentTime + duration);
    } catch { /* Sound is optional. */ }
  }
}
