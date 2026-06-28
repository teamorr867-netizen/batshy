import { useState } from 'react'
import type { Page } from '../App'

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'ראשי', icon: '✦' },
  { id: 'leads' as Page, label: 'ניהול לידים', icon: '👤' },
  { id: 'divider-calcs', label: 'מחשבונים', icon: '' },
  { id: 'calcs-hub' as Page, label: 'כל המחשבונים', icon: '⊞' },
  { id: 'yield' as Page, label: 'מחשבון תשואה', icon: '↗' },
  { id: 'mortgage' as Page, label: 'מחשבון משכנתא', icon: '⬡' },
  { id: 'equity' as Page, label: 'הון עצמי', icon: '◈' },
  { id: 'property-value' as Page, label: 'הערכת שווי', icon: '⌂' },
  { id: 'tax' as Page, label: 'מחשבון מסים', icon: '◻' },
  { id: 'divider-contracts', label: 'חוזים', icon: '' },
  { id: 'contracts-hub' as Page, label: 'כל החוזים', icon: '📋' },
  { id: 'rental-contract' as Page, label: 'חוזה שכירות', icon: '✍' },
  { id: 'sale-contract' as Page, label: 'חוזה מכירה', icon: '⊕' },
]

interface Props {
  currentPage: Page
  onNavigate: (p: Page) => void
  children: React.ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink/30 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-card z-30 flex flex-col shadow-card
        transform transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>

        {/* Logo */}
        <div className="p-8 pb-6 border-b border-cream-dark">
          <div className="logo-focus text-2xl mb-1">FOCUS</div>
          <div className="text-ink-muted text-xs tracking-wide">מתווך חכם · הכל במקום אחד</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.id.startsWith('divider')) {
              return (
                <div key={item.id} className="text-ink-faint text-xs font-semibold tracking-widest uppercase px-4 pt-5 pb-2">
                  {item.label}
                </div>
              )
            }
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id as Page); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-right
                  ${isActive ? 'nav-active' : 'text-ink-muted hover:bg-cream-light hover:text-ink'}`}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-cream-dark">
          <div className="text-xs text-ink-faint text-center leading-relaxed">
            כל החישובים הם לצרכי הדרכה בלבד
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:mr-72 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 bg-card/90 backdrop-blur border-b border-cream-dark p-4 flex items-center justify-between z-10">
          <div className="logo-focus text-xl">FOCUS</div>
          <button onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-xl bg-cream-light flex items-center justify-center text-ink">
            <span className="text-lg">☰</span>
          </button>
        </header>

        <div className="flex-1 p-4 md:p-10 max-w-3xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
