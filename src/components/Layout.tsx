import { useState } from 'react'
import type { Page } from '../App'

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'ראשי', icon: '🤖' },
  { id: 'divider-1', label: '── מחשבונים ──', icon: '' },
  { id: 'yield' as Page, label: 'מחשבון תשואה', icon: '📈' },
  { id: 'mortgage' as Page, label: 'מחשבון משכנתא', icon: '🏦' },
  { id: 'equity' as Page, label: 'הון עצמי', icon: '💰' },
  { id: 'property-value' as Page, label: 'הערכת שווי', icon: '🏠' },
  { id: 'tax' as Page, label: 'מחשבון מסים', icon: '📋' },
  { id: 'divider-2', label: '── חוזים ──', icon: '' },
  { id: 'rental-contract' as Page, label: 'חוזה שכירות', icon: '📝' },
  { id: 'sale-contract' as Page, label: 'חוזה מכירה', icon: '🤝' },
]

interface Props {
  currentPage: Page
  onNavigate: (p: Page) => void
  children: React.ReactNode
}

export default function Layout({ currentPage, onNavigate, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-dark">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-dark-card border-l border-dark-border z-30 flex flex-col transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <div className="font-black text-white text-lg leading-none">BrokerBot</div>
              <div className="text-gold text-xs font-medium">מתווך חכם</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.id.startsWith('divider')) {
              return (
                <div key={item.id} className="text-gray-600 text-xs font-medium px-3 py-2 mt-3">
                  {item.label}
                </div>
              )
            }
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id as Page); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-right
                  ${isActive
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-dark-border">
          <div className="text-xs text-gray-600 text-center">
            כל החישובים הם לצרכי הדרכה בלבד
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:mr-64 min-h-screen flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 bg-dark-card border-b border-dark-border p-4 flex items-center justify-between z-10">
          <div className="font-black text-white">BrokerBot</div>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-gold text-2xl"
          >
            ☰
          </button>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
