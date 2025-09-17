# MemeZgen 🎭

Modern meme generator built with Preact, Tailwind CSS v4, DaisyUI, and Deno API.

**🌍 Live Demo**:
[https://memezgen--main.mirak29.deno.net/](https://memezgen--main.mirak29.deno.net/)

## 🚀 Development

### Deno Commands (Recommended)

```bash
# Launch frontend + backend in parallel
deno task dev

# Frontend only
deno task dev:front

# Backend only
deno task dev:back

# Production build
deno task build

# Preview build
deno task preview

# Linting and formatting
deno task lint
deno task check
deno task fmt
```

### npm Commands (Compatibility)

```bash
npm run dev     # → deno task dev
npm run build   # → deno task build
npm run lint    # → deno task lint
```

## 🏗️ Architecture

- **Frontend**: Preact + Vite (port 5173)
- **Backend**: Deno serve + TypeScript (port 3001)
- **Styling**: Tailwind CSS v4 + DaisyUI 5 (aqua theme)
- **API**: Imgflip + intelligent scraping + CORS proxy
- **Deployment**: Deno Deploy (serverless edge computing)

## 🚀 Deployment

### Deno Deploy (Recommended)

The project is optimized for [Deno Deploy](https://deno.com/deploy) with zero
configuration:

```bash
# Production build
deno task build

# Deploy (automated via GitHub)
git push origin main
```

**Configuration**:

- Framework preset: `No Preset`
- Install command: `deno install`
- Build command: `deno task build`
- Runtime: `Dynamic App`
- Entrypoint: `prod.ts`

### Alternative: Vercel

For Vercel deployment (requires Node.js conversion):

```bash
npm run build
vercel --prod
```

## 🛠️ Features

- ✅ **Meme Search**: Powered by Imgflip API with intelligent scraping fallback
- ✅ **Visual Editor**: Drag & drop text with customizable styling
- ✅ **CORS-free Downloads**: Server-side image proxy for seamless meme
  generation
- ✅ **Smart Caching**: 24h TTL with automatic cache management
- ✅ **Local Persistence**: Auto-save work with localStorage
- ✅ **Responsive Design**: Optimized for desktop and mobile
- ✅ **Edge Performance**: Global deployment with Deno Deploy

## 🔧 API Endpoints

### `/api/search-memes`

Search for meme templates with pagination support.

**Parameters**:

- `query` (string): Search term
- `page` (number): Page number (default: 1)

**Example**:

```bash
GET /api/search-memes?query=cat&page=1
```

### `/api/proxy-image`

CORS-compliant image proxy for downloading external meme templates.

**Parameters**:

- `url` (string): Image URL (must be from imgflip.com)

**Example**:

```bash
GET /api/proxy-image?url=https://imgflip.com/s/meme/Grumpy-Cat.jpg
```

### `/api/stats`

API usage statistics and cache information.

**Example**:

```bash
GET /api/stats
```

## 🔧 Configuration

- `deno.json`: Deno configuration and tasks
- `prod.ts`: Production server for Deno Deploy
- `vite.config.js`: Vite configuration with Deno proxy
- `vercel.json`: Alternative Vercel deployment configuration

## 🛡️ Security Features

- **Rate Limiting**: 60 requests per minute per IP
- **URL Validation**: Proxy only allows Imgflip domains
- **Cache Control**: Automatic cleanup of expired cache entries
- **Error Handling**: Comprehensive error logging and user feedback

## 📊 Performance

- **Global CDN**: Deno Deploy edge network
- **Smart Caching**: 24h TTL with intelligent cache management
- **Image Optimization**: Server-side proxy with compression
- **Bundle Size**: Optimized Preact build (~40KB gzipped)
