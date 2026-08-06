import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {Provider} from '@/components/ui/provider.jsx'
import App from './App.jsx'
import { LanguageProvider } from './contexts/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider>
      <LanguageProvider><App /></LanguageProvider>
    </Provider>
  </StrictMode>,
)
