import { useLocation } from 'preact-iso'

export function Header() {
  const { url } = useLocation()

  return (
    <div class='navbar bg-base-100 shadow-lg'>
      <div class='navbar-start'>
        <div class='dropdown'>
          <div tabindex={0} role='button' class='btn btn-ghost lg:hidden'>
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
                d='M4 6h16M4 12h8m-8 6h16'
              />
            </svg>
          </div>
          <ul
            tabindex={0}
            class='menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow'
          >
            <li>
              <a href='/' class={url === '/' ? 'active' : ''}>
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
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
                Gallery
              </a>
            </li>
            <li>
              <a href='/editor' class={url === '/editor' ? 'active' : ''}>
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
                    d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                  />
                </svg>
                Editor
              </a>
            </li>
          </ul>
        </div>
        <a href='/' class='btn btn-ghost text-xl'>
          <img
            src='/meme.png'
            alt='MemeZgen Logo'
            class='w-8 h-8 mr-2'
          />
          MemeZgen
        </a>
      </div>
      <div class='navbar-center hidden lg:flex'>
        <div class='flex gap-2'>
          <a
            href='/'
            class={`btn ${url === '/' ? 'btn-primary' : 'btn-ghost'}`}
          >
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
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
            Gallery
          </a>
          <a
            href='/editor'
            class={`btn ${url === '/editor' ? 'btn-primary' : 'btn-ghost'}`}
          >
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
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
            Editor
          </a>
        </div>
      </div>
      <div class='navbar-end'>
      </div>
    </div>
  )
}
