/**
 * Type représentant un résultat de meme
 */
export interface MemeResult {
  title: string
  memeUrl: string
  blankImg: string
}

/**
 * Options de configuration pour la recherche
 */
export interface SearchOptions {
  maxRetries?: number
  chunkSize?: number
  timeout?: number
}

/**
 * Erreur personnalisée pour les opérations de scraping
 */
export class ScrapingError extends Error {
  constructor(message: string, public readonly code: string, public readonly statusCode?: number) {
    super(message)
    this.name = 'ScrapingError'
  }
}

/**
 * Normalise une URL d'image en gérant les protocoles relatifs et chemins
 */
const normalizeImageUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return ''

  url = url.trim()

  if (url.startsWith('//')) {
    return 'https:' + url
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    return 'https://imgflip.com' + url
  }

  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url
  }

  return 'https://imgflip.com/' + url
}

/**
 * Valide qu'une URL d'image est correcte et accessible
 */
const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)
    const allowedDomains = ['imgflip.com', 'i.imgflip.com']

    if (!allowedDomains.some(domain => urlObj.hostname.endsWith(domain))) {
      return false
    }

    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.ogg']
    const pathname = urlObj.pathname.toLowerCase()

    return validExtensions.some(ext => pathname.includes(ext))
  } catch {
    return false
  }
}

/**
 * Divise un array en chunks de taille donnée
 */
const chunkArray = <T>(array: T[], size: number): T[][] => {
  if (!Array.isArray(array) || size <= 0) {
    throw new ScrapingError('Invalid array or chunk size', 'INVALID_PARAMS')
  }

  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Récupère les données d'un meme individuel avec parsing regex optimisé
 */
const fetchMemeData = async (link: string): Promise<MemeResult | null> => {
  if (!link || typeof link !== 'string' || !link.startsWith('https://imgflip.com/meme/')) {
    throw new ScrapingError(`Invalid meme link: ${link}`, 'INVALID_LINK')
  }

  try {
    const response = await fetch(link)

    if (!response.ok) {
      throw new ScrapingError(`HTTP ${response.status}: ${response.statusText}`, 'HTTP_ERROR', response.status)
    }

    const htmlMeme = await response.text()

    if (!htmlMeme || htmlMeme.length < 100) {
      throw new ScrapingError('Invalid or empty HTML response', 'INVALID_HTML')
    }

    // Extraction du titre avec regex sécurisé
    const titleMatch = htmlMeme.match(/<title[^>]*>([^<]+)</i)
    const title = titleMatch
      ? titleMatch[1].split(' - ')[0].trim().substring(0, 100)
      : 'Unknown Meme'

    // Extraction d'image avec stratégie en cascade
    let blankImg = ''

    // Stratégie 1: Template officiel
    const TEMPLATE_REGEX = /<a[^>]*class="[^"]*meme-link[^"]*"[^>]*title="[^"]*Blank\s+Meme\s+Template[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i
    const templateMatch = TEMPLATE_REGEX.exec(htmlMeme)

    if (templateMatch?.[1]) {
      blankImg = templateMatch[1]
    } else {
      // Stratégie 2: Image avec mots-clés
      const IMG_KEYWORDS_REGEX = /<img[^>]*src="([^"]*(?:blank|template)[^"]*)"/i
      const imgMatch = IMG_KEYWORDS_REGEX.exec(htmlMeme)

      if (imgMatch?.[1]) {
        blankImg = imgMatch[1]
      } else {
        // Stratégie 3: Première image standard
        const FALLBACK_REGEX = /<img[^>]*src="([^"]*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"]*)?[^"]*)"/i
        const fallbackMatch = FALLBACK_REGEX.exec(htmlMeme)

        if (fallbackMatch?.[1]) {
          blankImg = fallbackMatch[1]
        }
      }
    }

    // Stratégie 4: Fallback vers vidéo
    if (!blankImg) {
      const VIDEO_REGEX = /<source[^>]*src="([^"]+\.(?:mp4|webm|ogg)[^"]*)"/i
      const videoMatch = VIDEO_REGEX.exec(htmlMeme)
      if (videoMatch?.[1]) {
        blankImg = videoMatch[1]
      }
    }

    if (blankImg) {
      const normalizedUrl = normalizeImageUrl(blankImg)

      if (isValidImageUrl(normalizedUrl)) {
        return {
          title,
          memeUrl: link,
          blankImg: normalizedUrl
        }
      }
    }

    return null

  } catch (error) {
    if (error instanceof ScrapingError) {
      throw error
    }

    console.error(`❌ Error fetching meme data from ${link}:`, error)
    return null
  }
}

