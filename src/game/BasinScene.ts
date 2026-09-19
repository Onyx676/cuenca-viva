import Phaser from 'phaser';
import { GameState } from '../models/GameState';
import { SectorId } from '../models/Sector';
import { SeasonType } from '../models/Season';

export type MapClickTarget = SectorId | 'dam' | 'aquifer' | 'mountain' | 'river';

interface WaterParticle {
  progress: number; // 0.0 to 1.0 along the path
  speed: number;
  size: number;
}

interface InfiltrationDroplet {
  x: number;
  y: number;
  speed: number;
  alpha: number;
}

/**
 * Escena gráfica interactiva en Phaser 3 estilo Diorama Educativo.
 * El agua es la protagonista visual: cauce ancho, ramificaciones con partículas
 * reactivas a la asignación real, retornos visibles y ciclo hídrico perceptible.
 */
export class BasinScene extends Phaser.Scene {
  public static initialGameState?: GameState;
  public static onSelectSectorCallback?: (target: MapClickTarget) => void;
  public static instance?: BasinScene;

  private gameState?: GameState;

  // Capas gráficas
  private skyLayer!: Phaser.GameObjects.Graphics;
  private terrainGraphics!: Phaser.GameObjects.Graphics;
  private aquiferGraphics!: Phaser.GameObjects.Graphics;
  private riverBedGraphics!: Phaser.GameObjects.Graphics;
  private canalsGraphics!: Phaser.GameObjects.Graphics;
  private reservoirGraphics!: Phaser.GameObjects.Graphics;
  private infrastructureGraphics!: Phaser.GameObjects.Graphics;
  private waterFlowGraphics!: Phaser.GameObjects.Graphics;
  private weatherFXGraphics!: Phaser.GameObjects.Graphics;

  // Etiquetas persistentes
  private damLabelText?: Phaser.GameObjects.Text;
  private riverFlowLabelText?: Phaser.GameObjects.Text;

  // Partículas y dinámicas visuales
  private clouds: { x: number; y: number; speed: number; scale: number; alpha: number }[] = [];
  private rainDrops: { x: number; y: number; speed: number; len: number }[] = [];
  private snowFlakes: { x: number; y: number; speed: number; sway: number }[] = [];
  private birds: { x: number; y: number; speed: number; baseY: number; phase: number }[] = [];
  private vaporWisps: { x: number; y: number; speed: number; alpha: number }[] = [];
  private infiltrationDroplets: InfiltrationDroplet[] = [];

  // Partículas para cada ramal de distribución (0 a 1 de progreso en su trayecto)
  private particlesCity: WaterParticle[] = [];
  private particlesAgri: WaterParticle[] = [];
  private particlesLive: WaterParticle[] = [];
  private particlesMine: WaterParticle[] = [];
  private particlesEco: WaterParticle[] = [];

  // Partículas de retorno
  private particlesReturnCity: WaterParticle[] = [];
  private particlesRecircMine: WaterParticle[] = [];

  private animTimer: number = 0;
  private onSelectSector?: (target: MapClickTarget) => void;

  // Efecto visual previo a eventos climáticos
  private eventWeatherOverride?: 'STORM' | 'DROUGHT' | 'BLIZZARD';

  // Rastreo de valores primitivos renderizados para cambio de estación, clima y reservas
  private lastRenderedSeason?: SeasonType;
  private lastRenderedClimate?: string;
  private lastRenderedYear?: number;
  private lastRenderedSnow?: number;
  private lastRenderedReservoir?: number;
  private lastRenderedAquifer?: number;
  private lastRenderedQuality?: number;
  private lastRenderedHealth?: number;

  constructor() {
    super({ key: 'BasinScene' });
  }

  public init(data: any) {
    BasinScene.instance = this;
    this.gameState = data?.gameState || BasinScene.initialGameState;
    this.onSelectSector = data?.onSelectSector || BasinScene.onSelectSectorCallback;
  }

  public updateGameState(newState: GameState): void {
    this.gameState = newState;
    if (!this.skyLayer) return;

    // Redibujar todo el diorama si hubo cambio de estación, clima, año o reservas base
    const isMajorChange =
      this.lastRenderedSeason === undefined ||
      this.lastRenderedSeason !== newState.season ||
      this.lastRenderedClimate !== newState.climateState ||
      this.lastRenderedYear !== newState.year ||
      this.lastRenderedSnow !== newState.snowReserve ||
      this.lastRenderedReservoir !== newState.reservoirVolume ||
      this.lastRenderedAquifer !== newState.aquiferVolume ||
      this.lastRenderedQuality !== newState.waterQuality ||
      this.lastRenderedHealth !== newState.basinHealth;

    if (isMajorChange) {
      this.renderBasin();
    } else {
      // Cambio ligero por movimiento de sliders: actualiza canales y etiquetas en <0.1ms
      this.updateCanalsOnly();
    }
  }

  public updateCanalsOnly(): void {
    if (!this.gameState || !this.canalsGraphics) return;
    const { width, height } = this.scale;
    this.renderCanalsAndIntakes(width, height);
    if (this.riverFlowLabelText) {
      this.riverFlowLabelText.setText(`💧 Río: ${this.gameState.riverFlow} gotas`);
    }
  }

  public setEventWeatherOverride(override?: 'STORM' | 'DROUGHT' | 'BLIZZARD'): void {
    this.eventWeatherOverride = override;
    if (this.skyLayer) {
      this.renderBasin();
    }
  }

