import type { Page } from '../App'

const FEATURES = [
  {
    id: 'yield' as Page,
    icon: '↗',
    title: 'מחשבון תשואה',
    sub: 'חישוב תשואה ברוטו ונטו',
  },
  {
    id: 'mortgage' as Page,
    icon: '⬡',
    title: 'מחשבון משכנתא',
    sub: 'החזרים חודשיים ועלות כוללת',
  },
  {
    id: 'equity' as Page,
    icon: '◈',
    title: 'הון עצמי',
    sub: 'כמה נדרש לרכישה',
  },
  {
    id: 'property-value' as Page,
    icon: '⌂',
    title: 'הערכת שווי',
    sub: 'ממוצע מחירים לפי אזור',
  },
  {
    id: 'tax' as Page,
    icon: '◻',
    title: 'מחשבון מסים',
    sub: 'מס רכישה ומס שבח',
  },
]

const BUBBLES = [
  {
    id: 'yield' as Page,
    icon: '⬡',
    title: 'חישובים מתקדמים',
    desc: 'תן לנו לחשב בשבילך — תשואות, מיסים, מימון, השוואות וניתוחי עסקה.',
  },
  {
    id: 'rental-contract' as Page,
    icon: '✍',
    title: 'חוזים ומסמכים',
    desc: 'תן לנו להכין ולנהל — חוזים מוכנים, מסמכים, תבניות וחתימות.',
  },
  {
    id: 'property-value' as Page,
    icon: '⌂',
    title: 'הערכת נכסים',
    desc: 'תן לנו לנתח עבורך — שוויים, מגמות שוק ונתוני אזור.',
  },
]

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-10">

      {/* ── Hero ── */}
      <div className="fade-up">
        {/* Robot illustration */}
        <div className="relative overflow-hidden rounded-3xl bg-cream-light mb-6" style={{ minHeight: 260 }}>
          {/* Background building lines */}
          <svg className="absolute left-0 bottom-0 opacity-10" width="200" height="220" viewBox="0 0 200 220">
            <rect x="30" y="60" width="60" height="160" fill="none" stroke="#B8956A" strokeWidth="1.5"/>
            <rect x="40" y="70" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="60" y="70" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="40" y="94" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="60" y="94" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="40" y="118" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="60" y="118" width="10" height="14" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="100" y="100" width="80" height="120" fill="none" stroke="#B8956A" strokeWidth="1.5"/>
            <rect x="112" y="112" width="12" height="18" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="134" y="112" width="12" height="18" fill="none" stroke="#B8956A" strokeWidth="1"/>
            <rect x="156" y="112" width="12" height="18" fill="none" stroke="#B8956A" strokeWidth="1"/>
          </svg>

          {/* Robot SVG */}
          <div className="flex justify-center pt-8 pb-4 relative">
            <svg width="140" height="180" viewBox="0 0 140 180">
              {/* Body */}
              <rect x="35" y="90" width="70" height="70" rx="12" fill="#F0EBE4" stroke="#D4B896" strokeWidth="1.5"/>
              {/* Chest panel */}
              <rect x="48" y="104" width="44" height="28" rx="6" fill="#EAE4DC" stroke="#C4A480" strokeWidth="1"/>
              {/* Chest dots */}
              <circle cx="58" cy="115" r="3" fill="#B8956A"/>
              <circle cx="70" cy="115" r="3" fill="#B8956A" className="pulse-bronze"/>
              <circle cx="82" cy="115" r="3" fill="#B8956A"/>
              {/* Arms */}
              <rect x="14" y="95" width="22" height="44" rx="10" fill="#F0EBE4" stroke="#D4B896" strokeWidth="1.5"/>
              <rect x="104" y="95" width="22" height="44" rx="10" fill="#F0EBE4" stroke="#D4B896" strokeWidth="1.5"/>
              {/* Hand pointing */}
              <ellipse cx="25" cy="145" rx="8" ry="5" fill="#E8E2DA" stroke="#D4B896" strokeWidth="1"/>
              {/* Legs */}
              <rect x="48" y="158" width="18" height="18" rx="6" fill="#E8E2DA" stroke="#D4B896" strokeWidth="1.5"/>
              <rect x="74" y="158" width="18" height="18" rx="6" fill="#E8E2DA" stroke="#D4B896" strokeWidth="1.5"/>

              {/* Head */}
              <rect x="28" y="32" width="84" height="62" rx="18" fill="#F5F0EB" stroke="#D4B896" strokeWidth="1.5"/>
              {/* Eyes */}
              <rect x="42" y="46" width="22" height="16" rx="6" fill="#EAE4DC" stroke="#C4A480" strokeWidth="1.5"/>
              <rect x="76" y="46" width="22" height="16" rx="6" fill="#EAE4DC" stroke="#C4A480" strokeWidth="1.5"/>
              <circle cx="53" cy="54" r="5" fill="#B8956A"/>
              <circle cx="87" cy="54" r="5" fill="#B8956A" className="pulse-bronze"/>
              <circle cx="53" cy="54" r="2" fill="white"/>
              <circle cx="87" cy="54" r="2" fill="white"/>
              {/* Mouth */}
              <path d="M50 76 Q70 86 90 76" fill="none" stroke="#C4A480" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Antenna */}
              <line x1="70" y1="32" x2="70" y2="16" stroke="#D4B896" strokeWidth="1.5"/>
              <circle cx="70" cy="12" r="4" fill="#B8956A" className="pulse-bronze"/>
              {/* Ears */}
              <rect x="14" y="52" width="16" height="22" rx="6" fill="#F0EBE4" stroke="#D4B896" strokeWidth="1.5"/>
              <rect x="110" y="52" width="16" height="22" rx="6" fill="#F0EBE4" stroke="#D4B896" strokeWidth="1.5"/>
              {/* Neck */}
              <rect x="58" y="92" width="24" height="12" rx="4" fill="#EAE4DC" stroke="#D4B896" strokeWidth="1"/>
              {/* Floating hologram lines from hand */}
              <line x1="36" y1="135" x2="8" y2="120" stroke="#B8956A" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="4 3"/>
              <rect x="0" y="108" width="30" height="20" rx="4" fill="none" stroke="#B8956A" strokeWidth="0.8" strokeOpacity="0.4"/>
              <line x1="4" y1="115" x2="26" y2="115" stroke="#B8956A" strokeWidth="0.6" strokeOpacity="0.4"/>
              <line x1="4" y1="120" x2="20" y2="120" stroke="#B8956A" strokeWidth="0.6" strokeOpacity="0.4"/>
            </svg>
          </div>

          {/* Star decoration */}
          <div className="absolute top-5 right-1/2 translate-x-1/2 text-bronze text-2xl">✦</div>
        </div>

        {/* Brand */}
        <div className="text-center mb-2">
          <div className="focus-logo text-4xl tracking-[0.3em] mb-3">FOCUS</div>
          <p className="text-ink-muted text-sm leading-relaxed max-w-xs mx-auto">
            Focus on your genius.<br />We'll handle the rest.
          </p>
        </div>
      </div>

      {/* ── Tagline card ── */}
      <div className="card fade-up-1">
        <div className="text-center">
          <div className="text-bronze text-xs font-bold tracking-widest uppercase mb-3">אנחנו דואגים לכל מה שבאחורה</div>
          <div className="text-ink-muted text-sm">כדי שאתה תתמקד במה שחשוב באמת</div>

          {/* Feature icons */}
          <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
            {[
              { icon: '⌂', label: 'הערכת\nנכסים' },
              { icon: '⬡', label: 'חישובים\nמתקדמים' },
              { icon: '✍', label: 'חוזים\nומסמכים' },
            ].map(f => (
              <div key={f.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-cream-light flex items-center justify-center text-bronze text-xl border border-cream-dark">
                  {f.icon}
                </div>
                <div className="text-xs text-ink-muted whitespace-pre-line text-center leading-tight">{f.label}</div>
              </div>
            ))}
          </div>

          <button
            className="btn-bronze w-full flex items-center justify-center gap-2"
            onClick={() => onNavigate('yield')}
          >
            <span>✦</span>
            <span>תן לנו לעשות לך את זה</span>
          </button>
        </div>
      </div>

      {/* ── Connected bubbles ── */}
      <div className="card fade-up-2">
        <div className="text-center mb-6">
          <div className="section-title">כל מה שאתה צריך – במקום אחד</div>
          <div className="text-ink-muted text-sm">אנחנו פה כדי לפשט, לייעל ולבצע עבורך.</div>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute top-8 bottom-8 right-8 w-px bg-bronze/20" />

          <div className="space-y-6">
            {BUBBLES.map((b, i) => (
              <button
                key={b.id}
                onClick={() => onNavigate(b.id)}
                className="w-full flex items-start gap-4 group"
              >
                {/* Bubble */}
                <div className={`bubble group-hover:bubble-active transition-all z-10
                  ${i === 1 ? 'bubble-active' : ''}`}>
                  <span className="text-bronze text-xl">{b.icon}</span>
                </div>
                {/* Text */}
                <div className="flex-1 text-right pt-3 pb-2 border-b border-cream-dark last:border-0">
                  <div className="font-bold text-ink mb-0.5">{b.title}</div>
                  <div className="text-ink-muted text-sm leading-relaxed">{b.desc}</div>
                </div>
                {/* Arrow */}
                <div className="pt-4 text-bronze opacity-40 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  ←
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-cream-dark text-center">
          <p className="text-ink-muted text-sm">
            אנחנו מאחורי הקלעים.<br />
            <span className="text-ink font-bold">אתה תמיד עם הפוקוס.</span>
          </p>
        </div>
      </div>

      {/* ── Calculator quick-access grid ── */}
      <div className="fade-up-3">
        <div className="text-xs font-bold text-ink-faint tracking-widest uppercase mb-4">מחשבונים מהירים</div>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <button
              key={f.id}
              onClick={() => onNavigate(f.id)}
              className="card text-right hover:shadow-card transition-all group p-5"
            >
              <div className="w-10 h-10 rounded-2xl bg-cream-light flex items-center justify-center text-bronze text-lg mb-3 border border-cream-dark group-hover:bg-bronze group-hover:text-white transition-all">
                {f.icon}
              </div>
              <div className="font-bold text-ink text-sm mb-0.5">{f.title}</div>
              <div className="text-ink-faint text-xs">{f.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-ink-faint text-xs pb-4">
        כל החישובים מוצגים לצרכי הדרכה בלבד. יש להתייעץ עם גורמי מקצוע לפני קבלת החלטות.
      </div>
    </div>
  )
}
