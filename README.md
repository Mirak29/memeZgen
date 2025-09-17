# MemeZgen

Modern meme generator built with Preact, Tailwind CSS v4, DaisyUI, and Deno API.

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
- **API**: Imgflip + intelligent scraping

## 📦 Vercel Deployment

Project configured for Vercel with:

- Frontend: Static build
- Backend: Deno serverless functions

```bash
# Build for Vercel
npm task build

# Deploy
vercel --prod
```

## 🛠️ Features

- ✅ Meme search with pagination
- ✅ Drag & drop editor with customizable text
- ✅ Meme download functionality
- ✅ localStorage persistence
- ✅ Smooth page navigation
- ✅ Intelligent API caching (24h TTL)
- ✅ Responsive minimalist design

## 🔧 Configuration

- `deno.json`: Deno configuration and tasks
- `vercel.json`: Deployment configuration
- `vite.config.ts`: Vite configuration
- `tailwind.config.js`: Tailwind CSS configuration
