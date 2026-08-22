import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { getRouter } from './router'
import './styles.css'
import './components/dot-matrix.css'

const router = getRouter()
const rootElement = document.getElementById('root')

if (rootElement) {
  // Вызываем createRoot без условий
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}