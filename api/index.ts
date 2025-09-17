// api/index.ts - Point d'entrée pour Vercel
import { searchMemes } from './img/imgflipScraper.ts'

type MemeData = {
  title: string
  blankImg: string
  memeUrl: string
}

type ImgflipMeme = {
  id: string
  name: string
  url: string
}

/**
 * Récupère les memes populaires via l'API officielle Imgflip
 */
const getImgflipApiMemes = async (): Promise<MemeData[]> => {
  try {
    console.log('🚀 Fetching popular memes from Imgflip API...')

    const response = await fetch('https://api.imgflip.com/get_memes', {
      headers: {
        'User-Agent': 'MemeGenerator/1.0',
      },
    })

    if (!response.ok) {
      throw new Error(
        `API responded with status ${response.status}: ${response.statusText}`,
      )
    }

    const data = await response.json()

    if (!data || !data.success || !Array.isArray(data.data?.memes)) {
      throw new Error('Invalid API response structure')
    }

    const memes = data.data.memes
      .filter((meme: ImgflipMeme) => meme && meme.name && meme.url)
      .map((meme: ImgflipMeme) => ({
        title: meme.name.substring(0, 100),
        blankImg: meme.url,
        memeUrl: `https://imgflip.com/meme/${meme.id}`,
      }))

    console.log(`✅ Retrieved ${memes.length} popular memes from API`)
    return memes
  } catch (error) {
    console.error('❌ Imgflip API error:', error.message)
    return []
  }
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  // CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  })

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers })
  }

  // Route: /api/search-memes
  if (url.pathname.includes('/search-memes') && req.method === 'GET') {
    const startTime = Date.now()

    try {
      const query = url.searchParams.get('query')
      const page = parseInt(url.searchParams.get('page') || '1')

      if (!query || query.trim().length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Query parameter is required and must be a non-empty string',
          }),
          { status: 400, headers },
        )
      }

      if (isNaN(page) || page < 1 || page > 100) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Page must be a number between 1 and 100',
          }),
          { status: 400, headers },
        )
      }

      const cleanQuery = query.trim().substring(0, 100)

      // Stratégie: API pour memes populaires, scraper pour recherches spécifiques
      let memes: MemeData[] = []
      let source = ''

      const shouldUseApi = page === 1 && (
        !cleanQuery ||
        cleanQuery.toLowerCase() === 'meme' ||
        cleanQuery.toLowerCase() === 'popular'
      )

      if (shouldUseApi) {
        console.log(`🚀 Using Imgflip API for popular memes: "${cleanQuery}"`)
        memes = await getImgflipApiMemes()
        source = 'imgflip_api'

        // Fallback vers scraper si API échoue
        if (memes.length === 0) {
          console.log(`📡 API fallback to scraper for: "${cleanQuery}"`)
          memes = await searchMemes(cleanQuery, page)
          source = 'scraper_fallback'
        }
      } else {
        // Utiliser le scraper pour recherches spécifiques
        console.log(`📡 Scraping for: "${cleanQuery}" - Page ${page}`)
        memes = await searchMemes(cleanQuery, page)
        source = 'scraper'
      }

      const responseTime = Date.now() - startTime

      console.log(
        `✅ Found ${memes.length} memes in ${responseTime}ms (${source})`,
      )

      return new Response(
        JSON.stringify({
          success: true,
          data: memes,
          source,
          responseTime: `${responseTime}ms`,
          cached: false,
          query: cleanQuery,
          page,
        }),
        { headers },
      )
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error(`❌ Search error (${responseTime}ms):`, error.message)

      return new Response(
        JSON.stringify({
          success: false,
          error: 'Internal server error while searching memes',
          responseTime: `${responseTime}ms`,
        }),
        { status: 500, headers },
      )
    }
  }

  // 404 pour toutes les autres routes
  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers },
  )
}
