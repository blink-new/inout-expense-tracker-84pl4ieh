import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'inout-expense-tracker-84pl4ieh',
  authRequired: true
})

// Suppress analytics errors in console
const originalConsoleError = console.error
console.error = (...args) => {
  // Filter out analytics-related errors to reduce noise
  const message = args[0]?.toString() || ''
  if (message.includes('Failed to send analytics events') || 
      message.includes('BlinkNetworkError')) {
    return // Silently ignore analytics errors
  }
  originalConsoleError.apply(console, args)
}