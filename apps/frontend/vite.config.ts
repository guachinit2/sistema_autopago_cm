import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@ericblade/quagga2'],
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      usePolling: true, // Necesario para Docker en Windows (detecta cambios en volúmenes)
    },
  },
});
