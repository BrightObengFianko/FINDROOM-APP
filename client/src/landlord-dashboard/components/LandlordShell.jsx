import { useState } from 'react'
import LandlordSidebar from './LandlordSidebar'
import LandlordTopbar from './LandlordTopbar'

function LandlordShell({ activePage, children, onSelect }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleSidebarSelect = (pageId) => {
    onSelect(pageId)
    setIsSidebarOpen(false)
  }

  return (
    <div className="ld-dashboard ld-body-shell relative min-h-screen overflow-x-hidden">
      <LandlordSidebar
        activePage={activePage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelect={handleSidebarSelect}
      />

      <main className="min-h-screen px-4 py-5 sm:px-6 xl:ml-[248px] xl:px-8 xl:py-7">
        <div className="mx-auto max-w-[1280px]">
          <LandlordTopbar
            isSidebarOpen={isSidebarOpen}
            onMenuClick={() => setIsSidebarOpen((current) => !current)}
          />
          <div className="ld-content-scroll">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default LandlordShell
