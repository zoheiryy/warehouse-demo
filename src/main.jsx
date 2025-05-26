import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@tagaddod-design/react'
import '@tagaddod-design/react/styles';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme="tagaddod" direction="rtl">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
