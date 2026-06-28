import type { Page } from '../App'

const BUBBLES = [
  {
    id: 'leads' as Page,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" stroke="#B8956A" strokeWidth="1.5"/>
        <path d="M5 24c0-5 4-8 9-8s9 3 9 8" stroke="#B8956A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'ניהול דירות ולקוחות',
    subtitle: 'תן לנו לנהל את זה',
    desc: 'אנחנו מטפלים בדיירים, תשלומים, מעקב ופניות.',
  },
  {
    id: 'calcs-hub' as Page,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="22" height="17" rx="3" stroke="#B8956A" strokeWidth="1.5"/>
        <path d="M8 8V5.5C8 4.12 9.12 3 10.5 3H17.5C18.88 3 20 4.12 20 5.5V8" stroke="#B8956A" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 13h4M8 17h7M8 21h5" stroke="#B8956A" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="19" cy="19" r="3" fill="#B8956A" fillOpacity="0.15" stroke="#B8956A" strokeWidth="1.2"/>
      </svg>
    ),
    title: 'חישובים מתקדמים',
    subtitle: 'תן לנו לחשב בשבילך',
    desc: 'תשואות, תזרים, מיסוי, השוואות וניתוחי עסקה.',
  },
  {
    id: 'contracts-hub' as Page,
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="3" width="18" height="22" rx="3" stroke="#B8956A" strokeWidth="1.5"/>
        <path d="M9 8h10M9 12h10M9 16h6" stroke="#B8956A" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M16 19l2-1 3-3-1-1-3 3-1 2z" fill="#B8956A" fillOpacity="0.5" stroke="#B8956A" strokeWidth="0.8"/>
      </svg>
    ),
    title: 'חוזים ומסמכים',
    subtitle: 'תן לנו להכין ולנהל',
    desc: 'חוזים מוכנים, מסמכים, תבניות וחתימות.',
  },
]

