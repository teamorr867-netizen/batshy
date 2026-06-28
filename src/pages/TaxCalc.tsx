import { useState } from 'react'

function fmt(n: number) { return n.toLocaleString('he-IL', { maximumFractionDigits: 0 }) }

function calcPurchaseTax(price: number, isFirstHome: boolean) {
  const breakdown: { range: string; amount: number; rate: string }[] = []
  let tax = 0
  const brackets = isFirstHome
    ? [{ limit: 1978745, rate: 0, label: '0%' }, { limit: 2347495, rate: 0.035, label: '3.5%' },
       { limit: 6055070, rate: 0.05, label: '5%' }, { limit: 20183565, rate: 0.08, label: '8%' }, { limit: Infinity, rate: 0.10, label: '10%' }]
    : [{ limit: 6055070, rate: 0.08, label: '8%' }, { limit: Infinity, rate: 0.10, label: '10%' }]
  let prev = 0
  for (const b of brackets) {
    if (price > prev) {
      const taxable = Math.min(price - prev, b.limit - prev)
      const amount = taxable * b.rate
      tax += amount
      if (taxable > 0) breakdown.push({ range: `₪${fmt(prev)} – ${b.limit === Infinity ? '∞' : '₪' + fmt(b.limit)}`, amount, rate: b.label })
      prev = b.limit
    }
  }
  return { tax, breakdown }
}

