import type { Page } from '../App'

interface Props { onNavigate: (p: Page) => void }

const CALCS = [
  {
    id: 'yield' as Page,
    title: 'מחשבון תשואה',
    desc: 'חשב תשואה ברוטו ונטו, החזר השקעה ורווח שנתי',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M4 20 L8 13 L13 16 L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="7" r="2.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'mortgage' as Page,
    title: 'מחשבון משכנתא',
    desc: 'החזר חודשי, כדאיות וכמה מהכנסה זה לוקח',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="3" y="7" width="20" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7V5C7 3.9 7.9 3 9 3H17C18.1 3 19 3.9 19 5V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 12h4M7 16h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: 'equity' as Page,
    title: 'הון עצמי',
    desc: 'כמה הון נדרש? מה סך העלויות כולל מסים?',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M13 8v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 13h2M16 13h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'property-value' as Page,
    title: 'הערכת שווי נכס',
    desc: 'מחיר לפי אזור, גודל, קומה ומצב הנכס',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path d="M3 10L13 3l10 7v13H3V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="10" y="15" width="6" height="8" rx="1" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: 'tax' as Page,
    title: 'מחשבון מסים',
    desc: 'מס רכישה לפי מדרגות 2024 ומס שבח',
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <rect x="4" y="3" width="18" height="20" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 8h10M8 12h10M8 16h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function CalcHub({ onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">כלים</div>
        <h1 className="section-title">חישובים מתקדמים</h1>
        <p className="section-sub">כל המחשבונים שלך במקום אחד</p>
      </div>

      <div className="space-y-3">
        {CALCS.map(c => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="card w-full text-right flex items-center gap-4 hover:shadow-gold transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-bronze/10 text-bronze flex items-center justify-center flex-shrink-0 group-hover:bg-bronze group-hover:text-white transition-all">
              {c.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-ink">{c.title}</div>
              <div className="text-ink-muted text-sm mt-0.5">{c.desc}</div>
            </div>
            <div className="text-ink-faint group-hover:text-bronze transition-colors text-lg">←</div>
          </button>
        ))}
      </div>
    </div>
  )
}
