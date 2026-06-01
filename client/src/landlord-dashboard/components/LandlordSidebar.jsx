import {
  CalendarDays,
  CircleUserRound,
  House,
  LayoutDashboard,
  LogOut,
  Mail,
  PlusSquare,
  Settings,
  Wallet,
} from 'lucide-react'

const primaryItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-listing', label: 'Add New Listing', icon: PlusSquare },
  { id: 'my-listings', label: 'My Listings', icon: House },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
]

const secondaryItems = [
  { id: 'profile', label: 'Profile', icon: CircleUserRound },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const footerItems = [{ id: 'logout', label: 'Logout', icon: LogOut }]

function SidebarLink({ active, icon: Icon, label, onClick }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
        active
          ? 'bg-[#ecf8ee] text-[#23933d] shadow-[inset_0_0_0_1px_rgba(36,150,63,0.08)]'
          : 'text-[#475569] hover:bg-[#f6faf7]'
      }`}
      onClick={onClick}
      type="button"
    >
      <Icon size={17} strokeWidth={2.1} />
      <span>{label}</span>
    </button>
  )
}

function LandlordSidebar({ activePage, onSelect }) {
  return (
    <aside className="ld-sidebar-scroll fixed left-0 top-0 z-20 hidden h-screen w-[248px] overflow-y-auto border-r border-[#e8edf1] bg-white px-5 py-7 xl:block">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] bg-[#eff9ef] text-[#24963f]">
          <House size={24} strokeWidth={2.3} />
        </div>
        <div>
          <p className="text-[20px] font-bold tracking-[-0.03em] text-[#111827]">StayNest</p>
        </div>
      </div>

      <nav className="mt-9 space-y-1.5">
        {primaryItems.map((item) => (
          <SidebarLink
            active={activePage === item.id}
            icon={item.icon}
            key={item.id}
            label={item.label}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </nav>

      <div className="mt-8 border-t border-[#edf2f7] pt-8">
        <div className="space-y-1.5">
          {secondaryItems.map((item) => (
            <SidebarLink
              active={activePage === item.id}
              icon={item.icon}
              key={item.id}
              label={item.label}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-[#edf2f7] pt-8">
        {footerItems.map((item) => (
          <SidebarLink
            active={activePage === item.id}
            icon={item.icon}
            key={item.id}
            label={item.label}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </aside>
  )
}

export default LandlordSidebar
