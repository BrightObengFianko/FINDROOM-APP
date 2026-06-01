import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function AdminActionMenu({ actions }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const handleAction = (action) => {
    setOpen(false)
    action.onClick?.()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <div className="absolute right-0 top-10 z-20 min-w-[180px] rounded-[18px] border border-slate-200 bg-white p-2 shadow-card">
          {actions.map((action) => (
            <button
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                action.variant === 'danger'
                  ? 'text-rose-600 hover:bg-rose-50'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
              key={action.label}
              onClick={() => handleAction(action)}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default AdminActionMenu
