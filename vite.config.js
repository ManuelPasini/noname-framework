import { defineConfig } from 'vite'
import { resolve } from 'path'
import { execFile } from 'child_process'
import { discoverPages } from './scripts/discover-pages.js'

function twigWatcher() {
    let renderTimer

    return {
        name: 'pixelcut-twig-watcher',

        configureServer(server) {
            server.watcher.add([
                resolve(__dirname, 'docs/templates'),
                resolve(__dirname, 'docs/components'),
                resolve(__dirname, 'src/components')
            ])

            const onTemplateEvent = (event, file) => {
                if (!['add', 'change', 'unlink'].includes(event) || !file.endsWith('.twig')) {
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
            }

            server.watcher.on('all', onTemplateEvent)
            server.httpServer?.once('close', () => {
                clearTimeout(renderTimer)
                server.watcher.off('all', onTemplateEvent)
            })
        }
    }
}

export default defineConfig({
    root: resolve(__dirname, 'docs'),
    server: { fs: { allow: [__dirname] } },
    plugins: [twigWatcher()],
    build: {
        outDir: resolve(__dirname, 'dist/docs'),
        emptyOutDir: true,
        rollupOptions: {
            input: discoverPages().map(({ output }) => resolve(__dirname, 'docs', output))
        }
    }
})