  create(): void {
    BasinScene.instance = this;
    if (!this.gameState && BasinScene.initialGameState) {
      this.gameState = BasinScene.initialGameState;
    }
    if (!this.onSelectSector && BasinScene.onSelectSectorCallback) {
      this.onSelectSector = BasinScene.onSelectSectorCallback;
    }

    const { width, height } = this.scale;

    // Crear capas en orden de profundidad
    this.skyLayer = this.add.graphics();
    this.terrainGraphics = this.add.graphics();
    this.aquiferGraphics = this.add.graphics();
    this.riverBedGraphics = this.add.graphics();
    this.canalsGraphics = this.add.graphics();
    this.reservoirGraphics = this.add.graphics();
    this.infrastructureGraphics = this.add.graphics();
    this.waterFlowGraphics = this.add.graphics();
    this.weatherFXGraphics = this.add.graphics();

    // Textos informativos integrados en el diorama
    this.damLabelText = this.add.text(width * 0.32, height * 0.28, '🌊 Embalse: 65%', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11px',
      color: '#38bdf8',
      fontStyle: 'bold',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.riverFlowLabelText = this.add.text(width * 0.44, height * 0.54, '💧 Río: 40 gotas', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '10px',
      color: '#bae6fd',
      fontStyle: 'bold',
      backgroundColor: 'rgba(2, 132, 199, 0.85)',
      padding: { x: 6, y: 3 }
    }).setOrigin(0.5);

    // Inicializar grupos de partículas fluidas
    this.initWaterParticles();
    this.initAtmosphereParticles(width, height);
    this.setupInteractiveHotspots();

    if (this.gameState) {
      this.renderBasin();
    }

    let resizeTimer: number;
    this.scale.on('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (this.gameState) this.renderBasin();
      }, 150);
    }, this);
  }

  private initWaterParticles(): void {
    const createParticles = (count: number): WaterParticle[] => {
      const arr: WaterParticle[] = [];
      for (let i = 0; i < count; i++) {
        arr.push({
          progress: Math.random(),
          speed: 0.006 + Math.random() * 0.005,
          size: 3 + Math.random() * 2
        });
      }
      return arr;
    };

    this.particlesCity = createParticles(6);
    this.particlesAgri = createParticles(8);
    this.particlesLive = createParticles(5);
    this.particlesMine = createParticles(5);
    this.particlesEco = createParticles(7);

    this.particlesReturnCity = createParticles(4);
    this.particlesRecircMine = createParticles(4);
  }

  private initAtmosphereParticles(width: number, height: number): void {
    // Nubes suaves de diorama
    this.clouds = [];
    for (let i = 0; i < 3; i++) {
      this.clouds.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(30, 85),
        speed: Phaser.Math.FloatBetween(0.2, 0.4),
        scale: Phaser.Math.FloatBetween(0.9, 1.3),
        alpha: 0.92
      });
    }

    // Gotas de lluvia
    this.rainDrops = [];
    for (let i = 0; i < 20; i++) {
      this.rainDrops.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height * 0.75),
        speed: Phaser.Math.Between(12, 18),
        len: Phaser.Math.Between(10, 15)
      });
    }

    // Copos de nieve
    this.snowFlakes = [];
    for (let i = 0; i < 16; i++) {
      this.snowFlakes.push({
        x: Phaser.Math.Between(0, width),
        y: Phaser.Math.Between(0, height * 0.75),
        speed: Phaser.Math.FloatBetween(1.2, 2.4),
        sway: Phaser.Math.FloatBetween(0, Math.PI * 2)
      });
    }

    // Vapores de evaporación en verano
    this.vaporWisps = [];
    for (let i = 0; i < 6; i++) {
      this.vaporWisps.push({
        x: width * 0.30 + Math.random() * 50,
        y: height * 0.32 + Math.random() * 20,
        speed: 0.4 + Math.random() * 0.4,
        alpha: 0.3 + Math.random() * 0.3
      });
    }

    // Infiltración subterránea hacia el acuífero
    this.infiltrationDroplets = [];
    for (let i = 0; i < 8; i++) {
      this.infiltrationDroplets.push({
        x: Phaser.Math.Between(width * 0.15, width * 0.85),
        y: Phaser.Math.Between(height * 0.68, height * 0.84),
        speed: 0.3 + Math.random() * 0.3,
        alpha: 0.5
      });
    }

    // Aves del ecosistema
    this.birds = [];
    for (let i = 0; i < 3; i++) {
      this.birds.push({
        x: width * 0.30 + i * 40,
        y: height * 0.62,
        speed: Phaser.Math.FloatBetween(0.8, 1.2),
        baseY: height * 0.62 + i * 8,
        phase: i * 0.8
      });
    }
  }

  private setupInteractiveHotspots(): void {
    const { width, height } = this.scale;
    const notify = (target: MapClickTarget) => {
      (this.onSelectSector || BasinScene.onSelectSectorCallback)?.(target);
    };

    // 1. Cordillera y Cumbres
    const mountainZone = this.add.zone(width * 0.45, height * 0.13, width * 0.75, 100).setOrigin(0.5).setInteractive({ useHandCursor: true });
    mountainZone.on('pointerdown', () => notify('mountain'));

    // 2. Presa y Embalse
    const damZone = this.add.zone(width * 0.32, height * 0.32, 140, 100).setOrigin(0.5).setInteractive({ useHandCursor: true });
    damZone.on('pointerdown', () => notify('dam'));

    // 3. Río Principal
    const riverZone = this.add.zone(width * 0.45, height * 0.50, 70, 120).setOrigin(0.5).setInteractive({ useHandCursor: true });
    riverZone.on('pointerdown', () => notify('river'));

    // 4. Ciudad
    const cityZone = this.add.zone(width * 0.72, height * 0.44, 160, 120).setOrigin(0.5).setInteractive({ useHandCursor: true });
    cityZone.on('pointerdown', () => notify('population'));

    // 5. Agricultura / Cultivos
    const agriZone = this.add.zone(width * 0.35, height * 0.54, 170, 110).setOrigin(0.5).setInteractive({ useHandCursor: true });
    agriZone.on('pointerdown', () => notify('agriculture'));

    // 6. Minería
    const mineZone = this.add.zone(width * 0.14, height * 0.40, 130, 100).setOrigin(0.5).setInteractive({ useHandCursor: true });
    mineZone.on('pointerdown', () => notify('mining'));

    // 7. Ganadería / Granja
    const liveZone = this.add.zone(width * 0.60, height * 0.62, 130, 90).setOrigin(0.5).setInteractive({ useHandCursor: true });
    liveZone.on('pointerdown', () => notify('livestock'));

    // 8. Ecosistema / Delta (en el tercio medio-inferior, libre del panel UI)
    const ecoZone = this.add.zone(width * 0.42, height * 0.68, 140, 70).setOrigin(0.5).setInteractive({ useHandCursor: true });
    ecoZone.on('pointerdown', () => notify('ecosystem'));
  }

  public renderBasin(): void {
    if (!this.gameState) return;
    this.lastRenderedSeason = this.gameState.season;
    this.lastRenderedClimate = this.gameState.climateState;
    this.lastRenderedYear = this.gameState.year;
    this.lastRenderedSnow = this.gameState.snowReserve;
    this.lastRenderedReservoir = this.gameState.reservoirVolume;
    this.lastRenderedAquifer = this.gameState.aquiferVolume;
    this.lastRenderedQuality = this.gameState.waterQuality;
    this.lastRenderedHealth = this.gameState.basinHealth;

    const { width, height } = this.scale;

    this.renderDioramaSky(width, height);
    this.renderDioramaTerrain(width, height);
    this.renderDioramaMountains(width, height);
    this.renderMainRiverBed(width, height);
    this.renderCanalsAndIntakes(width, height);
    this.renderDioramaReservoir(width, height);
    this.renderDioramaInfrastructure(width, height);
    this.renderDioramaAquifer(width, height);
  }

  // --- CIELO Y AMBIENTE DE DIORAMA ---
  private renderDioramaSky(width: number, height: number): void {
    const gfx = this.skyLayer;
    gfx.clear();

    const season = this.gameState?.season || 'WINTER';
    const isOverrideStorm = this.eventWeatherOverride === 'STORM';
    const isOverrideDrought = this.eventWeatherOverride === 'DROUGHT';

    let topColor = 0x38bdf8;
    let botColor = 0xbae6fd;

    if (isOverrideStorm) {
      topColor = 0x1e293b;
      botColor = 0x475569;
    } else if (isOverrideDrought || (season === 'SUMMER' && this.gameState?.climateState === 'VERY_DRY')) {
      topColor = 0xf59e0b;
      botColor = 0xfef08a;
    } else if (season === 'WINTER') {
      topColor = 0x64748b;
      botColor = 0xcfd8dc;
    } else if (season === 'SPRING') {
      topColor = 0x0284c7;
      botColor = 0x7dd3fc;
    } else if (season === 'AUTUMN') {
      topColor = 0x0369a1;
      botColor = 0xfde68a;
    }

    const steps = 14;
    const hStep = (height * 0.44) / steps;
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(topColor),
        Phaser.Display.Color.ValueToColor(botColor),
        100,
        Math.round(ratio * 100)
      );
      gfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      gfx.fillRect(0, i * hStep, width, hStep + 1);
    }

    // Sol de maqueta
    if (!isOverrideStorm) {
      const sunX = width * 0.88;
      const sunY = height * 0.12;
      gfx.fillStyle(0xfef08a, 0.4);
      gfx.fillCircle(sunX, sunY, 36);
      gfx.fillStyle(0xfbbf24, 0.9);
      gfx.fillCircle(sunX, sunY, 22);
    }
  }

  // --- CORDILLERA Y CUMBRES CON MANTO NIVAL ---
  private renderDioramaMountains(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.terrainGraphics;

    const baseY = height * 0.40;

    // Colores cálidos y facetados con sombras suaves
    const m1X = width * 0.22, m1Y = height * 0.08;
    const m2X = width * 0.46, m2Y = height * 0.04;
    const m3X = width * 0.74, m3Y = height * 0.09;

    // Sombra proyectada
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(m2X, baseY + 4, width * 0.85, 24);

    // Montaña 1 (Izquierda)
    gfx.fillStyle(0x64748b, 1);
    gfx.fillTriangle(width * 0.06, baseY, m1X, m1Y, width * 0.22, baseY);
    gfx.fillStyle(0x475569, 1);
    gfx.fillTriangle(width * 0.22, baseY, m1X, m1Y, width * 0.36, baseY);

    // Montaña 2 (Centro - Mayor altura)
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillTriangle(width * 0.26, baseY, m2X, m2Y, width * 0.46, baseY);
    gfx.fillStyle(0x475569, 1);
    gfx.fillTriangle(width * 0.46, baseY, m2X, m2Y, width * 0.66, baseY);

    // Montaña 3 (Derecha)
    gfx.fillStyle(0x64748b, 1);
    gfx.fillTriangle(width * 0.56, baseY, m3X, m3Y, width * 0.74, baseY);
    gfx.fillStyle(0x334155, 1);
    gfx.fillTriangle(width * 0.74, baseY, m3X, m3Y, width * 0.92, baseY);

    // Nieve dinámica
    const snowRatio = Math.min(1.0, Math.max(0.1, this.gameState.snowReserve / 80));
    const snowDepth = 55 * snowRatio;

    gfx.fillStyle(0xffffff, 0.98);
    gfx.fillTriangle(width * 0.16, m1Y + snowDepth, m1X, m1Y, width * 0.28, m1Y + snowDepth);
    gfx.fillStyle(0xe2e8f0, 0.95);
    gfx.fillTriangle(width * 0.22, m1Y + snowDepth, m1X, m1Y, width * 0.28, m1Y + snowDepth);

    gfx.fillStyle(0xffffff, 1);
    gfx.fillTriangle(width * 0.37, m2Y + snowDepth * 1.25, m2X, m2Y, width * 0.55, m2Y + snowDepth * 1.25);
    gfx.fillStyle(0xe2e8f0, 0.95);
    gfx.fillTriangle(width * 0.46, m2Y + snowDepth * 1.25, m2X, m2Y, width * 0.55, m2Y + snowDepth * 1.25);

    gfx.fillStyle(0xffffff, 0.98);
    gfx.fillTriangle(width * 0.67, m3Y + snowDepth, m3X, m3Y, width * 0.81, m3Y + snowDepth);

    // Hilos de deshielo bajando hacia el embalse (en primavera y verano)
    if (this.gameState.season === 'SPRING' || this.gameState.season === 'SUMMER') {
      gfx.lineStyle(2.5, 0x67e8f9, 0.85);
      gfx.beginPath();
      gfx.moveTo(m2X, m2Y + snowDepth * 1.25);
      gfx.lineTo(width * 0.40, height * 0.24);
      gfx.lineTo(width * 0.34, height * 0.30);
      gfx.stroke();
    }
  }

  // --- TERRENO SUAVE CON BOSQUES Y COLINAS DE MAQUETA ---
  private renderDioramaTerrain(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.terrainGraphics;
    const season = this.gameState.season;

    let hillGreen1 = 0x22c55e;
    let hillGreen2 = 0x16a34a;

    if (season === 'WINTER') {
      hillGreen1 = 0x94a3b8;
      hillGreen2 = 0x64748b;
    } else if (season === 'AUTUMN') {
      hillGreen1 = 0xd97706;
      hillGreen2 = 0x92400e;
    } else if (season === 'SUMMER' && this.gameState.climateState === 'VERY_DRY') {
      hillGreen1 = 0xca8a04;
      hillGreen2 = 0xa16207;
    }

    // Colina trasera suave
    gfx.fillStyle(hillGreen2, 1);
    gfx.beginPath();
    gfx.moveTo(0, height * 0.38);
    gfx.lineTo(width * 0.30, height * 0.34);
    gfx.lineTo(width * 0.60, height * 0.38);
    gfx.lineTo(width, height * 0.36);
    gfx.lineTo(width, height * 0.78);
    gfx.lineTo(0, height * 0.78);
    gfx.closePath();
    gfx.fill();

    // Valle delantero
    gfx.fillStyle(hillGreen1, 1);
    gfx.beginPath();
    gfx.moveTo(0, height * 0.45);
    gfx.lineTo(width * 0.35, height * 0.42);
    gfx.lineTo(width * 0.70, height * 0.46);
    gfx.lineTo(width, height * 0.44);
    gfx.lineTo(width, height * 0.78);
    gfx.lineTo(0, height * 0.78);
    gfx.closePath();
    gfx.fill();

    // Arbolitos amigables estilo diorama (con sombras)
    const treeColor = season === 'AUTUMN' ? 0xd97706 : season === 'WINTER' ? 0x475569 : 0x15803d;
    this.renderDioramaTrees(width, height, treeColor);
  }

  private renderDioramaTrees(width: number, height: number, color: number): void {
    const gfx = this.terrainGraphics;
    const upgReforest = (this.gameState?.upgrades['reforestacion_riberas']?.currentLevel || 0);

    const trees = [
      { x: width * 0.08, y: height * 0.46, s: 1.3 },
      { x: width * 0.12, y: height * 0.49, s: 1.1 },
      { x: width * 0.24, y: height * 0.43, s: 1.2 },
      { x: width * 0.52, y: height * 0.42, s: 1.4 },
      { x: width * 0.86, y: height * 0.44, s: 1.3 },
      { x: width * 0.91, y: height * 0.48, s: 1.1 },
      { x: width * 0.78, y: height * 0.58, s: 1.2 }
    ];

    // Más árboles visibles si se invirtió en reforestación
    if (upgReforest >= 1) {
      trees.push({ x: width * 0.47, y: height * 0.60, s: 1.2 });
      trees.push({ x: width * 0.51, y: height * 0.64, s: 1.1 });
    }
    if (upgReforest >= 2) {
      trees.push({ x: width * 0.38, y: height * 0.66, s: 1.3 });
      trees.push({ x: width * 0.44, y: height * 0.68, s: 1.2 });
    }

    for (const t of trees) {
      // Sombra
      gfx.fillStyle(0x0f172a, 0.2);
      gfx.fillEllipse(t.x, t.y + 7 * t.s, 14 * t.s, 5 * t.s);
      // Tronco
      gfx.fillStyle(0x78350f, 1);
      gfx.fillRect(t.x - 2 * t.s, t.y, 4 * t.s, 7 * t.s);
      // Copa redondeada (diorama)
      gfx.fillStyle(color, 1);
      gfx.fillCircle(t.x, t.y - 4 * t.s, 9 * t.s);
      gfx.fillStyle(0x4ade80, 0.35);
      gfx.fillCircle(t.x - 2 * t.s, t.y - 6 * t.s, 5 * t.s);
    }
  }

  // --- RÍO PRINCIPAL ANCHO COMO PROTAGONISTA ---
  private renderMainRiverBed(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.riverBedGraphics;
    gfx.clear();

    const flowRatio = Math.min(1.8, Math.max(0.4, this.gameState.riverFlow / 40));
    // Ancho considerable: 20 a 34 píxeles (no más una línea fina)
    const mainRiverWidth = Math.round(22 * flowRatio);

    let riverColor = 0x0284c7;
    let riverHighlight = 0x38bdf8;
    if (this.gameState.waterQuality < 45) {
      riverColor = 0x78716c; // Agua turbia
      riverHighlight = 0xa8a29e;
    } else if (this.gameState.waterQuality < 70) {
      riverColor = 0x0d9488;
      riverHighlight = 0x2dd4bf;
    }

    // Lecho del río con sombra suave
    gfx.lineStyle(mainRiverWidth + 8, 0x0f172a, 0.25);
    this.drawRiverPath(gfx, width, height, 3);

    // Río principal
    gfx.lineStyle(mainRiverWidth, riverColor, 0.95);
    this.drawRiverPath(gfx, width, height);

    // Línea central de brillo y oleaje
    gfx.lineStyle(Math.max(4, mainRiverWidth * 0.35), riverHighlight, 0.85);
    this.drawRiverPath(gfx, width, height);

    // Actualizar etiqueta del río
    if (this.riverFlowLabelText) {
      this.riverFlowLabelText.setPosition(width * 0.46, height * 0.51);
      this.riverFlowLabelText.setText(`💧 Río Vivo: ${this.gameState.riverFlow} 💧`);
    }
  }

  private drawRiverPath(gfx: Phaser.GameObjects.Graphics, width: number, height: number, offsetY: number = 0): void {
    gfx.beginPath();
    // Desde el desagüe del embalse
    gfx.moveTo(width * 0.36, height * 0.34 + offsetY);
    // Curva por el valle central
    gfx.lineTo(width * 0.44, height * 0.44 + offsetY);
    gfx.lineTo(width * 0.48, height * 0.54 + offsetY);
    gfx.lineTo(width * 0.46, height * 0.65 + offsetY);
    // Delta y desembocadura en el humedal
    gfx.lineTo(width * 0.42, height * 0.77 + offsetY);
    gfx.stroke();
  }

  // --- CANALES DE REPARTO HACIA LOS 5 SECTORES ---
  private renderCanalsAndIntakes(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.canalsGraphics;
    gfx.clear();
    const sec = this.gameState.sectors;

    const getCanalWidth = (allocated: number, maxDemand: number) => {
      if (allocated <= 0) return 2;
      const ratio = Math.min(1.5, Math.max(0.3, allocated / Math.max(1, maxDemand)));
      return Math.round(5 + 10 * ratio); // 6px a 18px de ancho
    };

    // 1. Canal hacia la Ciudad (Acueducto Urbano)
    const wCity = getCanalWidth(sec.population.allocated, sec.population.currentDemand);
    gfx.lineStyle(wCity + 3, 0x0f172a, 0.2);
    gfx.lineBetween(width * 0.45, height * 0.45 + 2, width * 0.66, height * 0.44 + 2);
    gfx.lineStyle(wCity, sec.population.allocated > 0 ? 0x38bdf8 : 0x64748b, 0.9);
    gfx.lineBetween(width * 0.45, height * 0.45, width * 0.66, height * 0.44);

    // 2. Canal hacia Agricultura (Canal de Riego Principal)
    const wAgri = getCanalWidth(sec.agriculture.allocated, sec.agriculture.currentDemand);
    gfx.lineStyle(wAgri + 3, 0x0f172a, 0.2);
    gfx.lineBetween(width * 0.44, height * 0.47 + 2, width * 0.36, height * 0.52 + 2);
    gfx.lineStyle(wAgri, sec.agriculture.allocated > 0 ? 0x0284c7 : 0x78716c, 0.9);
    gfx.lineBetween(width * 0.44, height * 0.47, width * 0.36, height * 0.52);

    // 3. Canal hacia Ganadería (Acequia de Potrero)
    const wLive = getCanalWidth(sec.livestock.allocated, sec.livestock.currentDemand);
    gfx.lineStyle(wLive + 2, 0x0f172a, 0.2);
    gfx.lineBetween(width * 0.48, height * 0.56 + 2, width * 0.57, height * 0.61 + 2);
    gfx.lineStyle(wLive, sec.livestock.allocated > 0 ? 0x38bdf8 : 0x78716c, 0.88);
    gfx.lineBetween(width * 0.48, height * 0.56, width * 0.57, height * 0.61);

    // 4. Canal hacia Minería (Tubería Industrial)
    const wMine = getCanalWidth(sec.mining.allocated, sec.mining.currentDemand);
    gfx.lineStyle(wMine + 2, 0x0f172a, 0.2);
    gfx.lineBetween(width * 0.32, height * 0.35 + 2, width * 0.18, height * 0.39 + 2);
    gfx.lineStyle(wMine, sec.mining.allocated > 0 ? 0x0284c7 : 0x64748b, 0.85);
    gfx.lineBetween(width * 0.32, height * 0.35, width * 0.18, height * 0.39);

    // 5. Retorno Ciudad -> Río (Tratamiento o desagüe)
    const returnQuality = sec.population.returnQuality;
    const retColor = returnQuality > 70 ? 0x22d3ee : returnQuality > 45 ? 0x059669 : 0x92400e;
    gfx.lineStyle(3.5, retColor, 0.8);
    gfx.lineBetween(width * 0.66, height * 0.48, width * 0.47, height * 0.53);

    // 6. Recirculación Minera (si posee mejora)
    const minRecircLvl = this.gameState.upgrades['recirculacion_minera']?.currentLevel || 0;
    if (minRecircLvl > 0) {
      gfx.lineStyle(3, 0x06b6d4, 0.9);
      gfx.strokeCircle(width * 0.17, height * 0.37, 16);
    }
  }

  // --- EMBALSE Y PRESA ESTILO DIORAMA ---
  private renderDioramaReservoir(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.reservoirGraphics;
    gfx.clear();

    const resPercent = this.gameState.reservoirVolume / this.gameState.reservoirCapacity;
    const resX = width * 0.32;
    const resY = height * 0.33;

    let waterColor = 0x0284c7;
    if (resPercent < 0.25) waterColor = 0xb45309;
    else if (resPercent > 0.65) waterColor = 0x38bdf8;

    // Cubeta del embalse (sombra)
    gfx.fillStyle(0x0f172a, 0.35);
    gfx.fillEllipse(resX, resY + 4, 110, 68);

    // Agua almacenada (crece en superficie con el porcentaje)
    const rScale = Math.max(0.3, Math.min(1.0, resPercent));
    gfx.fillStyle(waterColor, 0.92);
    gfx.fillEllipse(resX, resY, 100 * rScale, 60 * rScale);

    // Brillos de oleaje
    gfx.fillStyle(0xffffff, 0.5);
    gfx.fillEllipse(resX - 10, resY - 6, 40 * rScale, 14 * rScale);

    // Muro de la presa (aumenta según nivel de obra de ampliación)
    const damLvl = this.gameState.upgrades['ampliacion_embalse']?.currentLevel || 0;
    const damWidth = 22 + damLvl * 6;
    const damHeight = 40 + damLvl * 4;

    // Sombra del muro
    gfx.fillStyle(0x0f172a, 0.3);
    gfx.fillRect(resX + 34, resY - 14, damWidth + 4, damHeight);

    // Muro de concreto facetado
    gfx.fillStyle(0x94a3b8, 1);
    gfx.fillRect(resX + 34, resY - 16, damWidth, damHeight);
    gfx.fillStyle(0x64748b, 1);
    gfx.fillRect(resX + 34 + damWidth - 4, resY - 16, 4, damHeight);

    // Aliviadero de espuma animada
    const foamAlpha = 0.5 + Math.sin(this.animTimer * 6) * 0.3;
    gfx.fillStyle(0xffffff, foamAlpha);
    gfx.fillRect(resX + 34 + damWidth, resY + 6, 8, 12);

    if (this.damLabelText) {
      this.damLabelText.setPosition(resX, resY - 42);
      this.damLabelText.setText(`🌊 Embalse: ${Math.round(resPercent * 100)}% (${this.gameState.reservoirVolume}💧)`);
    }
  }

  // --- INFRAESTRUCTURA DE LOS 5 SECTORES (MÁS GRANDES Y AMIGABLES) ---
  private renderDioramaInfrastructure(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.infrastructureGraphics;
    gfx.clear();
    const upg = this.gameState.upgrades;

    // 1. CIUDAD (Edificios amigables y escuela)
    const cityX = width * 0.72;
    const cityY = height * 0.44;

    // Sombra de la ciudad
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(cityX, cityY + 28, 150, 44);

    // Edificio 1
    this.drawIsometricBuilding(gfx, cityX - 44, cityY - 24, 30, 48, 0x3b82f6, 0x1d4ed8, 0x93c5fd);
    // Edificio 2 (Torre principal)
    this.drawIsometricBuilding(gfx, cityX - 10, cityY - 44, 32, 64, 0x60a5fa, 0x2563eb, 0xdbeafe);
    // Casa residencial con techo a dos aguas
    this.drawHouseWithGableRoof(gfx, cityX + 28, cityY - 10, 28, 28, 0xf8fafc, 0xe11d48);

    // Tanque de agua urbano
    gfx.fillStyle(0x38bdf8, 1);
    this.drawRegularPolygon(gfx, cityX + 64, cityY - 20, 14, 6);
    gfx.lineStyle(2.5, 0x475569, 1);
    gfx.lineBetween(cityX + 64, cityY - 6, cityX + 64, cityY + 22);

    // Humo suave de chimenea
    const smokeY = cityY - 28 - ((this.animTimer * 12) % 18);
    gfx.fillStyle(0xffffff, 0.45);
    gfx.fillCircle(cityX + 36, smokeY, 4);

    // Planta de Saneamiento Urbana (crece visualmente si está mejorada)
    const sanLvl = upg['planta_saneamiento']?.currentLevel || 0;
    if (sanLvl > 0) {
      const trX = cityX - 30;
      const trY = cityY + 32;
      gfx.fillStyle(0x10b981, 1);
      this.drawRegularPolygon(gfx, trX, trY, 14, 8);
      gfx.fillStyle(0x34d399, 1);
      this.drawRegularPolygon(gfx, trX + 22, trY, 11, 8);
      gfx.lineStyle(2, 0x67e8f9, 0.9);
      gfx.lineBetween(trX, trY, trX + 22, trY);
    }

    // 2. AGRICULTURA (Bancales de cultivo y aspersores)
    const agriX = width * 0.35;
    const agriY = height * 0.54;
    const agriSat = this.gameState.sectors.agriculture.satisfactionRate;

    // Color del cultivo según satisfacción
    let cropColor = agriSat > 0.8 ? 0x22c55e : agriSat > 0.5 ? 0xeab308 : 0x854d0e;

    // Sombra del campo
    gfx.fillStyle(0x0f172a, 0.2);
    gfx.fillEllipse(agriX, agriY + 18, 160, 50);

    // Parcelas agrícolas
    gfx.fillStyle(cropColor, 0.95);
    gfx.fillRoundedRect(agriX - 70, agriY - 24, 64, 46, 6);
    gfx.fillStyle(cropColor, 0.85);
    gfx.fillRoundedRect(agriX + 6, agriY - 20, 60, 42, 6);

    // Surcos de cultivo
    gfx.lineStyle(2, 0x78350f, 0.4);
    gfx.lineBetween(agriX - 66, agriY - 12, agriX - 10, agriY - 12);
    gfx.lineBetween(agriX - 66, agriY + 2, agriX - 10, agriY + 2);
    gfx.lineBetween(agriX + 10, agriY - 8, agriX + 60, agriY - 8);
    gfx.lineBetween(agriX + 10, agriY + 6, agriX + 60, agriY + 6);

    // Aspersores de riego tecnificado girando (si posee mejora)
    if ((upg['riego_eficiente']?.currentLevel || 0) > 0) {
      gfx.fillStyle(0x0284c7, 1);
      gfx.fillRect(agriX - 38, agriY - 8, 5, 10);
      gfx.fillRect(agriX + 36, agriY - 6, 5, 10);

      const sprayAngle = this.animTimer * 9;
      gfx.lineStyle(2, 0x67e8f9, 0.85);
      gfx.lineBetween(agriX - 35, agriY - 6, agriX - 35 + Math.cos(sprayAngle) * 11, agriY - 6 + Math.sin(sprayAngle) * 6);
      gfx.lineBetween(agriX + 38, agriY - 4, agriX + 38 + Math.cos(-sprayAngle) * 11, agriY - 4 + Math.sin(-sprayAngle) * 6);
    }

    // 3. MINERÍA (Cantera facetada y camión)
    const mineX = width * 0.14;
    const mineY = height * 0.40;

    // Sombra
    gfx.fillStyle(0x0f172a, 0.25);
    gfx.fillEllipse(mineX, mineY + 24, 110, 36);

    // Cantera
    gfx.fillStyle(0x64748b, 1);
    gfx.fillTriangle(mineX - 44, mineY + 24, mineX, mineY - 32, mineX + 44, mineY + 24);
    gfx.fillStyle(0x475569, 1);
    gfx.fillRect(mineX - 16, mineY, 32, 24);

    // Camión minero estilizado
    gfx.fillStyle(0xfacc15, 1);
    gfx.fillRect(mineX - 26, mineY + 12, 16, 10);
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(mineX - 22, mineY + 24, 3);
    gfx.fillCircle(mineX - 14, mineY + 24, 3);

    // Planta de flotación / tanques
    gfx.fillStyle(0x0284c7, 0.9);
    this.drawRegularPolygon(gfx, mineX + 28, mineY + 14, 15, 6);

    // 4. GANADERÍA (Corral, vaquitas y ovejas)
    const liveX = width * 0.60;
    const liveY = height * 0.62;

    // Sombra del corral
    gfx.fillStyle(0x0f172a, 0.2);
    gfx.fillEllipse(liveX, liveY + 14, 110, 40);

    // Cerca de madera
    gfx.lineStyle(2, 0x854d0e, 0.9);
    gfx.strokeRect(liveX - 42, liveY - 18, 84, 38);

    this.drawCuteCow(gfx, liveX - 18, liveY - 4);
    this.drawCuteSheep(gfx, liveX + 16, liveY + 2);

    // 5. ECOSISTEMA Y HUMEDAL DEL DELTA
    const ecoX = width * 0.42;
    const ecoY = height * 0.74;
    const ecoSat = this.gameState.sectors.ecosystem.satisfactionRate;

    let deltaColor = ecoSat > 0.8 ? 0x059669 : ecoSat > 0.5 ? 0x65a30d : 0x78716c;
    gfx.fillStyle(deltaColor, 0.94);
    this.drawRegularPolygon(gfx, ecoX, ecoY, 40, 7);
    this.drawRegularPolygon(gfx, ecoX - 28, ecoY + 4, 26, 6);
    this.drawRegularPolygon(gfx, ecoX + 28, ecoY + 4, 28, 6);

    // Juncos si está sano
    if (ecoSat > 0.6) {
      gfx.lineStyle(2.5, 0x15803d, 1);
      gfx.lineBetween(ecoX - 12, ecoY + 6, ecoX - 12, ecoY - 10);
      gfx.lineBetween(ecoX + 16, ecoY + 4, ecoX + 16, ecoY - 12);
    }

    // 6. ESTACIÓN METEOROLÓGICA (en la colina si está comprada)
    if ((upg['estacion_meteorologica']?.currentLevel || 0) > 0) {
      const meteoX = width * 0.75;
      const meteoY = height * 0.28;
      // Torre blanca y roja
      gfx.fillStyle(0xef4444, 1);
      gfx.fillRect(meteoX - 3, meteoY - 18, 6, 22);
      gfx.fillStyle(0xffffff, 1);
      gfx.fillRect(meteoX - 3, meteoY - 12, 6, 6);
      // Radar giratorio
      const radarAngle = this.animTimer * 4;
      gfx.lineStyle(2, 0x38bdf8, 1);
      gfx.lineBetween(meteoX, meteoY - 18, meteoX + Math.cos(radarAngle) * 8, meteoY - 18 + Math.sin(radarAngle) * 4);
    }
  }

  // --- CORTE GEOLÓGICO DEL ACUÍFERO (RIGOR CIENTÍFICO) ---
  private renderDioramaAquifer(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.aquiferGraphics;
    gfx.clear();

    const aquiY = height * 0.78;
    const aquiH = height * 0.22;

    // Estrato geológico de roca porosa y arenas
    gfx.fillStyle(0x3e2723, 1); // Tierra superficial
    gfx.fillRect(0, aquiY, width, 8);

    gfx.fillStyle(0x5d4037, 1); // Sedimentos
    gfx.fillRect(0, aquiY + 8, width, aquiH - 8);

    // Textura de poros y granos de roca
    gfx.fillStyle(0x8d6e63, 0.4);
    for (let x = 15; x < width; x += 35) {
      gfx.fillCircle(x, aquiY + 22, 3);
      gfx.fillCircle(x + 18, aquiY + 36, 4);
      gfx.fillCircle(x + 8, aquiY + 54, 3);
    }

    // Nivel del agua subterránea (nivel freático)
    const aquiPercent = this.gameState.aquiferVolume / this.gameState.aquiferCapacity;
    const waterHeight = (aquiH - 24) * aquiPercent;

    let aquiColor = 0x0284c7;
    if (this.gameState.aquiferStressLevel === 'CRITICAL') aquiColor = 0xef4444;
    else if (this.gameState.aquiferStressLevel === 'STRESSED') aquiColor = 0xf97316;
    else if (this.gameState.aquiferStressLevel === 'ATTENTION') aquiColor = 0x06b6d4;

    // Masa de agua entre los poros
    gfx.fillStyle(aquiColor, 0.88);
    gfx.fillRect(0, aquiY + aquiH - waterHeight, width, waterHeight);

    // Línea brillante del nivel freático
    gfx.lineStyle(3.5, 0x67e8f9, 1);
    gfx.lineBetween(0, aquiY + aquiH - waterHeight, width, aquiY + aquiH - waterHeight);

    // Pozos de bombeo
    gfx.fillStyle(0xe2e8f0, 1);
    gfx.fillRect(width * 0.28, aquiY - 14, 8, 32);
    gfx.fillRect(width * 0.68, aquiY - 14, 8, 32);

    // Pozo de recarga artificial (si posee mejora)
    if ((this.gameState.upgrades['recarga_acuifero']?.currentLevel || 0) > 0) {
      gfx.fillStyle(0x10b981, 1);
      gfx.fillRect(width * 0.48, aquiY - 20, 10, 42);
    }
  }

  // --- LOOP PRINCIPAL DE ACTUALIZACIÓN (60 FPS LIGERO) ---
  update(time: number, delta: number): void {
    // Limitar delta a máximo 33ms para evitar tirones tras pausas o cambios de pestaña
    const safeDelta = Math.min(delta, 33.3);
    this.animTimer += safeDelta * 0.001;
    const { width, height } = this.scale;

    // Actualizar y dibujar partículas dinámicas
    this.updateWaterFlow(width, height);
    this.updateAtmosphere(width, height);
  }

  // --- ANIMACIÓN CONTINUA DE GOTAS Y FLUJOS DE AGUA ---
  private updateWaterFlow(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.waterFlowGraphics;
    gfx.clear();

    const sec = this.gameState.sectors;

    // Función auxiliar para dibujar gotas desplazándose sobre una recta
    const drawParticlesOnSegment = (
      particles: WaterParticle[],
      x1: number, y1: number, x2: number, y2: number,
      color: number,
      allocated: number, maxDemand: number
    ) => {
      if (allocated <= 0) return;
      const speedMult = Math.min(1.6, Math.max(0.4, allocated / Math.max(1, maxDemand)));
      gfx.fillStyle(color, 0.92);

      for (const p of particles) {
        p.progress = (p.progress + p.speed * speedMult) % 1.0;
        const px = x1 + (x2 - x1) * p.progress;
        const py = y1 + (y2 - y1) * p.progress;
        gfx.fillCircle(px, py, p.size);
      }
    };

    // Gotas hacia Ciudad
    drawParticlesOnSegment(
      this.particlesCity,
      width * 0.45, height * 0.45,
      width * 0.66, height * 0.44,
      0x38bdf8,
      sec.population.allocated, sec.population.currentDemand
    );

    // Gotas hacia Agricultura
    drawParticlesOnSegment(
      this.particlesAgri,
      width * 0.44, height * 0.47,
      width * 0.36, height * 0.52,
      0x60a5fa,
      sec.agriculture.allocated, sec.agriculture.currentDemand
    );

    // Gotas hacia Ganadería
    drawParticlesOnSegment(
      this.particlesLive,
      width * 0.48, height * 0.56,
      width * 0.57, height * 0.61,
      0x38bdf8,
      sec.livestock.allocated, sec.livestock.currentDemand
    );

    // Gotas hacia Minería
    drawParticlesOnSegment(
      this.particlesMine,
      width * 0.32, height * 0.35,
      width * 0.18, height * 0.39,
      0x0284c7,
      sec.mining.allocated, sec.mining.currentDemand
    );

    // Gotas por el río hacia Ecosistema
    drawParticlesOnSegment(
      this.particlesEco,
      width * 0.48, height * 0.56,
      width * 0.42, height * 0.74,
      0x22d3ee,
      sec.ecosystem.allocated, sec.ecosystem.currentDemand
    );

    // Gotas de retorno Ciudad -> Saneamiento -> Río
    drawParticlesOnSegment(
      this.particlesReturnCity,
      width * 0.66, height * 0.48,
      width * 0.47, height * 0.53,
      0x10b981,
      sec.population.allocated * 0.6, sec.population.currentDemand
    );

    // Infiltración de agua en el suelo hacia el acuífero
    const aquiY = height * 0.78;
    const aquiH = height * 0.22;
    gfx.fillStyle(0x67e8f9, 0.75);
    for (const d of this.infiltrationDroplets) {
      d.y += d.speed;
      if (d.y > aquiY + aquiH - 6) {
        d.y = aquiY + 6;
      }
      gfx.fillCircle(d.x, d.y, 2.5);
    }
  }

  // --- ANIMACIÓN DE NUBES, LLUVIA, NIEVE Y AVES ---
  private updateAtmosphere(width: number, height: number): void {
    if (!this.gameState) return;
    const gfx = this.weatherFXGraphics;
    gfx.clear();

    const isWinter = this.gameState.season === 'WINTER';
    const isOverrideStorm = this.eventWeatherOverride === 'STORM';
    const isOverrideDrought = this.eventWeatherOverride === 'DROUGHT';

    const isRaining =
      !isWinter &&
      (isOverrideStorm ||
        this.gameState.season === 'AUTUMN' ||
        this.gameState.climateState === 'WET' ||
        this.gameState.climateState === 'VERY_WET');

    // 1. Nubes
    for (const c of this.clouds) {
      c.x += c.speed;
      if (c.x - 70 > width) c.x = -80;

      gfx.fillStyle(isRaining ? 0x64748b : 0xffffff, c.alpha);
      const cx = c.x, cy = c.y, s = c.scale;
      gfx.fillCircle(cx, cy, 22 * s);
      gfx.fillCircle(cx + 18 * s, cy - 6 * s, 18 * s);
      gfx.fillCircle(cx + 34 * s, cy + 2 * s, 20 * s);
      gfx.fillCircle(cx - 16 * s, cy + 3 * s, 16 * s);
    }

    // 2. Lluvia
    if (isRaining) {
      gfx.lineStyle(1.8, 0x38bdf8, 0.75);
      gfx.beginPath();
      for (const r of this.rainDrops) {
        r.y += r.speed;
        if (r.y > height * 0.76) {
          r.y = Phaser.Math.Between(20, 80);
          r.x = Phaser.Math.Between(0, width);
        }
        gfx.moveTo(r.x, r.y);
        gfx.lineTo(r.x - 3, r.y + r.len);
      }
      gfx.stroke();
    }

    // 3. Nieve
    if (isWinter) {
      gfx.fillStyle(0xffffff, 0.9);
      for (const s of this.snowFlakes) {
        s.y += s.speed;
        s.sway += 0.03;
        const sx = s.x + Math.sin(s.sway) * 2;
        if (s.y > height * 0.76) {
          s.y = Phaser.Math.Between(10, 60);
          s.x = Phaser.Math.Between(0, width);
        }
        gfx.fillCircle(sx, s.y, 2.5);
      }
    }

    // 4. Evaporación estival (Verano o Sequía)
    if (isOverrideDrought || (this.gameState.season === 'SUMMER' && !isRaining)) {
      gfx.fillStyle(0xffffff, 0.35);
      for (const v of this.vaporWisps) {
        v.y -= v.speed;
        if (v.y < height * 0.22) {
          v.y = height * 0.33 + Math.random() * 15;
        }
        gfx.fillCircle(v.x, v.y, 4);
      }
    }

    // 5. Aves volando sobre el delta si el río está sano
    if (this.gameState.sectors.ecosystem.satisfactionRate > 0.6) {
      gfx.lineStyle(2, 0x1e293b, 0.85);
      gfx.beginPath();
      for (const b of this.birds) {
        b.x += b.speed;
        if (b.x > width * 0.70) b.x = width * 0.25;
        const wing = Math.sin(this.animTimer * 10 + b.phase) * 4;
        const by = b.baseY + Math.sin(this.animTimer * 2 + b.phase) * 6;

        gfx.moveTo(b.x - 6, by - wing);
        gfx.lineTo(b.x, by);
        gfx.lineTo(b.x + 6, by - wing);
      }
      gfx.stroke();
    }
  }

  // --- DIBUJOS AUXILIARES ---
  private drawRegularPolygon(gfx: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, sides: number): void {
    const points: Phaser.Math.Vector2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push(new Phaser.Math.Vector2(x + radius * Math.cos(angle), y + radius * Math.sin(angle)));
    }
    gfx.fillPoints(points, true);
  }

  private drawIsometricBuilding(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    cFront: number, cSide: number, cRoof: number
  ): void {
    // Techo
    gfx.fillStyle(cRoof, 1);
    gfx.fillRect(x, y, w, 12);
    // Cara frontal
    gfx.fillStyle(cFront, 1);
    gfx.fillRect(x, y + 12, w * 0.65, h - 12);
    // Cara lateral
    gfx.fillStyle(cSide, 1);
    gfx.fillRect(x + w * 0.65, y + 12, w * 0.35, h - 12);
  }

  private drawHouseWithGableRoof(
    gfx: Phaser.GameObjects.Graphics,
    x: number, y: number,
    w: number, h: number,
    cWall: number, cRoof: number
  ): void {
    gfx.fillStyle(cRoof, 1);
    gfx.fillTriangle(x, y + 10, x + w / 2, y - 6, x + w, y + 10);
    gfx.fillStyle(cWall, 1);
    gfx.fillRect(x + 2, y + 10, w - 4, h - 10);
    // Puerta
    gfx.fillStyle(0x78350f, 1);
    gfx.fillRect(x + w / 2 - 3, y + h - 10, 6, 10);
  }

  private drawCuteCow(gfx: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Cuerpo blanco
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRoundedRect(x, y, 18, 12, 3);
    // Mancha negra
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillCircle(x + 7, y + 5, 4);
    // Cabeza
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRoundedRect(x - 6, y - 2, 8, 8, 2);
    // Hocico rosita
    gfx.fillStyle(0xf472b6, 1);
    gfx.fillRect(x - 6, y + 3, 4, 3);
    // Patitas
    gfx.fillStyle(0x1e293b, 1);
    gfx.fillRect(x + 2, y + 12, 2.5, 4);
    gfx.fillRect(x + 13, y + 12, 2.5, 4);
  }

  private drawCuteSheep(gfx: Phaser.GameObjects.Graphics, x: number, y: number): void {
    // Lana esponjosa
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(x, y, 6);
    gfx.fillCircle(x + 6, y, 5);
    gfx.fillCircle(x + 3, y - 4, 5);
    // Cara oscura
    gfx.fillStyle(0x334155, 1);
    gfx.fillCircle(x - 3, y + 1, 3.5);
    // Patitas
    gfx.fillRect(x, y + 6, 2, 3);
    gfx.fillRect(x + 5, y + 6, 2, 3);
  }
}
