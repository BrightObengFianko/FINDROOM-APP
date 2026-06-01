import { MessageCircle } from 'lucide-react'
import { footerColumns } from '../../data/landingContent'

function Footer() {
  return (
    <footer className="mt-[25px] grid grid-cols-1 gap-8 border-t border-[#e8edf3] pt-[24px] sm:grid-cols-2 lg:grid-cols-[minmax(0,322px)_minmax(0,202px)_minmax(0,214px)_minmax(0,180px)]">
      <div>
        <div className="text-[23px] font-black uppercase tracking-[0.055em] text-[#0f1728]">
          FindRoom
        </div>

        <p className="mt-[20px] max-w-[250px] text-[13px] leading-[1.8] text-[#475569]">
          Helping you find verified rooms and apartments in the best
          neighborhoods.
        </p>

        <div className="mt-[22px] flex items-center gap-[12px] text-[12px] text-[#64748b]">
          <a href="#">f</a>
          <a href="#">
            <MessageCircle size={14} strokeWidth={2} />
          </a>
          <a className="font-semibold" href="#">
            X
          </a>
          <a className="font-semibold uppercase" href="#">
            in
          </a>
        </div>
      </div>

      {footerColumns.map((column) => (
        <div key={column.title}>
          <h3 className="text-[16px] font-extrabold text-[#0f1728]">{column.title}</h3>
          <div className={`mt-[11px] flex flex-col gap-y-1 text-[12px] leading-[1.9] text-[#64748b] lg:flex-wrap lg:gap-x-0 lg:gap-y-0 ${column.widthClass}`}>
            {column.links.map((link) => (
              <a href="#" key={link}>
                {link}
              </a>
            ))}
          </div>
        </div>
      ))}
    </footer>
  )
}

export default Footer
