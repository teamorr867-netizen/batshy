import { useEffect, useRef } from 'react'
import type { Page } from '../App'

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

// Each waypoint on the winding path
// side: 'left' = circle on left, callout on right; 'right' = reversed
const WAYPOINTS = [
  {
    id: 'leads' as Page,
    label: 'ניהול\nלידים',
    sub: 'תן לנו לנהל את זה',
    desc: 'לקוחות, עסקאות, מעקב ופניות – הכל במקום אחד.',
    side: 'left' as const,
    cy: 220,
    icon: (<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="11" r="5.5" stroke="#B8956A" strokeWidth="1.6"/><path d="M5 26c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="#B8956A" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  },
  {
    id: 'calcs-hub' as Page,
    label: 'חישובים\nמתקדמים',
    sub: 'תן לנו לחשב בשבילך',
    desc: 'תשואות, משכנתא, מסים, הון עצמי וניתוחי עסקה.',
    side: 'right' as const,
    cy: 510,
    icon: (<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="4" y="9" width="22" height="18" rx="3" stroke="#B8956A" strokeWidth="1.6"/><path d="M9 9V7c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v2" stroke="#B8956A" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 15h5M9 19.5h8" stroke="#B8956A" strokeWidth="1.3" strokeLinecap="round"/><circle cx="21" cy="20" r="3.5" stroke="#B8956A" strokeWidth="1.3"/></svg>),
  },
  {
    id: 'property-value' as Page,
    label: 'הערכת\nשווי',
    sub: 'מה שווה הנכס שלך?',
    desc: 'מחיר לפי אזור, גודל, קומה ומצב – בשניות.',
    side: 'left' as const,
    cy: 800,
    icon: (<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><path d="M3 12L15 4l12 8v16H3V12z" stroke="#B8956A" strokeWidth="1.6" strokeLinejoin="round"/><rect x="11" y="18" width="8" height="10" rx="1.5" stroke="#B8956A" strokeWidth="1.4"/><path d="M15 4v2" stroke="#B8956A" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
  {
    id: 'contracts-hub' as Page,
    label: 'חוזים\nומסמכים',
    sub: 'תן לנו להכין ולנהל',
    desc: 'חוזי שכירות ומכירה מוכנים להדפסה ולחתימה.',
    side: 'right' as const,
    cy: 1080,
    icon: (<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="6" y="3" width="20" height="24" rx="3" stroke="#B8956A" strokeWidth="1.6"/><path d="M10 9h10M10 13h10M10 17h7" stroke="#B8956A" strokeWidth="1.3" strokeLinecap="round"/><path d="M18 21l2.5-1.2 3.5-3.5-1.8-1.8-3.5 3.5-1.2 2.5z" fill="#B8956A" fillOpacity="0.3" stroke="#B8956A" strokeWidth="1"/></svg>),
  },
  {
    id: 'tax' as Page,
    label: 'מחשבון\nמסים',
    sub: 'כמה מס תשלם?',
    desc: 'מס רכישה ומס שבח לפי מדרגות 2024.',
    side: 'left' as const,
    cy: 1350,
    icon: (<svg width="30" height="30" viewBox="0 0 30 30" fill="none"><rect x="5" y="4" width="20" height="22" rx="2.5" stroke="#B8956A" strokeWidth="1.6"/><path d="M9 9h12M9 13h12M9 17h8" stroke="#B8956A" strokeWidth="1.3" strokeLinecap="round"/><path d="M9 21h5" stroke="#B8956A" strokeWidth="1.3" strokeLinecap="round"/></svg>),
  },
]

// cx: circle center X within a 360px-wide reference container
// left WPs: cx=72 (20%); right WPs: cx=288 (80%)
const CX = { left: 72, right: 288 }

export default function Home({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const pathRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = pathRef.current
    if (!el) return
    const targets = el.querySelectorAll('.wp-item, .wp-building')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('wp-visible'); obs.unobserve(e.target) } }),
      { threshold: 0.25 }
    )
    targets.forEach(t => obs.observe(t))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="space-y-0 -mx-4 md:-mx-10">

      {/* ══ SCREEN 1 — Hero ══ */}
      <div className="min-h-screen flex flex-col bg-cream-light">
        <div className="relative flex-1 overflow-hidden" style={{ minHeight: 360 }}>
          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-bronze text-xl select-none z-10">✦</div>
          <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center z-10">
            <div className="focus-logo text-3xl tracking-[0.35em]">FOCUS</div>
            <div className="text-ink-muted text-xs mt-1 tracking-wide">Focus on your genius. We'll handle the rest.</div>
          </div>
          <img src={`${import.meta.env.BASE_URL}hero.png`} alt="FOCUS robot"
            className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="bg-card rounded-t-3xl shadow-card px-6 pt-6 pb-2 -mt-6 relative z-10">
          <div className="text-center mb-5">
            <div className="text-lg font-black text-ink mb-1">אתה מול הלקוחות ואנחנו כאן מאחורייך</div>
            <div className="text-ink-muted text-sm">כדי שאתה תתמקד במה שחשוב באמת</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {FEATURE_ICONS.map(f => (
              <button key={String(f.id)} onClick={() => onNavigate(f.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-cream-light transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-cream-light border border-cream-dark flex items-center justify-center">{f.icon}</div>
                <div className="text-xs text-ink-muted text-center whitespace-pre-line leading-tight font-medium">{f.label}</div>
              </button>
            ))}
          </div>
          <button onClick={() => document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-bronze w-full flex items-center justify-center gap-2 mb-4">
            <span>✦</span><span>תן לנו לעשות לך את זה</span>
          </button>
          <div className="flex justify-center pb-2">
            <div className="text-ink-faint text-sm animate-bounce select-none">∨</div>
          </div>
        </div>
      </div>

      {/* ══ SCREEN 2 — Winding Path ══ */}
      <div id="features-section" className="bg-cream-light relative overflow-hidden" style={{ minHeight: 1600 }}>

        {/* Section header */}
        <div className="text-center pt-14 pb-6 relative z-10">
          <div className="logo-focus text-2xl tracking-[0.35em] mb-4">FOCUS</div>
          <div className="text-xl font-black text-ink mb-1">כל מה שאתה צריך – במקום אחד</div>
          <div className="text-ink-muted text-sm">אנחנו פה כדי לפשט, לייעל ולבצע עבורך.</div>
        </div>

        {/* Path container — 360px centered reference */}
        <div ref={pathRef} className="relative mx-auto" style={{ width: '100%', maxWidth: 360, height: 1500 }}>

          {/* ─── Winding path SVG ─── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width="100%" height="1500"
            viewBox="0 0 360 1500"
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              <linearGradient id="pathGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8A87A" stopOpacity="0.9"/>
                <stop offset="40%" stopColor="#D4B896" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#E4D8C8" stopOpacity="0.3"/>
              </linearGradient>
            </defs>
            {/* Main winding road */}
            <path
              d="M 180 40
                 C 180 130, 72 170, 72 220
                 C 72 270, 288 460, 288 510
                 C 288 560, 72 750, 72 800
                 C 72 850, 288 1030, 288 1080
                 C 288 1130, 72 1300, 72 1350
                 C 72 1400, 180 1470, 180 1510"
              stroke="url(#pathGold)" strokeWidth="2" fill="none" strokeLinecap="round"
            />
            {/* Dotted center line (dashed) */}
            <path
              d="M 180 40
                 C 180 130, 72 170, 72 220
                 C 72 270, 288 460, 288 510
                 C 288 560, 72 750, 72 800
                 C 72 850, 288 1030, 288 1080
                 C 288 1130, 72 1300, 72 1350"
              stroke="#D4B896" strokeWidth="0.5" fill="none" strokeDasharray="6 10"
              strokeOpacity="0.4"
            />
            {/* End dot */}
            <circle cx="180" cy="1510" r="4" fill="#D4B896" strokeOpacity="0.5"/>
          </svg>

          {/* ─── Background buildings (appear on scroll) ─── */}

          {/* Building 1 — tall apartment, right side, near WP1 */}
          <svg className="wp-building absolute pointer-events-none" style={{ right: -30, top: 80, opacity: 0, transition: 'opacity 1s ease 0.5s' }}
            width="90" height="420" viewBox="0 0 90 420" fill="none">
            <rect x="10" y="0" width="70" height="420" stroke="#9A8A74" strokeWidth="0.8"/>
            {Array.from({ length: 12 }, (_, r) =>
              [18, 36, 54].map(x => (
                <rect key={`${r}-${x}`} x={x} y={r * 32 + 8} width="10" height="18" rx="1"
                  stroke="#9A8A74" strokeWidth="0.6" fill={r % 4 === 1 ? '#C8A87A' : 'none'} fillOpacity="0.06"/>
              ))
            )}
          </svg>

          {/* Villa — left side, near WP3 */}
          <svg className="wp-building absolute pointer-events-none" style={{ left: -40, top: 680, opacity: 0, transition: 'opacity 1s ease 0.4s' }}
            width="120" height="180" viewBox="0 0 120 180" fill="none">
            {/* Roof */}
            <path d="M 10 80 L 60 10 L 110 80" stroke="#9A8A74" strokeWidth="0.8" strokeLinejoin="round"/>
            {/* Body */}
            <rect x="10" y="80" width="100" height="100" stroke="#9A8A74" strokeWidth="0.8"/>
            {/* Windows */}
            <rect x="20" y="92" width="22" height="28" rx="1" stroke="#9A8A74" strokeWidth="0.7"/>
            <rect x="78" y="92" width="22" height="28" rx="1" stroke="#9A8A74" strokeWidth="0.7"/>
            {/* Door */}
            <rect x="47" y="130" width="26" height="50" rx="13" stroke="#9A8A74" strokeWidth="0.7"/>
            {/* Tree */}
            <circle cx="10" cy="168" r="12" stroke="#9A8A74" strokeWidth="0.6"/>
            <line x1="10" y1="178" x2="10" y2="180" stroke="#9A8A74" strokeWidth="0.8"/>
          </svg>

          {/* Building 2 — modern tower, right side, near WP4 */}
          <svg className="wp-building absolute pointer-events-none" style={{ right: -20, top: 940, opacity: 0, transition: 'opacity 1s ease 0.5s' }}
            width="70" height="320" viewBox="0 0 70 320" fill="none">
            <rect x="5" y="30" width="60" height="290" stroke="#9A8A74" strokeWidth="0.8"/>
            <rect x="15" y="0" width="40" height="32" stroke="#9A8A74" strokeWidth="0.7"/>
            {Array.from({ length: 9 }, (_, r) =>
              [12, 32, 50].map(x => (
                <rect key={`${r}-${x}`} x={x} y={r * 30 + 40} width="9" height="16" rx="1"
                  stroke="#9A8A74" strokeWidth="0.6" fill={r % 3 === 2 ? '#C8A87A' : 'none'} fillOpacity="0.07"/>
              ))
            )}
          </svg>

          {/* Star sparkles along path */}
          {[[180, 40], [72, 220], [288, 510], [72, 800], [288, 1080], [72, 1350]].map(([x, y], i) => (
            <div key={i} className="absolute text-bronze/30 text-xs select-none pointer-events-none"
              style={{ left: x - 6, top: y - 6 }}>✦</div>
          ))}

          {/* ─── Waypoint circles + callout cards ─── */}
          {WAYPOINTS.map((wp, i) => {
            const cx = CX[wp.side]
            const isLeft = wp.side === 'left'
            return (
              <div
                key={String(wp.id)}
                className={`wp-item absolute`}
                style={{
                  top: wp.cy - 44,
                  left: 0,
                  right: 0,
                  opacity: 0,
                  transform: isLeft ? 'translateX(-28px)' : 'translateX(28px)',
                  transition: `opacity 0.55s ease ${i * 0.08}s, transform 0.55s ease ${i * 0.08}s`,
                }}
              >
                <div
                  dir="ltr"
                  className="flex items-center gap-3 px-3"
                  style={{ justifyContent: isLeft ? 'flex-start' : 'flex-end' }}
                >
                  {/* For right-side: callout first (appears visually left), then circle */}
                  {!isLeft && (
                    <button
                      onClick={() => onNavigate(wp.id)}
                      dir="rtl"
                      className="bg-card rounded-2xl px-4 py-3 shadow-soft hover:shadow-gold transition-all group text-right"
                      style={{ maxWidth: 175 }}
                    >
                      <div className="font-black text-ink text-sm mb-1">{wp.sub}</div>
                      <div className="text-ink-muted text-[11px] leading-relaxed mb-2">{wp.desc}</div>
                      <div dir="ltr" className="flex">
                        <div className="w-6 h-6 rounded-full border-2 border-[#D8CFBF] text-ink-faint group-hover:border-bronze group-hover:text-bronze flex items-center justify-center text-sm transition-all">›</div>
                      </div>
                    </button>
                  )}

                  {/* Circle */}
                  <button
                    onClick={() => onNavigate(wp.id)}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-full bg-cream-light border-2 border-[#D8CFBF] transition-all hover:border-bronze relative z-10"
                    style={{
                      width: 88, height: 88,
                      left: cx - 44,
                      boxShadow: '0 0 0 6px rgba(184,149,106,0.07), 0 4px 16px rgba(0,0,0,0.06)',
                    }}
                  >
                    {wp.icon}
                    <div className="text-[9.5px] font-bold text-ink text-center leading-tight px-1.5 whitespace-pre-line">
                      {wp.label}
                    </div>
                  </button>

                  {/* For left-side: callout after circle (appears visually right) */}
                  {isLeft && (
                    <button
                      onClick={() => onNavigate(wp.id)}
                      dir="rtl"
                      className="bg-card rounded-2xl px-4 py-3 shadow-soft hover:shadow-gold transition-all group text-right"
                      style={{ maxWidth: 175 }}
                    >
                      <div className="font-black text-ink text-sm mb-1">{wp.sub}</div>
                      <div className="text-ink-muted text-[11px] leading-relaxed mb-2">{wp.desc}</div>
                      <div dir="ltr" className="flex">
                        <div className="w-6 h-6 rounded-full border-2 border-[#D8CFBF] text-ink-faint group-hover:border-bronze group-hover:text-bronze flex items-center justify-center text-sm transition-all">›</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )
          })}

        </div>{/* end path container */}

        {/* Footer */}
        <div className="text-center py-12 relative z-10">
          <div className="w-8 h-px bg-bronze/25 mx-auto mb-5"/>
          <p className="text-ink-muted text-sm leading-relaxed">
            אנחנו מאחורי הקלעים.<br/>
            <span className="text-ink font-black">אתה תמיד עם הפוקוס.</span>
          </p>
        </div>
      </div>

    </div>
  )
}
