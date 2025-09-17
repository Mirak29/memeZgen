import { searchMemes } from './img/imgflipScraper.ts'

const PORT = parseInt(Deno.env.get('PORT') || '3001')

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

// Cache intelligent avec TTL de 24h
const cache = new Map<
  string,
  { data: MemeData[]; expiry: number; createdAt: number }
>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 heures

// Rate limiting simple
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Nettoyage du cache expiré
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, value] of cache.entries()) {
    if (now > value.expiry) {
      cache.delete(key)
    }
  }
}

setInterval(cleanExpiredCache, 60 * 60 * 1000) // Nettoie toutes les heures

/**
 * Récupère les memes populaires via l'API officielle Imgflip
 */
const getImgflipApiMemes = async () => {
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

// Rate limiting middleware
const checkRateLimit = (clientIP: string): boolean => {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 60 // 60 requêtes par minute

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs })
    return true
  }

  const clientData = requestCounts.get(clientIP)!

  if (now > clientData.resetTime) {
    clientData.count = 1
    clientData.resetTime = now + windowMs
  } else {
    clientData.count++
  }

  return clientData.count <= maxRequests
}

// Nettoyage périodique des compteurs de rate limiting
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Nettoie toutes les 5 minutes

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url)
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown'

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

  // Rate limiting
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests. Please try again later.',
      }),
      { status: 429, headers },
    )
  }

  // Logging
  const timestamp = new Date().toISOString()
  console.log(`📥 ${timestamp} - ${req.method} ${url.pathname} - ${clientIP}`)

  // Route: /api/search-memes
  if (url.pathname === '/api/search-memes' && req.method === 'GET') {
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
      const cacheKey = `${cleanQuery.toLowerCase()}_${page}`
      const now = Date.now()

      // Vérification du cache
      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!
        if (now < cached.expiry) {
          const responseTime = Date.now() - startTime
          console.log(
            `⚡ Cache hit: "${cleanQuery}" - Page ${page} (${cached.data.length} memes) - ${responseTime}ms`,
          )

          return new Response(
            JSON.stringify({
              success: true,
              data: cached.data,
              source: 'cache',
              responseTime: `${responseTime}ms`,
              cached: true,
            }),
            { headers },
          )
        }
        cache.delete(cacheKey)
      }

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

      // Mise en cache des résultats
      if (memes.length > 0) {
        cache.set(cacheKey, {
          data: memes,
          expiry: now + CACHE_TTL,
          createdAt: now,
        })
      }

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

  // Route: /api/stats
  if (url.pathname === '/api/stats' && req.method === 'GET') {
    const now = Date.now()
    const cacheEntries = Array.from(cache.values())

    const cacheStats = {
      totalEntries: cache.size,
      expiredEntries: cacheEntries.filter((entry) => now > entry.expiry).length,
      validEntries: cacheEntries.filter((entry) => now <= entry.expiry).length,
      oldestEntry: cacheEntries.length > 0
        ? Math.min(...cacheEntries.map((e) => e.createdAt || 0))
        : null,
      newestEntry: cacheEntries.length > 0
        ? Math.max(...cacheEntries.map((e) => e.createdAt || 0))
        : null,
    }

    const rateLimitStats = {
      trackedIPs: requestCounts.size,
      totalRequestsTracked: Array.from(requestCounts.values()).reduce(
        (sum, data) => sum + data.count,
        0,
      ),
    }

    return new Response(
      JSON.stringify({
        success: true,
        cache: cacheStats,
        rateLimiting: rateLimitStats,
        timestamp: now,
      }),
      { headers },
    )
  }

  // 404 pour toutes les autres routes
  return new Response(
    JSON.stringify({ success: false, error: 'Not found' }),
    { status: 404, headers },
  )
}

console.log(`🚀 Deno server starting on port ${PORT}`)
console.log(`💾 Cache TTL: ${CACHE_TTL / 1000 / 60 / 60}h`)

export default {
  fetch: handler,
  port: PORT,
}
