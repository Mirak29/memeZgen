export type MemeSearchOptions = {
  nsfw?: boolean
  includeVideos?: boolean
}

export type BlankMemeTemplate = {
  url: string
  type: 'image' | 'video'
}

export type MemeResult = {
  title: string
  memeUrl: string
  blankTemplates: BlankMemeTemplate[]
}

export type SearchResult = {
  memes: MemeResult[]
  currentPage: number
  hasNextPage: boolean
  totalFound: number
}