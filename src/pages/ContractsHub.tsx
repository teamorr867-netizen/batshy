import type { Page } from '../App'

interface Props { onNavigate: (p: Page) => void }

const CONTRACTS = [
  {
    id: 'rental-contract' as Page,
    title: 'חוזה שכירות',
    desc: 'הפק חוזה שכירות מלא עם כל הפרטים הנדרשים, מוכן להדפסה ולחתימה',
    badge: 'נפוץ',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect x="5" y="3" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M9 9h12M9 13h12M9 17h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M18 21l2.5-1.2 3.5-3.5-1.8-1.8-3.5 3.5-1.2 2.5 0.5 0.5z" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    id: 'sale-contract' as Page,
    title: 'חוזה מכירה',
    desc: 'הפק חוזה מכירת נכס מלא עם תנאי תשלום, מועדי מסירה ותניות',
    badge: '',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M5 12L15 4l10 8v14H5V12z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <rect x="11" y="18" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M18 10l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function ContractsHub({ onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מסמכים</div>
        <h1 className="section-title">חוזים ומסמכים</h1>
        <p className="section-sub">הפק חוזים מקצועיים בדקות</p>
      </div>

      <div className="space-y-4">
        {CONTRACTS.map(c => (
          <button
            key={c.id}
            onClick={() => onNavigate(c.id)}
            className="card w-full text-right flex items-start gap-4 hover:shadow-gold transition-all group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-bronze/10 text-bronze flex items-center justify-center flex-shrink-0 group-hover:bg-bronze group-hover:text-white transition-all">
              {c.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink text-lg">{c.title}</span>
                {c.badge && (
                  <span className="text-xs bg-bronze/10 text-bronze px-2 py-0.5 rounded-full font-medium">{c.badge}</span>
                )}
              </div>
              <div className="text-ink-muted text-sm mt-1 leading-relaxed">{c.desc}</div>
            </div>
            <div className="text-2xl text-ink-faint group-hover:text-bronze transition-colors mt-1">←</div>
          </button>
        ))}
      </div>

      <div className="card-flat text-sm text-ink-muted leading-relaxed">
        ⚠️ החוזים מיועדים כנקודת התחלה בלבד. מומלץ להיוועץ בעורך דין לפני חתימה.
      </div>
    </div>
  )
}
