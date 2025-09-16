import express from 'express';
import cors from 'cors';
import { searchMemes } from './img/imgflipScraper.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Cache intelligent avec TTL de 24h
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 heures

// Nettoyage du cache expiré
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now > value.expiry) {
      cache.delete(key);
    }
  }
};

setInterval(cleanExpiredCache, 60 * 60 * 1000); // Nettoie toutes les heures

/**
 * Récupère les memes populaires via l'API officielle Imgflip
 * @returns {Promise<Array>} Liste des memes populaires ou tableau vide si échec
 */
const getImgflipApiMemes = async () => {
  try {
    console.log('🚀 Fetching popular memes from Imgflip API...');

    const response = await fetch('https://api.imgflip.com/get_memes', {
      timeout: 5000, // Timeout de 5 secondes
      headers: {
        'User-Agent': 'MemeGenerator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || !data.success || !Array.isArray(data.data?.memes)) {
      throw new Error('Invalid API response structure');
    }

    const memes = data.data.memes
      .filter(meme => meme && meme.name && meme.url) // Validation basique
      .map(meme => ({
        title: meme.name.substring(0, 100), // Limiter la longueur
        blankImg: meme.url,
        memeUrl: `https://imgflip.com/meme/${meme.id}`
      }));

    console.log(`✅ Retrieved ${memes.length} popular memes from API`);
    return memes;

  } catch (error) {
    console.error('❌ Imgflip API error:', error.message);
    return [];
  }
};

// Middleware de sécurité et monitoring
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : true,
  credentials: false
}));

app.use(express.json({ limit: '1mb' }));

// Middleware de logging des requêtes
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 ${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Middleware de rate limiting simple
const requestCounts = new Map();
app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 60; // 60 requêtes par minute

  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
  } else {
    const clientData = requestCounts.get(clientIP);

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }

    if (clientData.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
  }

  next();
});

// Nettoyage périodique des compteurs de rate limiting
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Nettoie toutes les 5 minutes

/**
 * Endpoint principal pour rechercher des memes
 * GET /api/search-memes?query=cat&page=1
 */
app.get('/api/search-memes', async (req, res) => {
  const startTime = Date.now();

  try {
    // Validation des paramètres
    const { query, page = 1 } = req.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required and must be a non-empty string'
      });
    }

    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Page must be a number between 1 and 100'
      });
    }

    const cleanQuery = query.trim().substring(0, 100); // Limiter la longueur
    const cacheKey = `${cleanQuery.toLowerCase()}_${pageNum}`;
    const now = Date.now();

    // 1. Vérification du cache intelligent
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now < cached.expiry) {
        const responseTime = Date.now() - startTime;
        console.log(`⚡ Cache hit: "${cleanQuery}" - Page ${pageNum} (${cached.data.length} memes) - ${responseTime}ms`);

        return res.json({
          success: true,
          data: cached.data,
          source: 'cache',
          responseTime: `${responseTime}ms`,
          cached: true
        });
      }
      cache.delete(cacheKey);
    }

    // 2. Déterminer la stratégie de récupération
    let memes = [];
    let source = '';

    // Stratégie: API pour memes populaires, scraper pour recherches spécifiques
    const shouldUseApi = pageNum === 1 && (
      !cleanQuery ||
      cleanQuery.toLowerCase() === 'meme' ||
      cleanQuery.toLowerCase() === 'popular'
    );

    if (shouldUseApi) {
      console.log(`🚀 Using Imgflip API for popular memes: "${cleanQuery}"`);
      memes = await getImgflipApiMemes();
      source = 'imgflip_api';

      // Fallback vers scraper si API échoue
      if (memes.length === 0) {
        console.log(`📡 API fallback to scraper for: "${cleanQuery}"`);
        memes = await searchMemes(cleanQuery, pageNum);
        source = 'scraper_fallback';
      }
    } else {
      // Utiliser le scraper pour recherches spécifiques
      console.log(`📡 Scraping for: "${cleanQuery}" - Page ${pageNum}`);
      memes = await searchMemes(cleanQuery, pageNum);
      source = 'scraper';
    }

    const responseTime = Date.now() - startTime;

    // 3. Mise en cache des résultats
    if (memes.length > 0) {
      cache.set(cacheKey, {
        data: memes,
        expiry: now + CACHE_TTL,
        createdAt: now
      });
    }

    // 4. Réponse avec métadonnées
    console.log(`✅ Found ${memes.length} memes in ${responseTime}ms (${source})`);

    res.json({
      success: true,
      data: memes,
      source,
      responseTime: `${responseTime}ms`,
      cached: false,
      query: cleanQuery,
      page: pageNum
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`❌ Search error (${responseTime}ms):`, error.message);

    res.status(500).json({
      success: false,
      error: 'Internal server error while searching memes',
      responseTime: `${responseTime}ms`
    });
  }
});

/**
 * Endpoint pour les statistiques du serveur
 * GET /api/stats
 */
app.get('/api/stats', (_, res) => {
  const now = Date.now();
  const cacheEntries = Array.from(cache.values());

  // Calculer les stats du cache
  const cacheStats = {
    totalEntries: cache.size,
    expiredEntries: cacheEntries.filter(entry => now > entry.expiry).length,
    validEntries: cacheEntries.filter(entry => now <= entry.expiry).length,
    oldestEntry: cacheEntries.length > 0 ? Math.min(...cacheEntries.map(e => e.createdAt || 0)) : null,
    newestEntry: cacheEntries.length > 0 ? Math.max(...cacheEntries.map(e => e.createdAt || 0)) : null
  };

  // Stats du rate limiting
  const rateLimitStats = {
    trackedIPs: requestCounts.size,
    totalRequestsTracked: Array.from(requestCounts.values()).reduce((sum, data) => sum + data.count, 0)
  };

  res.json({
    success: true,
    serverUptime: process.uptime(),
    cache: cacheStats,
    rateLimiting: rateLimitStats,
    memoryUsage: process.memoryUsage(),
    nodeVersion: process.version,
    timestamp: now
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💾 Cache TTL: ${CACHE_TTL / 1000 / 60 / 60}h`);
});