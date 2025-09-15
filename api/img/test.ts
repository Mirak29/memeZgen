import { searchMemes, getNextPage } from './imgflipScraper.ts'

async function testScraper() {
  console.log('Testing Imgflip scraper...')

  // Test basic search
  console.log('\n--- Testing basic search ---')
  const results = await searchMemes('dragon ball', 1, { nsfw: true })
  console.log(`Found ${results.totalFound} memes on page ${results.currentPage}`)
  console.log(`Has next page: ${results.hasNextPage}`)

  if (results.memes.length > 0) {
    const firstMeme = results.memes[0]
    console.log(`First meme: "${firstMeme.title}"`)
    console.log(`Templates: ${firstMeme.blankTemplates.length}`)
    console.log(`URL: ${firstMeme.memeUrl}`)
  }

  // Test pagination if available
  if (results.hasNextPage) {
    console.log('\n--- Testing pagination ---')
    const nextPage = await getNextPage('dragon ball', results.currentPage, { nsfw: true })
    console.log(`Page ${nextPage.currentPage} found ${nextPage.totalFound} memes`)
  }

  console.log('\n--- Test completed ---')
}

testScraper().catch(console.error)