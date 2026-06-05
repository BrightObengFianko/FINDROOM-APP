function ListingPreviewPanel({
  image,
  imageAlt,
  title,
  subtitle,
  badge,
  helperText = 'Click a thumbnail to preview it above.',
  emptyTitle = 'Select a listing',
  emptyDescription = 'Click a thumbnail to preview the listing here.',
  children,
  className = '',
  imageClassName = 'h-56',
}) {
  if (!image) {
    return (
      <div
        className={`rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center sm:p-8 ${className}`}
      >
        <p className="text-lg font-bold text-ink">{emptyTitle}</p>
        <p className="mt-2 text-sm text-slate-500">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-[24px] border border-slate-100 bg-white p-4 ${className}`}>
      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-slate-50">
        <img
          alt={imageAlt || title || 'Listing preview'}
          className={`${imageClassName} w-full object-cover`}
          src={image}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {title ? <p className="text-2xl font-extrabold text-ink">{title}</p> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}

      {helperText ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}

export default ListingPreviewPanel
