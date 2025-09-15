import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'
import type { SearchResult, MemeSearchOptions } from './types.ts'
import { extractMemeLinks, parseMeme } from './memeParser.ts'

function buildSearchUrl(query: string, page: number, options: MemeSearchOptions): string {
  const baseUrl = 'https://imgflip.com/memesearch'
  const params = new URLSearchParams()

  params.set('q', query)
  if (page > 1) params.set('page', page.toString())
  if (options.nsfw) params.set('nsfw', 'on')

  return `${baseUrl}?${params.toString()}`
}

async function fetchSearchPage(url: string): Promise<Document | null> {
  try {
    const response = await fetch(url)
    const html = await response.text()
    return new DOMParser().parseFromString(html, 'text/html')
  } catch {
    return null
  }
}

function hasNextPageIndicator(doc: Document): boolean {
  const nextButtons = doc.querySelectorAll('a')
  for (const button of nextButtons) {
    const text = button.textContent?.toLowerCase()
    if (text?.includes('next') || text?.includes('→')) return true
  }
  return false
}

export async function searchMemes(
  query: string,
  page: number = 1,
  options: MemeSearchOptions = {}
): Promise<SearchResult> {
  const searchUrl = buildSearchUrl(query, page, options)
  const doc = await fetchSearchPage(searchUrl)

  if (!doc) {
    return {
      memes: [],
      currentPage: page,
      hasNextPage: false,
      totalFound: 0
    }
  }

  const memeLinks = extractMemeLinks(doc)
  const memes = []

  for (const link of memeLinks) {
    const memeResult = await parseMeme(link)
    if (memeResult) {
      memes.push(memeResult)
      console.log(`Processed: ${memeResult.title} => ${memeResult.blankTemplates.length} template(s)`)
    }
  }

  return {
    memes,
    currentPage: page,
    hasNextPage: hasNextPageIndicator(doc),
    totalFound: memes.length
  }
}

export async function getNextPage(
  query: string,
  currentPage: number,
  options: MemeSearchOptions = {}
): Promise<SearchResult> {
  return searchMemes(query, currentPage + 1, options)
}