import { MoreHorizontal } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

const VIEWPORT_MARGIN = 8
const MIN_MENU_WIDTH = 192

const mergeClassNames = (...classNames) => classNames.filter(Boolean).join(' ')

const defaultTriggerClassName =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700'

const defaultItemClassName =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

function GlobalDropdown({
  items = [],
  actions = [],
  triggerAriaLabel = 'Open actions menu',
  triggerClassName = '',
  triggerIcon = <MoreHorizontal size={16} />,
  menuClassName = '',
  itemClassName = '',
}) {
  const safeItems = useMemo(
    () => (items.length ? items : actions).filter(Boolean),
    [actions, items],
  )
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  const closeMenu = () => setOpen(false)

  const positionMenu = useCallback(() => {
    if (!triggerRef.current || !menuRef.current || !isBrowser) {
      return
    }

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const menuEl = menuRef.current
    const menuRect = menuEl.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    const menuWidth = Math.min(
      Math.max(menuRect.width || MIN_MENU_WIDTH, triggerRect.width, MIN_MENU_WIDTH),
      Math.max(MIN_MENU_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2),
    )

    const maxHeight = Math.max(160, viewportHeight - VIEWPORT_MARGIN * 2)
    const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_MARGIN
    const spaceAbove = triggerRect.top - VIEWPORT_MARGIN
    const openUpward = spaceBelow < menuRect.height && spaceAbove > spaceBelow

    let top = openUpward
      ? triggerRect.top - menuRect.height - VIEWPORT_MARGIN
      : triggerRect.bottom + VIEWPORT_MARGIN

    top = Math.min(Math.max(top, VIEWPORT_MARGIN), viewportHeight - VIEWPORT_MARGIN)

    let left = triggerRect.right - menuWidth

    if (left + menuWidth > viewportWidth - VIEWPORT_MARGIN) {
      left = viewportWidth - menuWidth - VIEWPORT_MARGIN
    }

    if (left < VIEWPORT_MARGIN) {
      left = triggerRect.left
    }

    left = Math.min(Math.max(left, VIEWPORT_MARGIN), viewportWidth - menuWidth - VIEWPORT_MARGIN)

    menuEl.dataset.placement = openUpward ? 'top' : 'bottom'
    menuEl.style.left = `${left}px`
    menuEl.style.maxHeight = `${maxHeight}px`
    menuEl.style.top = `${top}px`
    menuEl.style.visibility = 'visible'
    menuEl.style.width = `${menuWidth}px`
    menuEl.style.opacity = '1'
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      return undefined
    }

    const frame = window.requestAnimationFrame(() => {
      positionMenu()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [open, positionMenu, safeItems.length])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    const handlePointerDown = (event) => {
      const target = event.target

      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }

      closeMenu()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    const handleViewportChange = () => {
      positionMenu()
    }

    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('resize', handleViewportChange)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleViewportChange, true)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [open, positionMenu])

  const handleTriggerClick = () => {
    setOpen((current) => !current)
  }

  const handleItemClick = (item) => {
    if (item.disabled) {
      return
    }

    if (item.closeOnSelect !== false) {
      closeMenu()
    }

    item.onClick?.()
  }

  if (!safeItems.length) {
    return (
      <button
        aria-label={triggerAriaLabel}
        className={mergeClassNames(defaultTriggerClassName, triggerClassName)}
        ref={triggerRef}
        type="button"
      >
        {triggerIcon}
      </button>
    )
  }

  const menuNode =
    open && isBrowser
      ? createPortal(
          <div
            aria-label={triggerAriaLabel}
            className={mergeClassNames(
              'fixed z-[9999] overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] opacity-0 data-[placement=top]:origin-bottom-right data-[placement=bottom]:origin-top-right',
              menuClassName,
            )}
            ref={menuRef}
            role="menu"
            data-placement="bottom"
            style={{
              left: '-9999px',
              maxHeight: `calc(100vh - ${VIEWPORT_MARGIN * 2}px)`,
              top: '-9999px',
              visibility: 'hidden',
              width: MIN_MENU_WIDTH,
            }}
          >
            {safeItems.map((item) => {
              const isDanger = item.variant === 'danger'
              const itemClasses = mergeClassNames(
                defaultItemClassName,
                item.disabled
                  ? 'cursor-not-allowed text-slate-300'
                  : isDanger
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800',
                itemClassName,
                item.className,
              )

              return (
                <button
                  aria-disabled={item.disabled || undefined}
                  className={itemClasses}
                  disabled={item.disabled}
                  key={item.key || item.label}
                  onClick={() => handleItemClick(item)}
                  role="menuitem"
                  type="button"
                >
                  {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                  <span className="min-w-0 flex-1">{item.label}</span>
                </button>
              )
            })}
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={triggerAriaLabel}
        className={mergeClassNames(defaultTriggerClassName, triggerClassName)}
        onClick={handleTriggerClick}
        ref={triggerRef}
        type="button"
      >
        {triggerIcon}
      </button>
      {menuNode}
    </>
  )
}

export default GlobalDropdown
