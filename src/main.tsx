import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global error handler for unhandled analytics errors
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason
  if (error && typeof error === 'object') {
    const message = error.message || error.toString()
    if (message.includes('analytics') || 
        message.includes('BlinkNetworkError') ||
        message.includes('NetworkError when attempting to fetch resource')) {
      event.preventDefault() // Prevent the error from being logged
      return
    }
  }
})

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  const message = event.message || ''
  if (message.includes('analytics') || 
      message.includes('BlinkNetworkError') ||
      message.includes('NetworkError when attempting to fetch resource')) {
    event.preventDefault() // Prevent the error from being logged
    return
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 