/**
 * Normalise une URL d'image en gérant les protocoles relatifs et chemins
 * @param {string} url - URL à normaliser
 * @returns {string} URL normalisée
 */
const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  // Nettoyer l'URL des espaces et caractères indésirables
  url = url.trim()

  // Gérer les URLs relatives au protocole
  if (url.startsWith('//')) {
    return 'https:' + url
  }

  // Gérer les chemins relatifs
  if (url.startsWith('/') && !url.startsWith('//')) {
    return 'https://imgflip.com' + url
  }

  // Si déjà une URL complète, la retourner telle quelle
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url
  }

  // Fallback: considérer comme chemin relatif
  return 'https://imgflip.com/' + url
}

/**
 * Valide qu'une URL d'image est correcte et accessible
 * @param {string} url - URL à valider
 * @returns {boolean} true si l'URL semble valide
 */
const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false

  try {
    const urlObj = new URL(url)

    // Vérifier le domaine autorisé
    const allowedDomains = ['imgflip.com', 'i.imgflip.com']
    if (!allowedDomains.some((domain) => urlObj.hostname.endsWith(domain))) {
      return false
    }

    // Vérifier l'extension (format d'image ou vidéo)
    const validExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.mp4',
      '.webm',
      '.ogg',
    ]
    const pathname = urlObj.pathname.toLowerCase()

    return validExtensions.some((ext) => pathname.includes(ext))
  } catch (_error) {
    return false
  }
}

/**
 * Divise un array en chunks de taille donnée pour traitement parallèle
 * @param {Array} array - Le tableau à diviser
 * @param {number} size - Taille de chaque chunk
 * @returns {Array[]} Tableau de chunks
 */
const chunkArray = (array, size) => {
  if (!Array.isArray(array) || size <= 0) {
    throw new Error('Invalid array or chunk size')
  }

  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Récupère les données d'un meme individuel avec parsing regex optimisé
 * @param {string} link - URL du meme à scraper
 * @returns {Promise<Object|null>} Données du meme ou null si échec
 */
const fetchMemeData = async (link) => {
  // Validation d'entrée
  if (
    !link || typeof link !== 'string' ||
    !link.startsWith('https://imgflip.com/meme/')
  ) {
    throw new Error(`Invalid meme link: ${link}`)
  }

  try {
    const resMeme = await fetch(link)

    if (!resMeme.ok) {
      throw new Error(`HTTP ${resMeme.status}: ${resMeme.statusText}`)
    }

    const htmlMeme = await resMeme.text()

    if (!htmlMeme || htmlMeme.length < 100) {
      throw new Error('Invalid or empty HTML response')
    }

    // Extraction du titre avec regex sécurisé
    const titleMatch = htmlMeme.match(/<title[^>]*>([^<]+)</i)
    const title = titleMatch
      ? titleMatch[1].split(' - ')[0].trim().substring(0, 100) // Limite à 100 chars
      : 'Unknown Meme'

    // Extraction d'image avec stratégie en cascade
    let blankImg = ''

    // Stratégie 1: Template officiel avec "Blank Meme Template"
    const TEMPLATE_REGEX =
      /<a[^>]*class="[^"]*meme-link[^"]*"[^>]*title="[^"]*Blank\s+Meme\s+Template[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/i
    const templateMatch = TEMPLATE_REGEX.exec(htmlMeme)

    if (templateMatch && templateMatch[1]) {
      blankImg = templateMatch[1]
    } else {
      // Stratégie 2: Image contenant "blank" ou "template"
      const IMG_KEYWORDS_REGEX =
        /<img[^>]*src="([^"]*(?:blank|template)[^"]*)"/i
      const imgMatch = IMG_KEYWORDS_REGEX.exec(htmlMeme)

      if (imgMatch && imgMatch[1]) {
        blankImg = imgMatch[1]
      } else {
        // Stratégie 3: Première image standard (formats acceptés)
        const FALLBACK_REGEX =
          /<img[^>]*src="([^"]*\.(?:jpg|jpeg|png|gif|webp)(?:\?[^"]*)?[^"]*)"/i
        const fallbackMatch = FALLBACK_REGEX.exec(htmlMeme)

        if (fallbackMatch && fallbackMatch[1]) {
          blankImg = fallbackMatch[1]
        }
      }
    }

    // Stratégie 4: Fallback vers vidéo si aucune image
    if (!blankImg) {
      const VIDEO_REGEX = /<source[^>]*src="([^"]+\.(?:mp4|webm|ogg)[^"]*)"/i
      const videoMatch = VIDEO_REGEX.exec(htmlMeme)
      if (videoMatch && videoMatch[1]) {
        blankImg = videoMatch[1]
      }
    }

    // Validation et normalisation de l'URL
    if (blankImg) {
      blankImg = normalizeImageUrl(blankImg)

      if (isValidImageUrl(blankImg)) {
        return {
          title: title,
          memeUrl: link,
          blankImg: blankImg,
        }
      }
    }

    return null
  } catch (err) {
    console.error(`❌ Error fetching meme data from ${link}:`, err.message)
    return null
  }
}

