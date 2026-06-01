import { Search, SendHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

const formatMessageTime = (value) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))

const formatMessageDate = (value) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))

function AdminMessagesPage() {
  const { conversations, sendConversationReply } = useAdminWorkspace()
  const [query, setQuery] = useState('')
  const [selectedConversationId, setSelectedConversationId] = useState('')
  const [draft, setDraft] = useState('')
  const [composerError, setComposerError] = useState('')

  const filteredConversations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return conversations.filter((conversation) => {
      const lastMessage = conversation.messages[conversation.messages.length - 1]?.text || ''
      return (
        !normalizedQuery ||
        `${conversation.participantName} ${conversation.participantRole} ${conversation.listingTitle} ${lastMessage}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    })
  }, [conversations, query])

  useEffect(() => {
    if (!filteredConversations.length) {
      setSelectedConversationId('')
      return
    }

    if (!filteredConversations.some((conversation) => conversation.id === selectedConversationId)) {
      setSelectedConversationId(filteredConversations[0].id)
    }
  }, [filteredConversations, selectedConversationId])

  const activeConversation =
    filteredConversations.find((conversation) => conversation.id === selectedConversationId) ||
    filteredConversations[0] ||
    null

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!activeConversation) {
      return
    }

    const didSend = sendConversationReply(activeConversation.id, draft)

    if (!didSend) {
      setComposerError('Type a message before sending.')
      return
    }

    setDraft('')
    setComposerError('')
  }

  return (
    <AppShell
      subtitle="Monitor renter and landlord conversations from one admin inbox."
      title="Messages"
    >
      <section className="section-card">
        <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="min-w-0 xl:border-r xl:border-slate-100 xl:pr-5">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className="field pl-11"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search messages..."
                value={query}
              />
            </label>

            <div className="mt-4 space-y-2">
              {filteredConversations.map((conversation) => {
                const lastMessage = conversation.messages[conversation.messages.length - 1]
                const isActive = activeConversation?.id === conversation.id

                return (
                  <button
                    className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
                      isActive
                        ? 'border-brand-200 bg-brand-50/80'
                        : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60'
                    }`}
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                    type="button"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        alt={conversation.participantName}
                        className="h-11 w-11 rounded-full object-cover"
                        src={conversation.avatar}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {conversation.participantName}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                              {conversation.participantRole}
                            </p>
                          </div>
                          <p className="shrink-0 text-xs text-slate-400">
                            {formatMessageDate(lastMessage?.createdAt)}
                          </p>
                        </div>

                        <p className="mt-2 truncate text-sm font-medium text-slate-500">
                          {conversation.listingTitle}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {lastMessage?.text || 'No messages yet'}
                        </p>

                        {conversation.unreadCount ? (
                          <div className="mt-3 inline-flex rounded-full bg-brand-500 px-2.5 py-1 text-[11px] font-bold text-white">
                            {conversation.unreadCount} unread
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0">
            {activeConversation ? (
              <div className="flex min-h-[620px] flex-col rounded-[24px] border border-slate-100 bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      alt={activeConversation.participantName}
                      className="h-12 w-12 rounded-full object-cover"
                      src={activeConversation.avatar}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">
                        {activeConversation.participantName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activeConversation.participantRole} - {activeConversation.listingTitle}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                    Admin chat
                  </div>
                </div>

                <div className="flex-1 space-y-4 bg-slate-50/50 px-4 py-5 sm:px-5">
                  {activeConversation.messages.map((message) => {
                    const isAdminMessage = message.sender === 'admin'

                    return (
                      <div
                        className={`max-w-[88%] rounded-[20px] px-4 py-3 shadow-soft sm:max-w-[70%] ${
                          isAdminMessage
                            ? 'ml-auto bg-brand-500 text-white'
                            : 'bg-white text-slate-700'
                        }`}
                        key={message.id}
                      >
                        <p className="text-sm leading-6">{message.text}</p>
                        <p
                          className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                            isAdminMessage ? 'text-brand-100' : 'text-slate-400'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <form className="border-t border-slate-100 px-4 py-4 sm:px-5" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      className="field flex-1"
                      onChange={(event) => {
                        setDraft(event.target.value)
                        if (composerError) {
                          setComposerError('')
                        }
                      }}
                      placeholder="Type a reply..."
                      value={draft}
                    />
                    <button className="action-button-primary justify-center sm:min-w-[120px]" type="submit">
                      <SendHorizontal size={16} />
                      Send
                    </button>
                  </div>

                  {composerError ? (
                    <div className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {composerError}
                    </div>
                  ) : null}
                </form>
              </div>
            ) : (
              <div className="grid min-h-[620px] place-items-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
                <div>
                  <p className="text-lg font-bold text-ink">No conversations found</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Messages that match your search will appear here.
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

export default AdminMessagesPage
