import { MoreVertical, Paperclip, Search, SendHorizontal } from 'lucide-react'
import LandlordSectionCard from '../components/LandlordSectionCard'
import { chatMessages, conversations } from '../data'

function LandlordMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#111827]">Messages</h1>
        <p className="mt-1 text-[14px] text-[#64748b]">Communicate with your guests.</p>
      </div>

      <LandlordSectionCard className="overflow-hidden p-0">
        <div className="grid min-h-[640px] xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-b border-[#edf2f7] bg-[#fbfcfb] p-4 xl:border-b-0 xl:border-r">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
                size={16}
              />
              <input
                className="field h-11 rounded-[12px] border-[#e8edf1] pl-11"
                placeholder="Search conversations..."
              />
            </div>

            <div className="mt-4 space-y-2">
              {conversations.map((conversation) => (
                <button
                  className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left transition ${
                    conversation.active
                      ? 'bg-[#ecf8ee] shadow-[inset_0_0_0_1px_rgba(36,150,63,0.08)]'
                      : 'hover:bg-white'
                  }`}
                  key={conversation.id}
                  type="button"
                >
                  <img
                    alt={conversation.name}
                    className="h-11 w-11 rounded-full object-cover"
                    src={conversation.avatar}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[13px] font-semibold text-[#111827]">
                        {conversation.name}
                      </p>
                      <span className="text-[11px] text-[#94a3b8]">{conversation.time}</span>
                    </div>
                    <p className="mt-1 truncate text-[12px] text-[#64748b]">
                      {conversation.preview}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="flex min-h-[640px] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#edf2f7] px-6 py-5">
              <div className="flex items-center gap-3">
                <img
                  alt="Mary Johnson"
                  className="h-11 w-11 rounded-full object-cover"
                  src={conversations[0].avatar}
                />
                <div>
                  <p className="text-[15px] font-semibold text-[#111827]">Mary Johnson</p>
                  <p className="mt-0.5 text-[12px] text-[#24963f]">Online</p>
                </div>
              </div>

              <button className="text-[#64748b]" type="button">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="relative flex-1 overflow-hidden px-6 py-6">
              <div className="absolute inset-x-0 bottom-0 h-12 ld-message-fade" />
              <div className="relative space-y-4">
                {chatMessages.map((message) => (
                  <div
                    className={`flex ${message.mine ? 'justify-end' : 'justify-start'}`}
                    key={message.id}
                  >
                    <div
                      className={`max-w-[72%] rounded-[18px] px-4 py-3 ${
                        message.mine
                          ? 'rounded-br-[8px] bg-[#edf9ef] text-[#1f7f36]'
                          : 'rounded-bl-[8px] bg-[#f8fafc] text-[#334155]'
                      }`}
                    >
                      <p className="text-[13px] leading-6">{message.text}</p>
                      <p
                        className={`mt-1 text-right text-[11px] ${
                          message.mine ? 'text-[#24963f]' : 'text-[#94a3b8]'
                        }`}
                      >
                        {message.time}
                        {message.mine ? '  Sent' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#edf2f7] px-6 py-4">
              <div className="flex items-center gap-3 rounded-[14px] border border-[#e2e8f0] px-3 py-2">
                <button className="text-[#64748b]" type="button">
                  <Paperclip size={18} />
                </button>
                <input
                  className="h-10 flex-1 border-0 bg-transparent text-[13px] text-[#111827] outline-none"
                  placeholder="Type your message..."
                />
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#23933d] text-white"
                  type="button"
                >
                  <SendHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordMessagesPage
