/**
 * Sistema de Sonido Procedural con Web Audio API puro.
 * No requiere descargar archivos mp3/wav externos: sintetiza audio fluido en tiempo real.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastGurgleTime: number = 0;

  constructor() {
    const saved = localStorage.getItem('cuenca_viva_sound_muted');
    this.isMuted = saved === 'true';
  }

  private initContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cuenca_viva_sound_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.pop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Sonido acuático "glup-glup" modulado por la cantidad de agua
   * @param pitchMultiplier Factor de frecuencia (ej: 0.5 a 1.8)
   */
  public waterGurgle(pitchMultiplier: number = 1.0): void {
    if (this.isMuted) return;
    const now = Date.now();
    // Throttle para que no sature cuando se arrastran sliders velozmente
    if (now - this.lastGurgleTime < 70) return;
    this.lastGurgleTime = now;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 280 * Math.max(0.6, Math.min(2.0, pitchMultiplier));
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      // Frecuencia modulada como burbuja que sube
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.08);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Ignorar restricciones de autoplay si aún no hubo gesto de usuario
    }
  }

  /**
   * Clic juguetón y sutil para botones
   */
  public pop(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch {}
  }

  /**
   * Monedas / Cha-ching al cobrar presupuesto o cumplir desafío
   */
  public coin(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Dos notas rápidas tipo Mario/arcade (B5 -> E6)
      const playTone = (freq: number, startOffset: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + startOffset);
        gain.gain.setValueAtTime(0.08, t + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + startOffset);
        osc.stop(t + startOffset + dur + 0.01);
      };

      playTone(987.77, 0, 0.08); // B5
      playTone(1318.51, 0.07, 0.25); // E6
    } catch {}
  }

  /**
   * Aviso cómico de "tubería hueca / toc-toc" cuando falta agua o se vacía la reserva
   */
  public warningDry(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  /**
   * Fanfarria alegre al ganar o superar un gran año
   */
  public fanfare(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const t = ctx.currentTime + idx * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + (idx === 3 ? 0.45 : 0.18));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + (idx === 3 ? 0.46 : 0.19));
      });
    } catch {}
  }

  /**
   * Sonido de papel de periódico abriéndose
   */
  public paperRustle(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(1.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
    } catch {}
  }
}

export const sound = new SoundManager();
