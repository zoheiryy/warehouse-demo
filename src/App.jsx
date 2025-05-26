import { useState } from 'react'
import TopMenuBar from './components/TopMenuBar'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import SendReceivePage from './pages/SendReceivePage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home') // 'home' or 'send-receive'

  const renderMainContent = () => {
    switch (currentPage) {
      case 'send-receive':
        return <SendReceivePage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="app">
      <TopMenuBar />
      <Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />
      {currentPage === 'send-receive' ? (
        // Full-width layout for SendReceivePage
        <div style={{
          position: 'absolute',
          top: '56px', // Account for TopMenuBar height
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}>
          {renderMainContent()}
        </div>
      ) : (
        // Regular layout for other pages
        <main className="main-content" style={{
          marginInlineStart: '64px', // RTL-aware margin for sidebar space on start side
          transition: 'margin-inline-start 0.3s ease-in-out',
          minHeight: 'calc(100vh - 56px)', // Account for TopMenuBar height
          padding: '20px'
        }}>
          {renderMainContent()}
        </main>
      )}
    </div>
  )
}

export default App

