import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: false,
    // Una edición durante un playtest no debe reiniciar veinte turnos en memoria.
    // Cargar los cambios con una recarga explícita; la partida tendrá copia local.
    hmr: false,
    watch: { ignored: ['**/artifacts/**', '**/dist/**'] }
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0
  }
});
