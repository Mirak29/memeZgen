import { useEffect, useState } from 'preact/hooks'
import { SearchBar } from '../../components/SearchBar.tsx'
import { MemeGallery } from '../../components/MemeGallery.tsx'

export function Home() {
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage.getItem('home-search-query') || ''
    }
    return ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      globalThis.localStorage.setItem('home-search-query', searchQuery)
    }
  }, [searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading)
  }

  return (
    <div class='w-full'>
      {/* Hero Section */}
      <main class='flex-grow flex flex-col items-center justify-center text-center py-12 sm:py-20'>
        <div class='mb-12'>
          <h1 class='text-4xl sm:text-6xl font-light text-white mb-4'>
            Generate memes
          </h1>
          <p class='text-xl sm:text-2xl font-normal text-cyan-100'>
            Simply and beautifully
          </p>
        </div>

        <div class='relative w-full max-w-md'>
          <SearchBar
            onSearch={handleSearch}
            isLoading={isLoading}
            value={searchQuery}
          />
        </div>
      </main>

      {/* Meme Gallery */}
      {searchQuery
        ? (
          <div class='pb-8'>
            <MemeGallery
              searchQuery={searchQuery}
              onLoadingChange={handleLoadingChange}
            />
          </div>
        )
        : (
          <div class='flex items-center justify-center min-h-[200px] text-center'>
            <p class='text-lg text-white/70'>
              Search for meme templates to get started
            </p>
          </div>
        )}
    </div>
  )
}
