import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'inout-expense-tracker-84pl4ieh',
  authRequired: true
})

// Disable analytics to prevent network errors
// Analytics can be re-enabled later when network issues are resolved
if (blink.analytics && typeof blink.analytics.disable === 'function') {
  blink.analytics.disable()
}

// Comprehensive error suppression for analytics-related issues
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

console.error = (...args) => {
  const message = args[0]?.toString() || ''
  // Filter out all analytics and network-related errors
  if (message.includes('Failed to send analytics events') || 
      message.includes('BlinkNetworkError') ||
      message.includes('analytics') ||
      message.includes('NetworkError when attempting to fetch resource')) {
    return // Silently ignore these errors
  }
  originalConsoleError.apply(console, args)
}

console.warn = (...args) => {
  const message = args[0]?.toString() || ''
  // Filter out analytics warnings too
  if (message.includes('analytics') || 
      message.includes('BlinkNetworkError')) {
    return // Silently ignore these warnings
  }
  originalConsoleWarn.apply(console, args)
}