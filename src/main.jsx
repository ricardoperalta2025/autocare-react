import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import './admin.css'
import { CarritoProvider } from './context/CarritoContext.jsx'
import SesionConectadaProvider from './context/SesionConectadaProvider.jsx'

createRoot(document.getElementById('root')).render(
<StrictMode>
    <SesionConectadaProvider>
        <CarritoProvider>
            <App />
        </CarritoProvider>
    </SesionConectadaProvider>
</StrictMode>,
)
