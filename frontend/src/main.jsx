import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import "leaflet/dist/leaflet.css"
import App from './App.jsx'
import { AuthProvider } from '@/store/AuthProvider'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <App />

      <Toaster
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "bg-card border-primary/30 text-card-foreground shadow-xl",
            description:
              "text-muted-foreground",
            success:
              "border-primary/40 bg-primary/5",
            error:
              "border-destructive/40 bg-destructive/5",
          },
        }}
      />

    </AuthProvider>
  </BrowserRouter>
  // </StrictMode>,
)
