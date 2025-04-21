import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'configure-server',
      configureServer: async (server) => {
        const express = (await import('express')).default
        const { createAwsServer } = await import('./src/aws-server/index.js')
        
        const app = express()
        createAwsServer(app)
        
        server.middlewares.use('/api/aws', app)
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'mrbarmister.pro',
      'localhost'
    ]
  }
})
