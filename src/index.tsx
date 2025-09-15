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
      <main>
        <Router>
          <Route path='/' component={Home} />
          <Route path='/editor' component={Editor} />
          <Route default component={NotFound} />
        </Router>
      </main>
    </LocationProvider>
  )
}

if (typeof window !== 'undefined') {
  hydrate(<App />, document.getElementById('app')!)
}

export async function prerender(_data: unknown) {
  return await ssr(<App />)
}
