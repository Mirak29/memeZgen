import { searchMemes } from './imgflipScraper.ts'

console.log('=== Test Page 1 ===')
const memes1 = await searchMemes('cat', 1)
console.log(`Page 1: ${memes1.length} memes`)
console.log(memes1.slice(0, 2))

console.log('\n=== Test Page 2 ===')
const memes2 = await searchMemes('cat', 2)
console.log(`Page 2: ${memes2.length} memes`)
console.log(memes2.slice(0, 2))
