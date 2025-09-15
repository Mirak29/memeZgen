import { useState } from 'preact/hooks'
import { SearchBar } from '../../components/SearchBar.tsx'
import { MemeGallery } from '../../components/MemeGallery.tsx'

export function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (query: string) => {
    setIsSearching(true)
    setSearchQuery(query)
    setTimeout(() => setIsSearching(false), 500)
  }

  return (
    <div class='min-h-screen bg-base-300'>
      <div class='container mx-auto px-4'>
        <div class='flex flex-col items-center justify-center min-h-[60vh] text-center'>
          <h1 class='text-6xl md:text-7xl font-bold text-base-content mb-4'>
            Generate memes
          </h1>
          <h2 class='text-4xl md:text-5xl font-bold text-primary mb-12'>
            easily
          </h2>

          <div class='w-full max-w-lg'>
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          </div>
        </div>

        {searchQuery && (
          <div class='pb-8'>
            <MemeGallery searchQuery={searchQuery} />
          </div>
        )}
      </div>
    </div>
  )
}