/**
 * Extrait les liens de memes depuis le HTML
 */
const extractMemeLinks = (html: string): string[] => {
  const memeLinks = new Set<string>()
  const MEME_LINK_REGEX = /<a[^>]*href="(\/meme\/[^"]+)"/gi

  let match: RegExpExecArray | null
  while ((match = MEME_LINK_REGEX.exec(html)) !== null) {
    if (match[1] && match[1].length > 6) {
      const fullLink = 'https://imgflip.com' + match[1]
      memeLinks.add(fullLink)
    }
  }

  return Array.from(memeLinks)
}

/**
 * Traite les liens de memes en parallèle
 */
const processMemeLinksParallel = async (memeLinks: string[], options: SearchOptions = {}): Promise<MemeResult[]> => {
  const { chunkSize = 12 } = options
  const chunks = chunkArray(memeLinks, chunkSize)

  console.log(`⚡ Processing ${memeLinks.length} memes in ${chunks.length} chunks (${chunkSize}x concurrency)`)

  const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
    try {
      const chunkResults = await Promise.all(
        chunk.map(link =>
          fetchMemeData(link).catch(err => {
            console.warn(`⚠️  Failed to process: ${link} - ${err.message}`)
            return null
          })
        )
      )

      const validMemes = chunkResults.filter((meme): meme is MemeResult => meme !== null)
      console.log(`⚡ Chunk ${chunkIndex + 1}/${chunks.length}: ${validMemes.length}/${chunk.length} success`)

      return validMemes
    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error)
      return []
    }
  })

  const allResults = await Promise.all(chunkPromises)
  return allResults.flat()
}

/**
 * Recherche des memes sur Imgflip avec scraping optimisé
 */
export async function searchMemes(
  query: string,
  page: number = 1,
  options: SearchOptions = {}
): Promise<MemeResult[]> {
  // Validation stricte des types
  if (typeof query !== 'string') {
    throw new ScrapingError('Query must be a string', 'INVALID_QUERY_TYPE')
  }

  if (!Number.isInteger(page) || page < 1 || page > 100) {
    throw new ScrapingError('Page must be an integer between 1 and 100', 'INVALID_PAGE')
  }

  const cleanQuery = query.trim()
  const encodedQuery = encodeURIComponent(cleanQuery)
  const searchUrl = `https://imgflip.com/memesearch?q=${encodedQuery}&nsfw=on&page=${page}`

  try {
    console.log(`🔍 Searching: "${cleanQuery}" (page ${page})`)

    const response = await fetch(searchUrl)

    if (!response.ok) {
      throw new ScrapingError(`Search failed: HTTP ${response.status}`, 'SEARCH_FAILED', response.status)
    }

    const html = await response.text()

    if (!html || html.length < 500) {
      throw new ScrapingError('Invalid search results page', 'INVALID_SEARCH_PAGE')
    }

    const memeLinks = extractMemeLinks(html)

    if (memeLinks.length === 0) {
      console.log(`ℹ️  No memes found for: "${cleanQuery}"`)
      return []
    }

    console.log(`📄 Found ${memeLinks.length} meme links`)

    const memes = await processMemeLinksParallel(memeLinks, options)

    console.log(`✅ Successfully processed ${memes.length}/${memeLinks.length} memes`)
    return memes

  } catch (error) {
    if (error instanceof ScrapingError) {
      throw error
    }

    console.error(`❌ Search failed for "${cleanQuery}":`, error)
    throw new ScrapingError(
      `Unexpected error during search: ${error}`,
      'UNEXPECTED_ERROR'
    )
  }
}