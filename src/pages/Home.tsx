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

        {/* Building illustration — tall residential block, right side */}
        <svg className="absolute right-0 top-0 opacity-[0.10] pointer-events-none" style={{ height: '100%', width: 110 }} viewBox="0 0 110 700" fill="none" preserveAspectRatio="xMaxYMin meet">
          {/* Building body */}
          <rect x="20" y="80" width="72" height="620" stroke="#7A6A54" strokeWidth="1.2" rx="2"/>
          {/* Upper step */}
          <rect x="30" y="55" width="52" height="27" stroke="#7A6A54" strokeWidth="1"/>
          {/* Roof */}
          <rect x="38" y="38" width="36" height="19" stroke="#7A6A54" strokeWidth="0.9"/>
          {/* Windows 3 cols × 17 rows */}
          {Array.from({ length: 17 }, (_, row) =>
            [28, 50, 72].map(cx => (
              <rect key={`${row}-${cx}`} x={cx} y={96 + row * 34} width="14" height="20" rx="2"
                stroke="#7A6A54" strokeWidth="0.75"
                fill={row % 5 === 2 ? '#C8A87A' : 'none'} fillOpacity="0.10"/>
            ))
          )}
          {/* Ground line */}
          <line x1="0" y1="700" x2="110" y2="700" stroke="#7A6A54" strokeWidth="1.1"/>
          {/* Tree left */}
          <circle cx="10" cy="682" r="11" stroke="#7A6A54" strokeWidth="0.8"/>
          <line x1="10" y1="693" x2="10" y2="700" stroke="#7A6A54" strokeWidth="1"/>
          {/* Tree right */}
          <circle cx="100" cy="686" r="8" stroke="#7A6A54" strokeWidth="0.8"/>
          <line x1="100" y1="694" x2="100" y2="700" stroke="#7A6A54" strokeWidth="1"/>
        </svg>

        {/* Title */}
        <div className="text-center mb-10 relative z-10">
          <div className="logo-focus text-2xl mb-3 tracking-[0.35em]">FOCUS</div>
          <div className="text-xl font-black text-ink mb-2">כל מה שאתה צריך – במקום אחד</div>
          <div className="text-ink-muted text-sm">אנחנו פה כדי לפשט, לייעל ולבצע עבורך.</div>
        </div>

        {/* Bubbles + callouts */}
        <div className="relative z-10 mx-auto" style={{ maxWidth: 340 }}>

          {/* Gentle S-curve connecting line — sits behind the circles */}
          <svg
            className="absolute pointer-events-none z-0"
            style={{ left: 0, top: 0, width: 96, height: 360 }}
            viewBox="0 0 96 360"
          >
            <defs>
              <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#D4B896" stopOpacity="0.8"/>
                <stop offset="80%" stopColor="#D4B896" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#D4B896" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Path flows from center of circle 0 → center of circle 1 → center of circle 2 */}
            {/* circle centers: y≈48, y≈178, y≈308 (96px circles, 30px gap) */}
            <path
              d="M 48 48 C 36 90, 60 128, 48 178 C 36 228, 60 264, 48 308"
              stroke="url(#curveGrad)" strokeWidth="1.6" fill="none" strokeLinecap="round"
            />
            {/* Bottom end dot */}
            <circle cx="48" cy="308" r="4" fill="#D4B896" fillOpacity="0.55"/>
          </svg>

          <div className="flex flex-col" style={{ gap: 30 }}>
            {BUBBLES.map((b) => (
              <div key={String(b.id)} dir="ltr" className="flex items-center gap-4">

                {/* Glowing circle — warm golden ring, same on all */}
                <div
                  className="w-24 h-24 rounded-full flex-shrink-0 flex flex-col items-center justify-center gap-1.5 bg-[#F7F3EE] border-2 relative z-10"
                  style={{
                    borderColor: '#D4B896',
                    boxShadow: '0 0 0 5px rgba(212,184,150,0.18), 0 0 22px 4px rgba(212,184,150,0.38), 0 0 42px 8px rgba(184,149,106,0.14)',
                  }}
                >
                  {b.icon}
                  <div className="text-ink text-[10px] font-bold text-center leading-tight px-2">
                    {b.title}
                  </div>
                </div>

                {/* Callout card — clean rounded rect, no arrow */}
                <button
                  onClick={() => onNavigate(b.id)}
                  dir="rtl"
                  className="flex-1 bg-card rounded-2xl p-4 shadow-soft hover:shadow-gold transition-all group text-right"
                >
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
