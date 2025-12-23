import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
  // Application error handled silently in production
});

// Create and render the React application
const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

const root = createRoot(rootElement)

// Render the main App component with error handling
try {
  root.render(<App />)
} catch (error) {
  // Fallback UI
  rootElement.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
      <p style="color: #6b7280; margin-bottom: 1rem;">
        Sorry, something went wrong while loading the application.
      </p>
      <button
        onclick="window.location.reload()"
        style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        "
      >
        Reload Page
      </button>
    </div>
  `
}
