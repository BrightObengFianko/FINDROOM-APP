import { SendHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

function MessagesPage() {
  const { sendMessage, threads, userMap } = useAppData()
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const [selectedThreadId, setSelectedThreadId] = useState('')

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (first, second) =>
          new Date(second.lastMessageAt).valueOf() - new Date(first.lastMessageAt).valueOf(),
      ),
    [threads],
  )

  const activeThread =
    sortedThreads.find((thread) => thread.id === selectedThreadId) || sortedThreads[0]

  const participantLabel = (thread) => {
    if (user.role === 'admin') {
      return `${userMap[thread.userId]?.name || 'User'} / ${userMap[thread.landlordId]?.name || 'Landlord'}`
    }

    return user.role === 'landlord'
      ? userMap[thread.userId]?.name
      : userMap[thread.landlordId]?.name
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!activeThread || user.role === 'admin' || !draft.trim()) {
      return
    }

    await sendMessage({
      roomId: activeThread.roomId,
      recipientId: user.role === 'landlord' ? activeThread.userId : activeThread.landlordId,
      text: draft,
    })
    setDraft('')
  }

  return (
    <AppShell title="Messages" subtitle="Keep your renter and landlord conversations in one place.">
      <section className="section-card">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-r border-slate-100 pr-0 xl:pr-4">
            <input className="field" placeholder="Search messages..." />
            <div className="mt-4 space-y-2">
              {sortedThreads.map((thread) => (
                <button
                  className={`w-full rounded-[18px] border px-3 py-3 text-left ${
                    activeThread?.id === thread.id
                      ? 'border-brand-200 bg-brand-50'
                      : 'border-slate-100 bg-white'
                  }`}
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  type="button"
                >
                  <p className="font-semibold text-ink">{participantLabel(thread)}</p>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {thread.messages[thread.messages.length - 1]?.text}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[520px] flex-col">
            {activeThread ? (
              <>
                <div className="border-b border-slate-100 pb-4">
                  <p className="font-semibold text-ink">{participantLabel(activeThread)}</p>
                  <p className="mt-1 text-sm text-slate-500">Chat</p>
                </div>

                <div className="flex-1 space-y-3 py-5">
                  {activeThread.messages.map((message) => {
                    const mine = message.senderId === user.id
                    return (
                      <div
                        className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-6 ${
                          mine
                            ? 'ml-auto bg-brand-500 text-white'
                            : 'bg-slate-50 text-slate-700'
                        }`}
                        key={message.id}
                      >
                        {message.text}
                      </div>
                    )
                  })}
                </div>

                {user.role === 'admin' ? (
                  <div className="rounded-[18px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Admin mode is read-only in this chat view.
                  </div>
                ) : (
                  <form className="flex gap-3 border-t border-slate-100 pt-4" onSubmit={handleSubmit}>
                    <input
                      className="field flex-1"
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Type a message..."
                      value={draft}
                    />
                    <button className="action-button-primary" type="submit">
                      <SendHorizontal size={16} />
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="grid flex-1 place-items-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <div>
                  <p className="text-lg font-bold text-ink">No conversations yet</p>
                  <p className="mt-2 text-sm text-slate-500">
                    When guests or landlords start a conversation, it will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default MessagesPage
