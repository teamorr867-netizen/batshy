import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

const HOME_TYPES = [
  { id: 'first', label: 'דירה ראשונה', ratio: 0.25, desc: 'מינימום 25% הון עצמי' },
  { id: 'second', label: 'דירה שניה', ratio: 0.30, desc: 'מינימום 30% הון עצמי' },
  { id: 'investment', label: 'דירת השקעה', ratio: 0.40, desc: 'מינימום 40% הון עצמי' },
]

export default function EquityCalc() {
  const [price, setPrice] = useState('')
  const [currentEquity, setCurrentEquity] = useState('')
  const [homeType, setHomeType] = useState('first')
  const [result, setResult] = useState<null | {
    required: number
    maxLoan: number
    gap: number
    ratio: number
    canBuy: boolean
    additionalCosts: {
      purchaseTax: number
      lawyer: number
      agent: number
      renovation: number
      total: number
    }
    totalNeeded: number
  }>(null)

  const calculate = () => {
    const p = parseFloat(price.replace(/,/g, ''))
    const eq = parseFloat(currentEquity.replace(/,/g, '')) || 0
    const type = HOME_TYPES.find(t => t.id === homeType)!

    if (!p) return

    const required = p * type.ratio
    const maxLoan = p * (1 - type.ratio)
    const gap = Math.max(0, required - eq)

    // Purchase tax (rough estimate for first home under 2M)
    let purchaseTax = 0
    if (homeType === 'first') {
      const BRACKETS = [
        { limit: 1978745, rate: 0 },
        { limit: 2347495, rate: 0.035 },
        { limit: 6055070, rate: 0.05 },
        { limit: 20183565, rate: 0.08 },
        { limit: Infinity, rate: 0.10 },
      ]
      let prev = 0
      for (const b of BRACKETS) {
        if (p > prev) {
          purchaseTax += Math.min(p - prev, b.limit - prev) * b.rate
          prev = b.limit
        }
      }
    } else {
      if (p <= 6055070) purchaseTax = p * 0.08
      else purchaseTax = 6055070 * 0.08 + (p - 6055070) * 0.10
    }

    const lawyer = p * 0.005
    const agent = p * 0.02
    const renovation = p * 0.03

    const additionalCosts = { purchaseTax, lawyer, agent, renovation, total: purchaseTax + lawyer + agent }
    const totalNeeded = required + additionalCosts.total

    setResult({
      required,
      maxLoan,
      gap,
      ratio: type.ratio,
      canBuy: eq >= required,
      additionalCosts,
      totalNeeded,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">💰 מחשבון הון עצמי</h1>
        <p className="section-sub">כמה הון עצמי נדרש לרכישת הנכס?</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label">סוג רכישה</label>
          <div className="grid grid-cols-3 gap-2">
            {HOME_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setHomeType(t.id)}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  homeType === t.id
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-dark-border text-gray-400 hover:border-gray-500'
                }`}
              >
                <div>{t.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{(t.ratio * 100).toFixed(0)}%</div>
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
        <button className="btn-gold w-full" onClick={calculate}>חשב הון עצמי</button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Status */}
          <div className={`card border ${result.canBuy ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{result.canBuy ? '✅' : '⚠️'}</span>
              <div>
                <div className={`font-bold text-lg ${result.canBuy ? 'text-green-400' : 'text-red-400'}`}>
                  {result.canBuy ? 'ההון העצמי מספיק לרכישה!' : `חסרים ₪${fmt(result.gap)} להון עצמי`}
                </div>
                <div className="text-gray-400 text-sm">
                  מינימום נדרש: ₪{fmt(result.required)} ({(result.ratio * 100).toFixed(0)}% ממחיר הנכס)
                </div>
              </div>
            </div>
          </div>

          {/* Main numbers */}
          <div className="grid grid-cols-2 gap-4">
            <div className="result-box text-center">
              <div className="text-gray-400 text-sm mb-1">הון עצמי נדרש</div>
              <div className="text-3xl font-black text-gold">₪{fmt(result.required)}</div>
            </div>
            <div className="result-box text-center">
              <div className="text-gray-400 text-sm mb-1">משכנתא מקסימלית</div>
              <div className="text-3xl font-black text-white">₪{fmt(result.maxLoan)}</div>
            </div>
          </div>

          {/* Additional costs */}
          <div className="card space-y-3">
            <h3 className="font-bold text-gold text-sm uppercase tracking-wide">עלויות נוספות</h3>
            {[
              { label: 'מס רכישה (מוערך)', value: result.additionalCosts.purchaseTax },
              { label: 'שכ"ט עו"ד (~0.5%)', value: result.additionalCosts.lawyer },
              { label: 'עמלת מתווך (~2%)', value: result.additionalCosts.agent },
              { label: 'שיפוץ (לשיקולך, ~3%)', value: result.additionalCosts.renovation },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center border-b border-dark-border pb-2 text-sm">
                <span className="text-gray-400">{row.label}</span>
                <span className="text-white font-medium">₪{fmt(row.value)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-1">
              <span className="text-white font-bold">סה"כ נדרש (ללא שיפוץ)</span>
              <span className="text-gold font-black text-lg">₪{fmt(result.totalNeeded)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
