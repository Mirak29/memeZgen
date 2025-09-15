import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import type { BlankMemeTemplate, MemeResult } from './types.ts'

function normalizeUrl(url: string): string {
  if (url.startsWith('//')) return 'https:' + url
  return url
}

function extractBlankTemplates(doc: Document): BlankMemeTemplate[] {
  const templates: BlankMemeTemplate[] = []

  // Extract images from meme-link elements
  const memeLinks = doc.querySelectorAll('a.meme-link')
  for (const link of memeLinks) {
    const titleAttr = link.getAttribute('title')
    if (!titleAttr?.includes('Blank Meme Template')) continue

    const imgEl = link.querySelector('img')
    if (!imgEl) continue

    const src = imgEl.getAttribute('src')
    if (!src) continue

    templates.push({
      url: normalizeUrl(src),
      type: 'image',
    })
  }

  // If no images found, check for videos
  if (templates.length === 0) {
    const videoSource = doc.querySelector('video source')
    if (videoSource) {
      const src = videoSource.getAttribute('src')
      if (src) {
        templates.push({
          url: normalizeUrl(src),
          type: 'video',
        })
      }
    }
  }

  return templates
}

function extractTitle(doc: Document): string {
  const titleEl = doc.querySelector('title')
  if (!titleEl?.textContent) return 'Unknown'

  return titleEl.textContent.split(' - ')[0].trim()
}

export async function parseMeme(memeUrl: string): Promise<MemeResult | null> {
  try {
    const response = await fetch(memeUrl)
    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    if (!doc) return null

    const title = extractTitle(doc)
    const blankTemplates = extractBlankTemplates(doc)

    return {
      title,
      memeUrl,
      blankTemplates,
    }
  } catch {
    return null
  }
}

export function extractMemeLinks(doc: Document): string[] {
  const links: string[] = []
  const anchors = doc.querySelectorAll('a')

  for (const anchor of anchors) {
    const href = anchor.getAttribute('href')
    if (!href?.startsWith('/meme/')) continue

    const fullLink = 'https://imgflip.com' + href
    if (!links.includes(fullLink)) {
      links.push(fullLink)
    }
  }

  return links
}
