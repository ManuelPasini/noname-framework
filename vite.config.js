import { defineConfig } from 'vite'
import { resolve } from 'path'
const pages = {
    main: resolve(__dirname, 'index.html')
}

export default defineConfig({
    build: {
        rollupOptions: {
            input: pages
        }
    }
})
