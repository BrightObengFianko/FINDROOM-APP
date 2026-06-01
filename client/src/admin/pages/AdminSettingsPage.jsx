import { Camera } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import AdminSectionTabs from '../components/AdminSectionTabs'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function SettingsField({ label, type = 'text', ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <input className="field mt-2" type={type} {...props} />
    </label>
  )
}

function SettingsToggle({ checked, description, label, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-[20px] border border-slate-100 px-4 py-4">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <input
        checked={checked}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-200"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
    </label>
  )
}

function AdminSettingsPage() {
  const { workspace, saveSettingsSection } = useAdminWorkspace()
  const { settings } = workspace
  const [activeTab, setActiveTab] = useState('profile')
  const [form, setForm] = useState(settings.profile)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const tabs = useMemo(
    () => [
      { key: 'profile', label: 'Profile' },
      { key: 'platform', label: 'Platform Settings' },
      { key: 'payments', label: 'Payment Settings' },
      { key: 'emails', label: 'Email Settings' },
    ],
    [],
  )

  useEffect(() => {
    setForm(settings[activeTab])
    setError('')
    setSuccess('')
  }, [activeTab, settings])

  const setFieldValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const validateActiveForm = () => {
    if (activeTab === 'profile') {
      if (!form.name?.trim()) {
        return 'Admin name is required.'
      }

      if (!emailPattern.test(form.email || '')) {
        return 'Enter a valid admin email address.'
      }
    }

    if (activeTab === 'platform') {
      if (!form.platformName?.trim()) {
        return 'Platform name is required.'
      }

      if (!emailPattern.test(form.supportEmail || '')) {
        return 'Enter a valid support email address.'
      }

      if (!Number(form.maxListingsPerLandlord) || Number(form.maxListingsPerLandlord) <= 0) {
        return 'Max listings per landlord must be greater than 0.'
      }
    }

    if (activeTab === 'payments') {
      if (!form.currency?.trim()) {
        return 'Currency is required.'
      }

      const payoutDay = Number(form.payoutDay)
      if (!payoutDay || payoutDay < 1 || payoutDay > 31) {
        return 'Payout day must be between 1 and 31.'
      }

      if (!Number(form.minimumPayout) || Number(form.minimumPayout) <= 0) {
        return 'Minimum payout must be greater than 0.'
      }
    }

    if (activeTab === 'emails') {
      if (!form.senderName?.trim()) {
        return 'Sender name is required.'
      }

      if (!emailPattern.test(form.replyTo || '')) {
        return 'Enter a valid reply-to email address.'
      }
    }

    return ''
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationError = validateActiveForm()

    if (validationError) {
      setError(validationError)
      setSuccess('')
      return
    }

    saveSettingsSection(activeTab, form)
    setError('')
    setSuccess('Settings saved successfully.')
  }

  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setFieldValue('avatar', String(reader.result || ''))
    }
    reader.readAsDataURL(file)
  }

  const profileName = activeTab === 'profile' ? form.name : settings.profile.name
  const profileAvatar = activeTab === 'profile' ? form.avatar : settings.profile.avatar
  const initials = (profileName || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AppShell subtitle="Manage admin account details and platform-wide configuration." title="Settings">
      <section className="section-card">
        <AdminSectionTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />

        <form className="mt-5" onSubmit={handleSubmit}>
          {activeTab === 'profile' ? (
            <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
              <div className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5">
                <div className="grid place-items-center">
                  {profileAvatar ? (
                    <img
                      alt={profileName || 'Admin'}
                      className="h-24 w-24 rounded-full object-cover"
                      src={profileAvatar}
                    />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-100 text-2xl font-extrabold text-brand-700">
                      {initials}
                    </div>
                  )}
                </div>

                <button
                  className="action-button-secondary mt-4 w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Camera size={16} />
                  Upload Image
                </button>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  ref={fileInputRef}
                  type="file"
                />

                <p className="mt-4 text-center text-sm text-slate-500">
                  Upload a profile image for the admin account.
                </p>
              </div>

              <div className="grid gap-4">
                <SettingsField
                  label="Name"
                  onChange={(event) => setFieldValue('name', event.target.value)}
                  value={form.name || ''}
                />
                <SettingsField
                  label="Email"
                  onChange={(event) => setFieldValue('email', event.target.value)}
                  type="email"
                  value={form.email || ''}
                />
              </div>
            </div>
          ) : null}

          {activeTab === 'platform' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <SettingsField
                label="Platform Name"
                onChange={(event) => setFieldValue('platformName', event.target.value)}
                value={form.platformName || ''}
              />
              <SettingsField
                label="Support Email"
                onChange={(event) => setFieldValue('supportEmail', event.target.value)}
                type="email"
                value={form.supportEmail || ''}
              />
              <SettingsField
                label="Max Listings Per Landlord"
                onChange={(event) => setFieldValue('maxListingsPerLandlord', event.target.value)}
                type="number"
                value={form.maxListingsPerLandlord || ''}
              />
            </div>
          ) : null}

          {activeTab === 'payments' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-600">Currency</span>
                <select
                  className="field mt-2"
                  onChange={(event) => setFieldValue('currency', event.target.value)}
                  value={form.currency || ''}
                >
                  <option value="GHS">GHS (Ghana cedi)</option>
                </select>
              </label>
              <SettingsField
                label="Payout Day"
                onChange={(event) => setFieldValue('payoutDay', event.target.value)}
                type="number"
                value={form.payoutDay || ''}
              />
              <SettingsField
                label="Minimum Payout"
                onChange={(event) => setFieldValue('minimumPayout', event.target.value)}
                type="number"
                value={form.minimumPayout || ''}
              />
            </div>
          ) : null}

          {activeTab === 'emails' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <SettingsField
                  label="Sender Name"
                  onChange={(event) => setFieldValue('senderName', event.target.value)}
                  value={form.senderName || ''}
                />
                <SettingsField
                  label="Reply To"
                  onChange={(event) => setFieldValue('replyTo', event.target.value)}
                  type="email"
                  value={form.replyTo || ''}
                />
              </div>

              <div className="grid gap-3">
                <SettingsToggle
                  checked={Boolean(form.notifyOnReport)}
                  description="Send email alerts whenever a new user report is submitted."
                  label="Notify On Report"
                  onChange={(value) => setFieldValue('notifyOnReport', value)}
                />
                <SettingsToggle
                  checked={Boolean(form.notifyOnNewLandlord)}
                  description="Send email alerts whenever a landlord verification request is submitted."
                  label="Notify On New Landlord"
                  onChange={(value) => setFieldValue('notifyOnNewLandlord', value)}
                />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {success}
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button className="action-button-primary" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  )
}

export default AdminSettingsPage
