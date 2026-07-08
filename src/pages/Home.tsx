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

          {/* Hero image */}
          <img
            src={`${import.meta.env.BASE_URL}hero.png`}
            alt="FOCUS robot"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient fade at bottom for smooth card transition */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-card to-transparent" />
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

      {/* ══ SCREEN 2 — Features ══ */}
      <div id="features-section" className="bg-cream-light px-5 pt-12 pb-16 relative overflow-hidden">

        {/* Building illustration — right side, tall apartment block */}
        <svg className="absolute right-0 top-0 h-full opacity-[0.11] pointer-events-none" width="90" viewBox="0 0 90 800" fill="none" preserveAspectRatio="xMaxYMin meet">
          {/* Main building body */}
          <rect x="14" y="60" width="62" height="740" stroke="#7A6A54" strokeWidth="1.3"/>
          {/* Roof/penthouse */}
          <rect x="22" y="40" width="46" height="22" stroke="#7A6A54" strokeWidth="1"/>
          <rect x="30" y="24" width="30" height="18" stroke="#7A6A54" strokeWidth="0.8"/>
          {/* Windows — 3 cols × 20 rows */}
          {Array.from({ length: 20 }, (_, row) =>
            [22, 39, 56].map(cx => (
              <rect key={`${row}-${cx}`} x={cx} y={76 + row * 34} width="11" height="18" rx="1.5"
                stroke="#7A6A54" strokeWidth="0.7"
                fill={row % 4 === 2 ? '#B8956A' : 'none'} fillOpacity="0.09"/>
            ))
          )}
          {/* Ground */}
          <path d="M0 800 L90 800" stroke="#7A6A54" strokeWidth="1.2"/>
          {/* Trees */}
          <circle cx="7" cy="776" r="10" stroke="#7A6A54" strokeWidth="0.8"/>
          <line x1="7" y1="786" x2="7" y2="800" stroke="#7A6A54" strokeWidth="0.9"/>
          <circle cx="83" cy="780" r="8" stroke="#7A6A54" strokeWidth="0.8"/>
          <line x1="83" y1="788" x2="83" y2="800" stroke="#7A6A54" strokeWidth="0.9"/>
        </svg>

        {/* Title */}
        <div className="text-center mb-10 relative z-10">
          <div className="logo-focus text-2xl mb-5 tracking-[0.35em]">FOCUS</div>
          <div className="text-xl font-black text-ink mb-2">כל מה שאתה צריך – במקום אחד</div>
          <div className="text-ink-muted text-sm">אנחנו פה כדי לפשט, לייעל ולבצע עבורך.</div>
        </div>

        {/* Bubbles + callouts */}
        <div className="relative z-10 mx-auto" style={{ maxWidth: 340 }}>

          {/* Straight vertical connecting line behind circles */}
          <svg
            className="absolute pointer-events-none"
            style={{ left: 46, top: 0, width: 4, height: '100%' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="vGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4B896" stopOpacity="0.9"/>
                <stop offset="85%" stopColor="#D4B896" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#D4B896" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect x="1.5" y="0" width="1" height="100%" fill="url(#vGrad)"/>
          </svg>

          <div className="flex flex-col gap-7">
            {BUBBLES.map((b) => (
              <div key={String(b.id)} dir="ltr" className="flex items-center gap-4">

                {/* Circle bubble — all with same golden glow ring */}
                <div
                  className="w-24 h-24 rounded-full flex-shrink-0 flex flex-col items-center justify-center gap-1.5
                    bg-cream-light border-2 border-bronze/40 relative z-10"
                  style={{
                    boxShadow: '0 0 0 7px rgba(184,149,106,0.10), 0 0 26px rgba(184,149,106,0.22)'
                  }}
                >
                  {b.icon}
                  <div className="text-ink text-[10px] font-bold text-center leading-tight px-2">
                    {b.title}
                  </div>
                </div>

                {/* Speech-bubble callout card */}
                <button
                  onClick={() => onNavigate(b.id)}
                  dir="rtl"
                  className="flex-1 bg-card rounded-2xl p-4 shadow-soft hover:shadow-gold transition-all group text-right relative"
                >
                  {/* Arrow pointing left toward the circle */}
                  <span
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                      right: '100%',
                      width: 0, height: 0,
                      borderTop: '7px solid transparent',
                      borderBottom: '7px solid transparent',
                      borderLeft: '8px solid white',
                      display: 'block',
                    }}
                  />
                  <div className="font-black text-ink text-sm mb-1">{b.subtitle}</div>
                  <div className="text-ink-muted text-xs leading-relaxed mb-3">{b.desc}</div>
                  <div dir="ltr" className="flex justify-start">
                    <div className="w-7 h-7 rounded-full border-2 border-[#D8CFBF] text-ink-faint flex items-center justify-center text-sm font-bold
                      group-hover:border-bronze group-hover:text-bronze transition-all">
                      ›
                    </div>
                  </div>
                </button>

              </div>
            ))}
          </div>

          {/* End dot */}
          <div className="flex justify-start mt-1" style={{ paddingLeft: 44 }}>
            <div className="w-3 h-3 rounded-full bg-bronze/30 border border-bronze/40" />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 relative z-10">
          <div className="w-10 h-px bg-bronze/25 mx-auto mb-5" />
          <p className="text-ink-muted text-sm leading-relaxed">
            אנחנו מאחורי הקלעים.<br />
            <span className="text-ink font-black">אתה תמיד עם הפוקוס.</span>
          </p>
        </div>
      </div>

    </div>
  )
}
