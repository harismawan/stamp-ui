import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@harismawan/stamp-ui': resolve(__dirname, '../src/index.ts') },
    dedupe: ['styled-components', 'react', 'react-dom'],
  },
});
