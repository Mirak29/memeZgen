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

      <div class='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
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
    <div class='card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow'>
      <figure class='aspect-square'>
        {firstTemplate
          ? (
            <img
              src={firstTemplate.url}
              alt={meme.title}
              class='w-full h-full object-cover'
              loading='lazy'
            />
          )
          : (
            <div class='w-full h-full bg-base-200 flex items-center justify-center'>
              <span class='text-base-content/50'>No image</span>
            </div>
          )}
      </figure>
      <div class='card-body p-4'>
        <h2 class='card-title text-sm leading-tight'>{meme.title}</h2>
        <div class='card-actions justify-end mt-2'>
          <a
            href={`/editor?template=${
              encodeURIComponent(firstTemplate?.url || '')
            }`}
            class='btn btn-primary btn-sm'
          >
            Edit
          </a>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div class='card bg-base-100 shadow-xl'>
      <figure class='aspect-square'>
        <div class='skeleton w-full h-full'></div>
      </figure>
      <div class='card-body p-4'>
        <div class='skeleton h-4 w-full mb-2'></div>
        <div class='skeleton h-4 w-3/4'></div>
        <div class='card-actions justify-end mt-2'>
          <div class='skeleton h-8 w-16'></div>
        </div>
      </div>
    </div>
  )
}
