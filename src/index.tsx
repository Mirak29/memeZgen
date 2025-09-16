import {
  hydrate,
  LocationProvider,
  prerender as ssr,
  Route,
  Router,
} from 'preact-iso'

import { Home } from './pages/Home/index.tsx'
import { Editor } from './pages/Editor/index.tsx'
import { NotFound } from './pages/_404.tsx'
import './style.css'

export function App() {
  return (
    <LocationProvider>
      <div className='min-h-screen w-full relative'>
        {/* Dark aqua gradient background */}
        <div
          className='absolute inset-0 z-0'
          style={{
            background:
              'linear-gradient(135deg, #0891b2 0%, #06b6d4 25%, #0891b2 50%, #0e7490 75%, #155e75 100%)',
          }}
        />

        {/* Content */}
        <div className='relative z-10 w-full'>
          {/* Site name */}
          <div className='w-full max-w-6xl mx-auto px-4 pt-8 pb-4'>
            <a
              href='/'
              className='text-2xl font-bold text-white hover:text-cyan-100 transition-colors inline-block'
            >
              MemeZgen
            </a>
          </div>

          {/* Main content */}
          <main className='w-full max-w-6xl mx-auto px-4'>
            <Router>
              <Route path='/' component={Home} />
              <Route path='/editor' component={Editor} />
              <Route default component={NotFound} />
            </Router>
          </main>
        </div>
      </div>
    </LocationProvider>
  )
}

if (typeof window !== 'undefined') {
  hydrate(<App />, document.getElementById('app')!)
}

export async function prerender(_data: unknown) {
  return await ssr(<App />)
}
