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
      <main className="main-content" style={{
        marginInlineStart: '64px', // RTL-aware margin for sidebar space on start side
        transition: 'margin-inline-start 0.3s ease-in-out',
        minHeight: 'calc(100vh - 56px)', // Account for TopMenuBar height
        padding: currentPage === 'send-receive' ? '0' : '20px' // No padding for send-receive page
      }}>
        {renderMainContent()}
      </main>
    </div>
  )
}

export default App

