import { useState } from 'preact/hooks'

type SearchBarProps = {
  onSearch: (query: string) => void
  isLoading?: boolean
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    setQuery(target.value)
  }

  return (
    <div class='relative w-full'>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Search meme templates...'
          class='w-full bg-white border border-slate-200 rounded-lg pl-4 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm'
          value={query}
          onInput={handleInputChange}
          disabled={isLoading}
        />
      </form>

      <div class='absolute right-3 top-1/2 -translate-y-1/2'>
        {isLoading
          ? (
            <span class='loading loading-spinner loading-sm text-cyan-500'>
            </span>
          )
          : (
            <svg
              class='w-5 h-5 text-slate-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                stroke-linecap='round'
                stroke-linejoin='round'
                stroke-width='2'
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          )}
      </div>
    </div>
  )
}
