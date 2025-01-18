import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ include: ['src/index.ts'] }),
  ],
  build: {
    lib: {
      name: 'form',
      entry: resolve(__dirname, 'src', 'index.ts'),
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        globals: {
          vue: 'vue',
        },
      },
      external: ['vue'],
    },
  },
})
