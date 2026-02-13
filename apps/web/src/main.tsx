import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { Toaster } from '@repo/ui'
import './style.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <Toaster />
    <App />
  </StrictMode>
)
