function AdminSectionTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            activeTab === tab.key
              ? 'bg-brand-500 text-white'
              : 'bg-slate-50 text-slate-500 hover:bg-brand-50 hover:text-brand-700'
          }`}
          key={tab.key}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
          {typeof tab.count === 'number' ? ` (${tab.count})` : ''}
        </button>
      ))}
    </div>
  )
}

export default AdminSectionTabs
