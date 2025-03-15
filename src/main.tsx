
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Mounting app to root element");
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found");
} else {
  console.log("Root element found, rendering app");
  
  // Add error boundary
  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);
  });
  
  // Debug sidebar component
  console.log("Available components:", { 
    App: typeof App,
    rootElement
  });
  
  createRoot(rootElement).render(<App />);
  console.log("App rendered to DOM");
}
