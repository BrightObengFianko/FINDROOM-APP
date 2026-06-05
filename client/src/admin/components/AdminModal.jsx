import { X } from 'lucide-react'

function AdminModal({
  open,
  title,
  description,
  children,
  icon,
  iconClassName = 'bg-slate-100 text-slate-600',
  primaryActionLabel = 'Confirm',
  secondaryActionLabel = 'Cancel',
  onPrimaryAction,
  onSecondaryAction,
  primaryActionClassName = 'action-button-primary',
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/35 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div className="panel flex w-full max-w-lg max-h-[calc(100dvh-1rem)] flex-col overflow-hidden p-4 shadow-2xl sm:max-h-[calc(100dvh-1.5rem)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {icon ? (
              <div
                aria-hidden="true"
                className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}
              >
                {icon}
              </div>
            ) : null}
            <h2 className="text-xl font-extrabold text-ink">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <button
            aria-label="Close dialog"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
            onClick={onSecondaryAction}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{children}</div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="action-button-secondary w-full justify-center sm:w-auto" onClick={onSecondaryAction} type="button">
            {secondaryActionLabel}
          </button>
          <button className={`${primaryActionClassName} w-full justify-center sm:w-auto`} onClick={onPrimaryAction} type="button">
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminModal
