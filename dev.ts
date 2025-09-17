#!/usr/bin/env -S deno run --allow-all

/**
 * Script de développement qui lance le frontend et backend en parallèle
 */

const processes: Deno.ChildProcess[] = []

// Fonction pour nettoyer les processus lors de l'arrêt
const cleanup = () => {
  console.log('\n🛑 Arrêt des processus...')
  for (const proc of processes) {
    try {
      proc.kill('SIGTERM')
    } catch (_) {
      // Process déjà terminé
    }
  }
  Deno.exit(0)
}

// Gestionnaires de signaux
Deno.addSignalListener('SIGINT', cleanup)
Deno.addSignalListener('SIGTERM', cleanup)

console.log('🚀 Démarrage du mode développement...\n')

// Lancer le backend
console.log('📡 Démarrage du serveur API (port 3001)...')
const backendProcess = new Deno.Command('deno', {
  args: [
    'serve',
    '--port',
    '3001',
    '--allow-env',
    '--allow-net',
    'api/server.ts',
  ],
  stdout: 'piped',
  stderr: 'piped',
}).spawn()

processes.push(backendProcess)

// Attendre un peu pour que le backend démarre
await new Promise((resolve) => setTimeout(resolve, 1000))

// Lancer le frontend
console.log('🎨 Démarrage du serveur frontend (port 5173)...')
const frontendProcess = new Deno.Command('deno', {
  args: [
    'run',
    '--allow-env',
    '--allow-sys',
    '--allow-read',
    '--allow-write',
    '--allow-net',
    '--allow-run',
    'npm:vite',
  ],
  stdout: 'piped',
  stderr: 'piped',
}).spawn()

processes.push(frontendProcess)

console.log('\n✅ Serveurs démarrés:')
console.log('   Frontend: http://localhost:5173')
console.log('   Backend:  http://localhost:3001')
console.log('\n📝 Logs:')

// Afficher les logs des deux processus
const decoder = new TextDecoder() // Logs backend
;(async () => {
  const reader = backendProcess.stdout.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    if (text.trim()) {
      console.log(`[API] ${text.trim()}`)
    }
  }
})()
;(async () => {
  const reader = backendProcess.stderr.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    if (text.trim()) {
      console.log(`[API ERROR] ${text.trim()}`)
    }
  }
})() // Logs frontend
;(async () => {
  const reader = frontendProcess.stdout.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    if (text.trim()) {
      console.log(`[VITE] ${text.trim()}`)
    }
  }
})()
;(async () => {
  const reader = frontendProcess.stderr.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const text = decoder.decode(value)
    if (text.trim()) {
      console.log(`[VITE ERROR] ${text.trim()}`)
    }
  }
})()

// Attendre que les processus se terminent
await Promise.all([
  backendProcess.status,
  frontendProcess.status,
])
