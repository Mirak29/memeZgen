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
    <form onSubmit={handleSubmit} class='w-full'>
      <div class='relative'>
        <input
          type='text'
          placeholder='Search template'
          class='input input-bordered input-lg w-full bg-base-100 text-center text-lg'
          value={query}
          onInput={handleInputChange}
          disabled={isLoading}
        />
        <button
          type='submit'
          class={`absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-circle ${
            isLoading ? 'loading' : ''
          }`}
          disabled={isLoading || !query.trim()}
        >
          {isLoading
            ? <span class='loading loading-spinner loading-sm'></span>
            : (
              <svg
                xmlns='http://www.w3.org/2000/svg'
                class='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
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
    </form>
  )
}
