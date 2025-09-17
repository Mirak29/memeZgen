import { useEffect, useState } from 'preact/hooks'

type ApiMemeResult = {
  title: string
  memeUrl: string
  blankImg: string
}

type ApiResponse = {
  success: boolean
  data: ApiMemeResult[]
  source: string
  responseTime: string
  cached: boolean
  query?: string
  page?: number
}

type MemeResult = {
  title: string
  memeUrl: string
  blankTemplates: Array<{
    url: string
    type: 'image' | 'video'
  }>
}

type SearchResult = {
  memes: MemeResult[]
  currentPage: number
  hasNextPage: boolean
  totalFound: number
}

type MemeGalleryProps = {
  searchQuery: string
  onLoadingChange?: (loading: boolean) => void
}

export function MemeGallery(
  { searchQuery, onLoadingChange }: MemeGalleryProps,
) {
  const [results, setResults] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults(null)
      return
    }

    loadMemes(searchQuery, 1)
  }, [searchQuery])

  const loadMemes = async (query: string, page: number) => {
    setIsLoading(true)
    onLoadingChange?.(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/search-memes?query=${
          encodeURIComponent(query)
        }&page=${page}`,
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const apiResponse: ApiResponse = await response.json()

      if (!apiResponse.success) {
        throw new Error('API returned error')
      }

      // Transform API response to our format
      const transformedMemes: MemeResult[] = apiResponse.data.map((meme) => ({
        title: meme.title,
        memeUrl: meme.memeUrl,
        blankTemplates: [{
          url: meme.blankImg,
          type: 'image' as const,
        }],
      }))

      const newResults: SearchResult = {
        memes: transformedMemes,
        currentPage: page,
        hasNextPage: transformedMemes.length >= 10, // Assume more pages if we got 10+ results
        totalFound: transformedMemes.length,
      }

      if (page === 1) {
        setResults(newResults)
      } else if (results) {
        setResults({
          ...newResults,
          memes: [...results.memes, ...transformedMemes],
          totalFound: results.totalFound + transformedMemes.length,
        })
      }
    } catch (err) {
      console.error('Failed to load memes:', err)
      setError('Failed to load memes. Please try again.')
    } finally {
      setIsLoading(false)
      onLoadingChange?.(false)
    }
  }

  const loadMore = () => {
    if (results && results.hasNextPage && !isLoading) {
      loadMemes(searchQuery, results.currentPage + 1)
    }
  }

  if (!searchQuery.trim()) {
    return (
      <div class='text-center py-12'>
        <div class='text-6xl mb-4'>🔍</div>
        <h3 class='text-xl font-semibold mb-2'>Search for memes</h3>
        <p class='text-base-content/70'>
          Enter a search term to find awesome meme templates
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div class='alert alert-error'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          class='stroke-current shrink-0 h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div>
      {results && (
        <div class='mb-4'>
          <p class='text-sm text-base-content/70'>
            Found {results.totalFound} memes for "{searchQuery}"
          </p>
        </div>
      )}

      <div class='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full'>
        {results?.memes.map((meme, index) => (
          <MemeCard key={`${meme.memeUrl}-${index}`} meme={meme} />
        ))}

        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
      </div>

      {results && results.hasNextPage && !isLoading && (
        <div class='text-center mt-8'>
          <button type='button' class='btn btn-primary' onClick={loadMore}>
            Load More Memes
          </button>
        </div>
      )}
    </div>
  )
}

function MemeCard({ meme }: { meme: MemeResult }) {
  const firstTemplate = meme.blankTemplates[0]

  const handleEditClick = (e: Event) => {
    e.stopPropagation()
    if (firstTemplate?.url) {
      globalThis.location.href = `/editor?template=${
        encodeURIComponent(firstTemplate.url)
      }`
    }
  }

  return (
    <div class='bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200 w-full relative group'>
      {firstTemplate
        ? (
          <img
            src={firstTemplate.url}
            alt={meme.title}
            class='w-full h-48 object-cover'
            loading='lazy'
          />
        )
        : (
          <div class='w-full h-48 bg-slate-100 flex items-center justify-center'>
            <span class='text-slate-400'>No image</span>
          </div>
        )}

      {/* Edit button overlay */}
      <button
        type='button'
        class='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg'
        onClick={handleEditClick}
        title='Edit meme'
      >
        <svg
          class='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
          />
        </svg>
      </button>

      <div class='p-4'>
        <h3 class='text-sm font-medium text-slate-700 text-center leading-tight'>
          {meme.title}
        </h3>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div class='bg-white rounded-lg border border-slate-200 w-full'>
      <div class='w-full h-48 bg-slate-100 animate-pulse'></div>
      <div class='p-4'>
        <div class='h-4 bg-slate-200 rounded animate-pulse'></div>
      </div>
    </div>
  )
}
