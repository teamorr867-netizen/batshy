import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

const HOME_TYPES = [
  { id: 'first', label: 'דירה ראשונה', ratio: 0.25, desc: 'מינימום 25%' },
  { id: 'second', label: 'דירה שניה', ratio: 0.30, desc: 'מינימום 30%' },
  { id: 'investment', label: 'השקעה', ratio: 0.40, desc: 'מינימום 40%' },
]

export default function EquityCalc() {
  const [price, setPrice] = useState('')
  const [currentEquity, setCurrentEquity] = useState('')
  const [homeType, setHomeType] = useState('first')
  const [result, setResult] = useState<null | {
    required: number; maxLoan: number; gap: number; ratio: number
    canBuy: boolean; additionalCosts: { purchaseTax: number; lawyer: number; agent: number; total: number }; totalNeeded: number
  }>(null)

  const calculate = () => {
    const p = parseFloat(price.replace(/,/g, ''))
    const eq = parseFloat(currentEquity.replace(/,/g, '')) || 0
    const type = HOME_TYPES.find(t => t.id === homeType)!
    if (!p) return
    const required = p * type.ratio
    const maxLoan = p * (1 - type.ratio)
    const gap = Math.max(0, required - eq)
    let purchaseTax = 0
    if (homeType === 'first') {
      const BRACKETS = [
        { limit: 1978745, rate: 0 }, { limit: 2347495, rate: 0.035 },
        { limit: 6055070, rate: 0.05 }, { limit: 20183565, rate: 0.08 }, { limit: Infinity, rate: 0.10 },
      ]
      let prev = 0
      for (const b of BRACKETS) {
        if (p > prev) { purchaseTax += Math.min(p - prev, b.limit - prev) * b.rate; prev = b.limit }
      }
    } else {
      purchaseTax = p <= 6055070 ? p * 0.08 : 6055070 * 0.08 + (p - 6055070) * 0.10
    }
    const lawyer = p * 0.005
    const agent = p * 0.02
    const additionalCosts = { purchaseTax, lawyer, agent, total: purchaseTax + lawyer + agent }
    setResult({ required, maxLoan, gap, ratio: type.ratio, canBuy: eq >= required, additionalCosts, totalNeeded: required + additionalCosts.total })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מחשבון</div>
        <h1 className="section-title">הון עצמי</h1>
        <p className="section-sub">כמה הון עצמי נדרש לרכישה?</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">סוג רכישה</label>
          <div className="grid grid-cols-3 gap-2">
            {HOME_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setHomeType(t.id)}
                className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                  homeType === t.id
                    ? 'border-bronze bg-bronze/5 text-bronze'
                    : 'border-cream-dark text-ink-muted hover:border-bronze/40'
                }`}
              >
                <div className="font-bold text-xs">{t.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">מחיר הנכס (₪)</label>
            <input className="input-field" placeholder="2,000,000" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="label">הון עצמי קיים (₪)</label>
            <input className="input-field" placeholder="500,000" value={currentEquity} onChange={e => setCurrentEquity(e.target.value)} />
          </div>
        </div>
        <button className="btn-bronze w-full" onClick={calculate}>חשב הון עצמי</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`card border-2 ${result.canBuy ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg
                ${result.canBuy ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {result.canBuy ? '✓' : '!'}
              </div>
              <div>
                <div className={`font-bold ${result.canBuy ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {result.canBuy ? 'ההון העצמי מספיק!' : `חסרים ₪${fmt(result.gap)}`}
                </div>
                <div className="text-ink-muted text-xs mt-0.5">
                  מינימום נדרש: ₪{fmt(result.required)} ({(result.ratio * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center py-6">
              <div className="text-ink-faint text-xs mb-2 uppercase tracking-wide">הון נדרש</div>
              <div className="text-3xl font-black text-bronze">₪{fmt(result.required)}</div>
            </div>
            <div className="card text-center py-6">
              <div className="text-ink-faint text-xs mb-2 uppercase tracking-wide">משכנתא מקס׳</div>
              <div className="text-3xl font-black text-ink">₪{fmt(result.maxLoan)}</div>
            </div>
          </div>

          <div className="card space-y-3">
            <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-2">עלויות נוספות</div>
            {[
              { label: 'מס רכישה', value: result.additionalCosts.purchaseTax },
              { label: 'שכ"ט עו"ד (~0.5%)', value: result.additionalCosts.lawyer },
              { label: 'עמלת מתווך (~2%)', value: result.additionalCosts.agent },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-cream-dark last:border-0 text-sm">
                <span className="text-ink-muted">{row.label}</span>
                <span className="font-medium text-ink">₪{fmt(row.value)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <span className="font-bold text-ink">סה"כ נדרש</span>
              <span className="font-black text-bronze text-lg">₪{fmt(result.totalNeeded)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