const FEATURE_ICONS = [
  {
    id: 'leads' as Page,
    icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#B8956A" strokeWidth="1.4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#B8956A" strokeWidth="1.4" strokeLinecap="round"/></svg>),
    label: 'ניהול דירות\nולקוחות',
  },
  {
    id: 'calcs-hub' as Page,
    icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#B8956A" strokeWidth="1.4"/><path d="M7 7V5a2 2 0 014 0v2M13 7V5a2 2 0 014 0v2" stroke="#B8956A" strokeWidth="1.2" strokeLinecap="round"/><path d="M7 12h4M7 15.5h6" stroke="#B8956A" strokeWidth="1.2" strokeLinecap="round"/></svg>),
    label: 'חישובים\nמתקדמים',
  },
  {
    id: 'contracts-hub' as Page,
    icon: (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="4" y="2" width="16" height="20" rx="2" stroke="#B8956A" strokeWidth="1.4"/><path d="M8 7h8M8 11h8M8 15h5" stroke="#B8956A" strokeWidth="1.2" strokeLinecap="round"/></svg>),
    label: 'חוזים\nומסמכים',
  },
]

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-0 -mx-4 md:-mx-10">

      {/* ══ SCREEN 1 — Hero ══ */}
      <div className="min-h-screen flex flex-col bg-cream-light">

        {/* Illustration area */}
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 360 }}>

          {/* Star */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-bronze text-xl select-none z-10">✦</div>

          {/* FOCUS logo */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
            <div className="focus-logo text-3xl tracking-[0.35em]">FOCUS</div>
            <div className="text-ink-muted text-xs mt-1 tracking-wide">Focus on your genius. We'll handle the rest.</div>
          </div>

          {/* Building background */}
          <svg className="absolute left-0 bottom-0 opacity-20" width="180" height="280" viewBox="0 0 180 280" fill="none">
            <rect x="10" y="80" width="70" height="200" stroke="#B8956A" strokeWidth="1.2"/>
            <rect x="20" y="92" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="44" y="92" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="20" y="124" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="44" y="124" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="20" y="156" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="44" y="156" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="90" y="120" width="80" height="160" stroke="#B8956A" strokeWidth="1.2"/>
            <rect x="102" y="134" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="126" y="134" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="102" y="166" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <rect x="126" y="166" width="14" height="20" stroke="#B8956A" strokeWidth="1"/>
            <path d="M0 280 L180 280" stroke="#B8956A" strokeWidth="1"/>
          </svg>

          {/* Robot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <svg width="180" height="260" viewBox="0 0 180 260" fill="none">
              <ellipse cx="90" cy="254" rx="50" ry="6" fill="#B8956A" fillOpacity="0.12"/>
              <rect x="60" y="200" width="24" height="50" rx="10" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="96" y="200" width="24" height="50" rx="10" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="56" y="238" width="32" height="16" rx="8" fill="#E4DAD0" stroke="#C8B89A" strokeWidth="1.5"/>
              <rect x="92" y="238" width="32" height="16" rx="8" fill="#E4DAD0" stroke="#C8B89A" strokeWidth="1.5"/>
              <rect x="42" y="120" width="96" height="90" rx="16" fill="#F0EAE2" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="56" y="136" width="68" height="44" rx="10" fill="#EDE7DF" stroke="#C8B89A" strokeWidth="1.2"/>
              <circle cx="72" cy="155" r="5" fill="#B8956A" fillOpacity="0.9"/>
              <circle cx="90" cy="155" r="5" fill="#B8956A" fillOpacity="0.5" className="pulse-bronze"/>
              <circle cx="108" cy="155" r="5" fill="#B8956A" fillOpacity="0.9"/>
              <rect x="64" y="168" width="52" height="4" rx="2" fill="#C8B89A" fillOpacity="0.5"/>
              <rect x="10" y="125" width="34" height="66" rx="14" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="136" y="125" width="34" height="66" rx="14" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="6" y="176" width="22" height="14" rx="7" fill="#E4DAD0" stroke="#C8B89A" strokeWidth="1.5"/>
              <rect x="-28" y="148" width="40" height="30" rx="5" fill="none" stroke="#B8956A" strokeWidth="1" strokeOpacity="0.6"/>
              <line x1="-20" y1="157" x2="4" y2="157" stroke="#B8956A" strokeWidth="0.8" strokeOpacity="0.5"/>
              <line x1="-20" y1="163" x2="0" y2="163" stroke="#B8956A" strokeWidth="0.8" strokeOpacity="0.5"/>
              <line x1="6" y1="183" x2="0" y2="162" stroke="#B8956A" strokeWidth="0.8" strokeOpacity="0.4" strokeDasharray="3 2"/>
              <rect x="152" y="176" width="22" height="14" rx="7" fill="#E4DAD0" stroke="#C8B89A" strokeWidth="1.5"/>
              <rect x="74" y="114" width="32" height="14" rx="6" fill="#EAE4DC" stroke="#D4C4B0" strokeWidth="1.2"/>
              <rect x="34" y="40" width="112" height="80" rx="24" fill="#F5F0EB" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="50" y="56" width="30" height="22" rx="8" fill="#EDE7DF" stroke="#C8B89A" strokeWidth="1.5"/>
              <rect x="100" y="56" width="30" height="22" rx="8" fill="#EDE7DF" stroke="#C8B89A" strokeWidth="1.5"/>
              <circle cx="65" cy="67" r="7" fill="#B8956A"/>
              <circle cx="115" cy="67" r="7" fill="#B8956A" className="pulse-bronze"/>
              <circle cx="65" cy="67" r="3" fill="white"/>
              <circle cx="115" cy="67" r="3" fill="white"/>
              <circle cx="67" cy="65" r="1.5" fill="white" fillOpacity="0.7"/>
              <circle cx="117" cy="65" r="1.5" fill="white" fillOpacity="0.7"/>
              <path d="M58 96 Q90 110 122 96" fill="none" stroke="#C8B89A" strokeWidth="2" strokeLinecap="round"/>
              <rect x="16" y="60" width="20" height="30" rx="8" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <rect x="144" y="60" width="20" height="30" rx="8" fill="#EDE7DF" stroke="#D4C4B0" strokeWidth="1.5"/>
              <line x1="90" y1="40" x2="90" y2="20" stroke="#D4C4B0" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="90" cy="15" r="5.5" fill="#B8956A" className="pulse-bronze"/>
              <circle cx="90" cy="15" r="2.5" fill="white"/>
            </svg>
          </div>
        </div>

        {/* White card */}
        <div className="bg-card rounded-t-3xl shadow-card px-6 pt-6 pb-2 -mt-6 relative z-10">
          <div className="text-center mb-5">
            <div className="text-lg font-black text-ink mb-1">
              אתה מול הלקוחות ואנחנו כאן מאחורייך
            </div>
            <div className="text-ink-muted text-sm">
              כדי שאתה תתמקד במה שחשוב באמת
            </div>
          </div>

          {/* 3 feature icons */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {FEATURE_ICONS.map(f => (
              <button key={String(f.id)} onClick={() => onNavigate(f.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-cream-light transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cream-light border border-cream-dark flex items-center justify-center">
                  {f.icon}
                </div>
                <div className="text-xs text-ink-muted text-center whitespace-pre-line leading-tight font-medium">
                  {f.label}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-bronze w-full flex items-center justify-center gap-2 mb-4"
          >
            <span>✦</span>
            <span>תן לנו לעשות לך את זה</span>
          </button>

          <div className="flex justify-center pb-2">
            <div className="text-ink-faint text-sm animate-bounce select-none">∨</div>
          </div>
        </div>
      </div>

      {/* ══ SCREEN 2 — Bubbles ══ */}
      <div id="features-section" className="bg-cream-light px-6 pt-10 pb-16 relative overflow-hidden">

        {/* Building right-side illustration */}
        <svg className="absolute left-0 top-0 h-full opacity-15 pointer-events-none" width="90" viewBox="0 0 90 600" fill="none" preserveAspectRatio="xMidYMid slice">
          <rect x="8" y="40" width="48" height="520" stroke="#B8956A" strokeWidth="1"/>
          <rect x="16" y="56" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="32" y="56" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="16" y="84" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="32" y="84" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="16" y="112" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="32" y="112" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="16" y="140" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="32" y="140" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="16" y="168" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="32" y="168" width="9" height="15" stroke="#B8956A" strokeWidth="0.8"/>
          <rect x="56" y="180" width="32" height="380" stroke="#B8956A" strokeWidth="1"/>
          <rect x="62" y="194" width="7" height="11" stroke="#B8956A" strokeWidth="0.7"/>
          <rect x="75" y="194" width="7" height="11" stroke="#B8956A" strokeWidth="0.7"/>
          <rect x="62" y="216" width="7" height="11" stroke="#B8956A" strokeWidth="0.7"/>
          <rect x="75" y="216" width="7" height="11" stroke="#B8956A" strokeWidth="0.7"/>
          <path d="M0 560 L90 560" stroke="#B8956A" strokeWidth="0.8"/>
        </svg>

        {/* Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="text-2xl font-black text-ink mb-1">כל מה שאתה צריך – במקום אחד</div>
          <div className="text-ink-muted text-sm">אנחנו פה כדי לפשט, לייעל ולבצע עבורך.</div>
        </div>

        {/* Connected bubbles */}
        <div className="relative z-10 max-w-sm mx-auto">
          {/* Vertical gold line */}
          <div className="absolute top-8 bottom-8 right-8 w-px"
            style={{ background: 'linear-gradient(to bottom, #B8956A, #D4B896, #E8DDD0)' }} />

          <div className="space-y-8">
            {BUBBLES.map((b, i) => (
              <button
                key={String(b.id)}
                onClick={() => onNavigate(b.id)}
                className="w-full flex items-start gap-4 group text-right"
              >
                {/* Gold circle */}
                <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0
                  border-2 bg-card shadow-soft transition-all duration-200
                  ${i === 1
                    ? 'border-bronze shadow-gold scale-105'
                    : 'border-cream-dark group-hover:border-bronze group-hover:shadow-gold group-hover:scale-105'
                  }`}
                >
                  {b.icon}
                </div>

                {/* Text */}
                <div className="flex-1 pt-1 border-b border-cream-dark pb-4 group-last:border-0">
                  <div className="font-black text-ink text-sm mb-0.5">{b.title}</div>
                  <div className="text-bronze text-xs font-semibold mb-1">{b.subtitle}</div>
                  <div className="text-ink-muted text-xs leading-relaxed">{b.desc}</div>
                </div>

                {/* Arrow */}
                <div className="pt-3 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs
                    transition-all duration-200
                    ${i === 1
                      ? 'border-bronze text-bronze bg-bronze/5'
                      : 'border-cream-dark text-ink-faint group-hover:border-bronze group-hover:text-bronze group-hover:bg-bronze/5'
                    }`}>
                    ←
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 relative z-10">
          <div className="w-12 h-px bg-bronze/30 mx-auto mb-4" />
          <p className="text-ink-muted text-sm leading-relaxed">
            אנחנו מאחורי הקלעים.<br />
            <span className="text-ink font-black">אתה תמיד עם הפוקוס.</span>
          </p>
        </div>
      </div>

    </div>
  )
}
