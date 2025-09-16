import { useEffect, useState } from 'preact/hooks'

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
}

export function MemeGallery({ searchQuery }: MemeGalleryProps) {
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
    setError(null)

    try {
      // For now, simulate API call - will be replaced with actual scraper
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockResults: SearchResult = {
        memes: Array.from({ length: 12 }, (_, i) => ({
          title: `${query} Meme ${i + 1}`,
          memeUrl: `https://imgflip.com/meme/example-${i}`,
          blankTemplates: [{
            url: `https://i.imgflip.com/example-${i}.jpg`,
            type: 'image' as const,
          }],
        })),
        currentPage: page,
        hasNextPage: page < 3,
        totalFound: 12,
      }

      if (page === 1) {
        setResults(mockResults)
      } else if (results) {
        setResults({
          ...mockResults,
          memes: [...results.memes, ...mockResults.memes],
        })
      }
    } catch (_err) {
      setError('Failed to load memes')
    } finally {
      setIsLoading(false)
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
        {/* Upload card */}
        <UploadCard />

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

  return (
    <div
      class='bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:border-cyan-300 transition-all duration-200 cursor-pointer w-full'
      onClick={() => {
        if (firstTemplate?.url) {
          globalThis.location.href = `/editor?template=${
            encodeURIComponent(firstTemplate.url)
          }`
        }
      }}
    >
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

      <div class='p-4'>
        <h3 class='text-sm font-medium text-slate-700 text-center leading-tight'>
          {meme.title}
        </h3>
      </div>
    </div>
  )
}

function UploadCard() {
  return (
    <div
      class='bg-white rounded-lg border border-dashed border-slate-300 hover:border-cyan-400 transition-colors cursor-pointer flex flex-col w-full items-center justify-center min-h-[280px] group'
      onClick={() => {
        globalThis.location.href = '/editor'
      }}
    >
      <div class='flex flex-col items-center gap-3 text-slate-400 group-hover:text-cyan-600 transition-colors'>
        <svg
          class='w-8 h-8'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='1.5'
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
        <span class='font-medium text-sm text-center'>Upload Your Image</span>
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
