import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

export type MemeResult = {
  title: string
  memeUrl: string
  blankImg: string
}

export async function searchMemes(query: string, page = 1): Promise<MemeResult[]> {
  const searchUrl = `https://imgflip.com/memesearch?q=${query}&nsfw=on&page=${page}`

  // 1. Fetch search page
  const res = await fetch(searchUrl)
  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (!doc) throw new Error('Failed to parse page')

  // 2. Extract all meme links
  const memeLinks: string[] = []
  for (const a of doc.querySelectorAll('a')) {
    const href = a.getAttribute('href')
    if (href && href.startsWith('/meme/')) {
      const fullLink = 'https://imgflip.com' + href
      if (!memeLinks.includes(fullLink)) memeLinks.push(fullLink)
    }
  }

  console.log(`Found ${memeLinks.length} memes`)

  // 3. For each link, get title and blank template image
  const memes: MemeResult[] = []

  for (const link of memeLinks) {
    try {
      const resMeme = await fetch(link)
      const htmlMeme = await resMeme.text()
      const docMeme = new DOMParser().parseFromString(htmlMeme, 'text/html')
      if (!docMeme) continue

      // Extract page title
      const titleEl = docMeme.querySelector('title')
      const title = titleEl ? titleEl.textContent.split(' - ')[0].trim() : 'Unknown'

      // Find first image in <a class="meme-link"> containing "Blank Meme Template"
      let blankImg = ''
      const templateLinks = docMeme.querySelectorAll('a.meme-link')
      for (const a of templateLinks) {
        const titleAttr = a.getAttribute('title')
        if (titleAttr && titleAttr.includes('Blank Meme Template')) {
          const imgEl = a.querySelector('img')
          if (imgEl) {
            let src = imgEl.getAttribute('src')
            if (src) {
              if (src.startsWith('//')) src = 'https:' + src
              blankImg = src
              break
            }
          }
        }
      }

      // If no image found, look for video
      if (!blankImg) {
        const source = docMeme.querySelector('video source')
        if (source) {
          let src = source.getAttribute('src')
          if (src) {
            if (src.startsWith('//')) src = 'https:' + src
            blankImg = src
          }
        }
      }

      if (blankImg) {
        if (!blankImg.startsWith('https')) {
          blankImg = 'https://imgflip.com' + blankImg
        }
        memes.push({ title, memeUrl: link, blankImg })
        console.log(`Processed: ${title} => image found`)
      }
    } catch (err) {
      console.error('Error on link', link, err)
    }
  }

  return memes
}