export default function TaxCalc() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'appreciation'>('purchase')
  const [buyPrice, setBuyPrice] = useState('')
  const [isFirstHome, setIsFirstHome] = useState(true)
  const [purchaseResult, setPurchaseResult] = useState<null | ReturnType<typeof calcPurchaseTax>>(null)
  const [salePrice, setSalePrice] = useState('')
  const [origPrice, setOrigPrice] = useState('')
  const [improveCost, setImproveCost] = useState('')
  const [buyYear, setBuyYear] = useState('')
  const [isExempt, setIsExempt] = useState(false)
  const [appResult, setAppResult] = useState<null | { gain: number; taxableGain: number; tax: number; effectiveRate: number }>(null)

  const calcPurchase = () => {
    const p = parseFloat(buyPrice.replace(/,/g, ''))
    if (!p) return
    setPurchaseResult(calcPurchaseTax(p, isFirstHome))
  }

  const calcAppreciation = () => {
    const sale = parseFloat(salePrice.replace(/,/g, ''))
    const orig = parseFloat(origPrice.replace(/,/g, ''))
    const improve = parseFloat(improveCost.replace(/,/g, '')) || 0
    const buyY = parseInt(buyYear) || 2000
    const saleY = new Date().getFullYear()
    if (!sale || !orig) return
    const gain = sale - orig - improve
    if (gain <= 0 || isExempt) { setAppResult({ gain, taxableGain: 0, tax: 0, effectiveRate: 0 }); return }
    const REFORM_YEAR = 2014
    const taxableGain = buyY < REFORM_YEAR
      ? gain * ((saleY - REFORM_YEAR) / (saleY - buyY))
      : gain
    const tax = taxableGain * 0.25
    setAppResult({ gain, taxableGain, tax, effectiveRate: (tax / gain) * 100 })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מחשבון</div>
        <h1 className="section-title">מסים בנדל"ן</h1>
        <p className="section-sub">מס רכישה ומס שבח</p>
      </div>

      <div className="flex bg-card rounded-2xl shadow-soft p-1 gap-1">
        {[{ id: 'purchase' as const, label: 'מס רכישה' }, { id: 'appreciation' as const, label: 'מס שבח' }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id ? 'bronze-gradient text-white shadow-gold' : 'text-ink-muted hover:text-ink'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'purchase' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="label">מחיר הנכס (₪)</label>
              <input className="input-field" placeholder="2,000,000" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: true, label: 'דירה יחידה', sub: 'מדרגות מופחתות' }, { val: false, label: 'דירה נוספת', sub: '8%–10% מהשקל הראשון' }].map(opt => (
                <button key={String(opt.val)} onClick={() => setIsFirstHome(opt.val)}
                  className={`p-3 rounded-2xl border-2 text-sm transition-all ${
                    isFirstHome === opt.val ? 'border-bronze bg-bronze/5 text-bronze' : 'border-cream-dark text-ink-muted'
                  }`}>
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
            <button className="btn-bronze w-full" onClick={calcPurchase}>חשב מס רכישה</button>
          </div>

          {purchaseResult && (
            <div className="space-y-4">
              <div className="card text-center py-8">
                <div className="text-ink-faint text-xs uppercase tracking-widest mb-2">מס רכישה לתשלום</div>
                <div className="text-5xl font-black text-ink mb-1">₪{fmt(purchaseResult.tax)}</div>
                {buyPrice && (
                  <div className="text-bronze text-sm">{((purchaseResult.tax / parseFloat(buyPrice.replace(/,/g, ''))) * 100).toFixed(2)}% ממחיר הנכס</div>
                )}
              </div>
              <div className="card space-y-2">
                <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-3">פירוט מדרגות</div>
                {purchaseResult.breakdown.map((b, i) => (
                  <div key={i} className="flex justify-between text-sm py-2 border-b border-cream-dark last:border-0">
                    <span className="text-ink-muted">{b.range} <span className="text-ink-faint">({b.rate})</span></span>
                    <span className={b.amount > 0 ? 'font-medium text-ink' : 'text-ink-faint'}>
                      {b.amount > 0 ? `₪${fmt(b.amount)}` : 'פטור'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'appreciation' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">מחיר מכירה (₪)</label><input className="input-field" placeholder="2,500,000" value={salePrice} onChange={e => setSalePrice(e.target.value)} /></div>
              <div><label className="label">מחיר רכישה מקורי (₪)</label><input className="input-field" placeholder="1,500,000" value={origPrice} onChange={e => setOrigPrice(e.target.value)} /></div>
              <div><label className="label">עלויות שיפורים (₪)</label><input className="input-field" placeholder="100,000" value={improveCost} onChange={e => setImproveCost(e.target.value)} /></div>
              <div><label className="label">שנת רכישה</label><input className="input-field" placeholder="2010" value={buyYear} onChange={e => setBuyYear(e.target.value)} /></div>
            </div>
            <button onClick={() => setIsExempt(!isExempt)}
              className={`w-full p-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                isExempt ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-cream-dark text-ink-muted'
              }`}>
              {isExempt ? '✓ ' : ''}זכאות לפטור — דירה יחידה, לא נוצל פטור ב-4 שנים
            </button>
            <button className="btn-bronze w-full" onClick={calcAppreciation}>חשב מס שבח</button>
          </div>

          {appResult && (
            <div className="space-y-4">
              {isExempt || appResult.gain <= 0 ? (
                <div className="card border-2 border-emerald-200 bg-emerald-50 text-center py-8">
                  <div className="text-4xl mb-2">✓</div>
                  <div className="text-emerald-700 font-bold text-lg">
                    {appResult.gain <= 0 ? 'אין רווח — אין מס שבח' : 'פטור ממס שבח!'}
                  </div>
                  {appResult.gain > 0 && <div className="text-ink-muted text-sm mt-1">רווח הון: ₪{fmt(appResult.gain)}</div>}
                </div>
              ) : (
                <>
                  <div className="card text-center py-8">
                    <div className="text-ink-faint text-xs uppercase tracking-widest mb-2">מס שבח (25%)</div>
                    <div className="text-5xl font-black text-ink mb-1">₪{fmt(appResult.tax)}</div>
                    <div className="text-bronze text-sm">שיעור אפקטיבי: {appResult.effectiveRate.toFixed(1)}%</div>
                  </div>
                  <div className="card space-y-2">
                    {[
                      { label: 'רווח הון כולל', value: `₪${fmt(appResult.gain)}` },
                      { label: 'חלק חייב (לאחר 2014)', value: `₪${fmt(appResult.taxableGain)}` },
                      { label: 'שיעור מס שבח', value: '25%' },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm py-2 border-b border-cream-dark last:border-0">
                        <span className="text-ink-muted">{r.label}</span>
                        <span className="font-medium text-ink">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card-flat text-xs text-ink-faint leading-relaxed">
        * המידע מוצג לצרכי הדרכה בלבד. שיעורי מס נכונים ל-2024. התייעץ עם עו"ד/יועץ מס לפני כל עסקה.
      </div>
    </div>
  )
}
