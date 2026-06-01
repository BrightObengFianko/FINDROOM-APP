import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="section-card text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">Page not found</h1>
      <p className="mt-4 text-sm text-slate-500">
        The page you requested does not exist in this FindRoom build.
      </p>
      <Link className="action-button-primary mt-6" to="/">
        Return home
      </Link>
    </div>
  )
}

export default NotFoundPage
