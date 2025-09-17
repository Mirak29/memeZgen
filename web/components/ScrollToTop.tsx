import { useEffect, useState } from 'preact/hooks'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (globalThis.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    globalThis.addEventListener('scroll', toggleVisibility)

    return () => globalThis.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    globalThis.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      type='button'
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        btn btn-circle btn-primary btn-lg
        shadow-lg
        transition-all duration-300 ease-in-out
        ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }
        hover:shadow-xl hover:scale-110
      `}
      aria-label='Scroll to top'
    >
      <svg
        className='w-6 h-6'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M5 10l7-7m0 0l7 7m-7-7v18'
        />
      </svg>
    </button>
  )
}
