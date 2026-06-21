import type { Page } from '../App'

const FEATURES = [
  { id: 'yield' as Page, icon: '📈', title: 'מחשבון תשואה', desc: 'חישוב תשואה ברוטו ונטו על נכסים' },
  { id: 'mortgage' as Page, icon: '🏦', title: 'מחשבון משכנתא', desc: 'החזרים חודשיים וסה"כ עלות' },
  { id: 'equity' as Page, icon: '💰', title: 'מחשבון הון עצמי', desc: 'כמה הון עצמי נדרש לרכישה' },
  { id: 'property-value' as Page, icon: '🏠', title: 'הערכת שווי נכס', desc: 'הערכת מחיר לפי אזור ומפרט' },
  { id: 'tax' as Page, icon: '📋', title: 'מחשבון מסים', desc: 'מס רכישה ומס שבח' },
  { id: 'rental-contract' as Page, icon: '📝', title: 'חוזה שכירות', desc: 'ניסוח חוזה שכירות מקצועי' },
  { id: 'sale-contract' as Page, icon: '🤝', title: 'חוזה מכירה', desc: 'ניסוח חוזה מכר מקצועי' },
]

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center py-10">
        {/* Robot Brain SVG */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160" className="drop-shadow-2xl">
              {/* Outer glow ring */}
              <circle cx="80" cy="80" r="75" fill="none" stroke="#C9A84C" strokeWidth="1" strokeOpacity="0.2" />
              <circle cx="80" cy="80" r="65" fill="none" stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.4" />

              {/* Head */}
              <rect x="30" y="35" width="100" height="85" rx="18" fill="#141414" stroke="#C9A84C" strokeWidth="1.5" />

              {/* Brain circuits */}
              <path d="M50 55 Q65 50 75 60 Q85 70 95 55 Q105 45 115 55" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.6" />
              <path d="M45 70 Q60 65 70 75 Q80 85 95 70 Q108 58 118 68" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.6" />
              <path d="M50 88 Q65 82 78 90 Q92 98 108 86" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeOpacity="0.6" />

              {/* Eyes */}
              <rect x="50" y="60" width="22" height="16" rx="5" fill="#0A0A0A" stroke="#C9A84C" strokeWidth="1.5" />
              <rect x="88" y="60" width="22" height="16" rx="5" fill="#0A0A0A" stroke="#C9A84C" strokeWidth="1.5" />
              <circle cx="61" cy="68" r="5" fill="#C9A84C" className="pulse-gold" />
              <circle cx="99" cy="68" r="5" fill="#C9A84C" className="pulse-gold" />
              <circle cx="61" cy="68" r="2" fill="white" />
              <circle cx="99" cy="68" r="2" fill="white" />

              {/* Mouth / smile */}
              <path d="M58 90 Q80 102 102 90" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" />

              {/* Antenna */}
              <line x1="80" y1="35" x2="80" y2="18" stroke="#C9A84C" strokeWidth="1.5" />
              <circle cx="80" cy="14" r="4" fill="#C9A84C" className="pulse-gold" />

              {/* Ears/sides */}
              <rect x="18" y="60" width="14" height="24" rx="5" fill="#141414" stroke="#C9A84C" strokeWidth="1.5" />
              <rect x="128" y="60" width="14" height="24" rx="5" fill="#141414" stroke="#C9A84C" strokeWidth="1.5" />

              {/* Neck */}
              <rect x="65" y="118" width="30" height="14" rx="4" fill="#141414" stroke="#C9A84C" strokeWidth="1" />

              {/* Node dots on circuits */}
              <circle cx="75" cy="60" r="2.5" fill="#C9A84C" />
              <circle cx="95" cy="55" r="2.5" fill="#C9A84C" />
              <circle cx="70" cy="75" r="2.5" fill="#C9A84C" />
              <circle cx="95" cy="70" r="2.5" fill="#C9A84C" />
              <circle cx="78" cy="90" r="2.5" fill="#C9A84C" />
            </svg>

            {/* Spinning ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 rounded-full border border-gold/20 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
          <span className="text-transparent bg-clip-text gold-gradient">BrokerBot</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          הרובוט החכם של המתווך — חישובים, הערכות ועריכת חוזים בשנייה אחת
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'מחשבונים', value: '5' },
          { label: 'סוגי חוזים', value: '2' },
          { label: 'חישוב בשניות', value: '∞' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <div className="text-3xl font-black text-gold">{s.value}</div>
            <div className="text-gray-500 text-sm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">כלים זמינים</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <button
              key={f.id}
              onClick={() => onNavigate(f.id)}
              className="card text-right hover:border-gold/50 hover:glow-gold transition-all group cursor-pointer"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <div className="font-bold text-white group-hover:text-gold transition-colors">{f.title}</div>
              <div className="text-gray-500 text-sm mt-1">{f.desc}</div>
              <div className="mt-4 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                פתח ←
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-gray-600 text-xs pb-4">
        כל החישובים מוצגים לצרכי הדרכה בלבד. יש להתייעץ עם גורמי מקצוע לפני קבלת החלטות פיננסיות.
      </div>
    </div>
  )
}
