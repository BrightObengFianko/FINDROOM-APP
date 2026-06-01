import { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatUserRoles } from '../utils/roles'

function ProfilePage() {
  const { updateProfile } = useAppData()
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const previewUrl = useMemo(
    () => (avatarFile ? URL.createObjectURL(avatarFile) : user.avatar),
    [avatarFile, user.avatar],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    await updateProfile({ ...form, avatarFile })
    setAvatarFile(null)
  }

  return (
    <AppShell title="My Profile" subtitle="Update your personal details and profile photo.">
      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <article className="section-card">
          <img alt={user.name} className="h-28 w-28 rounded-full object-cover" src={previewUrl} />
          <p className="mt-4 text-xl font-extrabold text-ink">{user.name}</p>
          <p className="mt-1 text-sm text-slate-500">{formatUserRoles(user)}</p>

          <label className="mt-5 block text-sm font-semibold text-slate-600">
            Change photo
            <input
              className="field mt-2"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
              type="file"
            />
          </label>
        </article>

        <article className="section-card">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-slate-600">
              Full name
              <input
                className="field mt-2"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                value={form.name}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-600">
              Email
              <input
                className="field mt-2"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                value={form.email}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-600">
              Phone
              <input
                className="field mt-2"
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                value={form.phone}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-600">
              Location
              <input className="field mt-2" defaultValue="Accra, Ghana" />
            </label>

            <label className="block text-sm font-semibold text-slate-600 md:col-span-2">
              Bio
              <textarea
                className="field mt-2 min-h-32"
                onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                value={form.bio}
              />
            </label>

            <div className="md:col-span-2">
              <button className="action-button-primary" type="submit">
                Save Changes
              </button>
            </div>
          </form>
        </article>
      </section>
    </AppShell>
  )
}

export default ProfilePage
