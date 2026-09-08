import { defineConfig } from 'vite'
import { resolve } from 'path'
import { execFile } from 'child_process'

function twigWatcher() {
    let renderTimer

    return {
        name: 'pixelcut-twig-watcher',

        configureServer(server) {
            server.watcher.add([
                resolve(__dirname, 'src/templates'),
                resolve(__dirname, 'src/components')
            ])

            server.watcher.on('change', (file) => {
                if (!file.endsWith('.twig')) {
                    return
                }

                clearTimeout(renderTimer)

                renderTimer = setTimeout(() => {
                    execFile(
                        process.execPath,
                        [resolve(__dirname, 'scripts/render-pages.js')],
                        (error, _stdout, stderr) => {
                            if (error) {
                                console.error(`[twig] ${stderr || error.message}`)
                                return
                            }

                            server.ws.send({
                                type: 'full-reload',
                                path: '*'
                            })
                        }
                    )
                }, 100)
            })
        }
    }
}

const pages = {
    main: resolve(__dirname, 'index.html')
}

export default defineConfig({
    plugins: [twigWatcher()],
    build: {
        rollupOptions: {
            input: pages
        }
    }
})
