function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
}) {
  const titleClass =
    tone === 'light'
      ? 'mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl'
      : 'mt-2 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'

  const copyClass =
    tone === 'light' ? 'mt-3 text-sm leading-6 text-slate-300 sm:text-[15px]' : 'subtle-copy mt-3'

  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className={titleClass}>{title}</h2>
      {description ? <p className={copyClass}>{description}</p> : null}
    </div>
  )
}

export default SectionHeading
