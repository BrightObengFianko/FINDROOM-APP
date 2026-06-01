import LandlordSidebar from './LandlordSidebar'
import LandlordTopbar from './LandlordTopbar'

function LandlordShell({ activePage, children, onSelect }) {
  return (
    <div className="ld-dashboard ld-body-shell min-h-screen">
      <LandlordSidebar activePage={activePage} onSelect={onSelect} />

      <main className="min-h-screen px-4 py-5 sm:px-6 xl:ml-[248px] xl:px-8 xl:py-7">
        <div className="mx-auto max-w-[1280px]">
          <LandlordTopbar />
          <div className="ld-content-scroll">{children}</div>
        </div>
      </main>
    </div>
  )
}

export default LandlordShell
