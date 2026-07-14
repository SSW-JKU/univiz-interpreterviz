import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0'
  },
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-styled-components', {}],
        babelrc: false,
        configFile: false
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          radix: ['@radix-ui/themes'],
          ui: ['styled-components', 'react-dropzone', 'sonner', 'react-archer'],
          popper: ['react-popper', '@popperjs/core', '@floating-ui/react'],

          toml: ['toml'],
          icon: ['react-feather', '@remixicon/react'],
          router: ['react-router-dom']
        }
      }
    }
  },
  base: process.env.BASE
});
