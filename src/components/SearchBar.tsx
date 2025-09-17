import { useEffect, useState } from 'preact/hooks'

type SearchBarProps = {
  onSearch: (query: string) => void
  isLoading?: boolean
  value?: string
}

export function SearchBar(
  { onSearch, isLoading = false, value = '' }: SearchBarProps,
) {
  const [query, setQuery] = useState(value)

  useEffect(() => {
    setQuery(value)
  }, [value])

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

  const handleButtonClick = () => {
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  return (
    <div class='relative w-full'>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          placeholder='Search meme templates...'
          class='w-full bg-white border border-slate-200 rounded-lg pl-4 pr-16 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent shadow-sm'
          value={query}
          onInput={handleInputChange}
          disabled={isLoading}
        />
      </form>

      <button
        type='button'
        class='absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white rounded-md px-3 py-1.5 transition-colors'
        disabled={isLoading || !query.trim()}
        onClick={handleButtonClick}
      >
        {isLoading
          ? (
            <span class='loading loading-spinner loading-sm'>
            </span>
          )
          : (
            <svg
              class='w-4 h-4'
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
      </button>
    </div>
  )
}
