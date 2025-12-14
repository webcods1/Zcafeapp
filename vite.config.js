import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        purchase: resolve(__dirname, 'purchase.html'),
        profile: resolve(__dirname, 'profile.html'),
        bag: resolve(__dirname, 'bag.html'),
        service: resolve(__dirname, 'service.html'),
        wishlist: resolve(__dirname, 'wishlist.html')
      }
    }
  }
})