/**
 * Recherche des memes sur Imgflip avec scraping optimisé
 * @param {string} query - Terme de recherche
 * @param {number} page - Numéro de page (défaut: 1)
 * @returns {Promise<Array>} Liste des memes trouvés
 * @throws {Error} Si les paramètres sont invalides
 */
export async function searchMemes(query, page = 1) {
  // Validation des paramètres d'entrée
  if (typeof query !== 'string') {
    throw new Error('Query must be a string')
  }

  if (!Number.isInteger(page) || page < 1 || page > 100) {
    throw new Error('Page must be an integer between 1 and 100')
  }

  // Nettoyer et encoder la query
  const cleanQuery = query.trim()
  const encodedQuery = encodeURIComponent(cleanQuery)
  const searchUrl =
    `https://imgflip.com/memesearch?q=${encodedQuery}&nsfw=on&page=${page}`

  try {
    // 1. Récupérer la page de recherche
    console.log(`🔍 Searching: "${cleanQuery}" (page ${page})`)

    const response = await fetch(searchUrl)

    if (!response.ok) {
      throw new Error(`Search failed: HTTP ${response.status}`)
    }

    const html = await response.text()

    if (!html || html.length < 500) {
      throw new Error('Invalid search results page')
    }

    // 2. Extraire les liens de memes avec regex sécurisé
    const memeLinks = extractMemeLinks(html)

    if (memeLinks.length === 0) {
      console.log(`ℹ️  No memes found for: "${cleanQuery}"`)
      return []
    }

    console.log(`📄 Found ${memeLinks.length} meme links`)

    // 3. Traiter les liens avec concurrence contrôlée
    const memes = await processMemeLinksParallel(memeLinks)

    console.log(
      `✅ Successfully processed ${memes.length}/${memeLinks.length} memes`,
    )
    return memes
  } catch (error) {
    console.error(`❌ Search failed for "${cleanQuery}":`, error.message)
    throw error
  }
}

/**
 * Extrait les liens de memes depuis le HTML de la page de recherche
 * @param {string} html - HTML de la page de recherche
 * @returns {Array<string>} Liste des URLs de memes
 */
const extractMemeLinks = (html) => {
  const memeLinks = new Set() // Utiliser Set pour éviter les doublons
  const MEME_LINK_REGEX = /<a[^>]*href="(\/meme\/[^"]+)"/gi

  let match
  while ((match = MEME_LINK_REGEX.exec(html)) !== null) {
    if (match[1] && match[1].length > 6) { // Validation basique
      const fullLink = 'https://imgflip.com' + match[1]
      memeLinks.add(fullLink)
    }
  }

  return Array.from(memeLinks)
}

/**
 * Traite les liens de memes en parallèle avec gestion d'erreur robuste
 * @param {Array<string>} memeLinks - Liste des URLs à traiter
 * @returns {Promise<Array>} Liste des memes traités avec succès
 */
const processMemeLinksParallel = async (memeLinks) => {
  const CHUNK_SIZE = 12 // Équilibrer performance vs charge serveur
  const chunks = chunkArray(memeLinks, CHUNK_SIZE)

  console.log(
    `⚡ Processing ${memeLinks.length} memes in ${chunks.length} chunks (${CHUNK_SIZE}x concurrency)`,
  )

  // Traiter tous les chunks en parallèle pour vitesse maximale
  const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
    try {
      const chunkResults = await Promise.all(
        chunk.map((link) =>
          fetchMemeData(link).catch((err) => {
            console.warn(`⚠️  Failed to process: ${link} - ${err.message}`)
            return null
          })
        ),
      )

      const validMemes = chunkResults.filter((meme) => meme !== null)
      console.log(
        `⚡ Chunk ${
          chunkIndex + 1
        }/${chunks.length}: ${validMemes.length}/${chunk.length} success`,
      )

      return validMemes
    } catch (error) {
      console.error(`❌ Chunk ${chunkIndex + 1} failed:`, error.message)
      return []
    }
  })

  // Attendre tous les chunks et aplatir les résultats
  const allResults = await Promise.all(chunkPromises)
  return allResults.flat()
}
