import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

function calcPurchaseTax(price: number, isFirstHome: boolean): { tax: number; breakdown: { range: string; amount: number; rate: string }[] } {
  const breakdown: { range: string; amount: number; rate: string }[] = []
  let tax = 0

  if (isFirstHome) {
    const brackets = [
      { limit: 1978745, rate: 0, label: '0%' },
      { limit: 2347495, rate: 0.035, label: '3.5%' },
      { limit: 6055070, rate: 0.05, label: '5%' },
      { limit: 20183565, rate: 0.08, label: '8%' },
      { limit: Infinity, rate: 0.10, label: '10%' },
    ]
    let prev = 0
    for (const b of brackets) {
      if (price > prev) {
        const taxable = Math.min(price - prev, b.limit - prev)
        const amount = taxable * b.rate
        tax += amount
        if (taxable > 0) {
          breakdown.push({
            range: `₪${fmt(prev)} – ${b.limit === Infinity ? '∞' : '₪' + fmt(b.limit)}`,
            amount,
            rate: b.label,
          })
        }
        prev = b.limit
      }
    }
  } else {
    const brackets = [
      { limit: 6055070, rate: 0.08, label: '8%' },
      { limit: Infinity, rate: 0.10, label: '10%' },
    ]
    let prev = 0
    for (const b of brackets) {
      if (price > prev) {
        const taxable = Math.min(price - prev, b.limit - prev)
        const amount = taxable * b.rate
        tax += amount
        if (taxable > 0) {
          breakdown.push({ range: `₪${fmt(prev)} – ${b.limit === Infinity ? '∞' : '₪' + fmt(b.limit)}`, amount, rate: b.label })
        }
        prev = b.limit
      }
    }
  }
  return { tax, breakdown }
}

export default function TaxCalc() {
  const [activeTab, setActiveTab] = useState<'purchase' | 'appreciation'>('purchase')
  // Purchase tax state
  const [buyPrice, setBuyPrice] = useState('')
  const [isFirstHome, setIsFirstHome] = useState(true)
  const [purchaseResult, setPurchaseResult] = useState<null | { tax: number; breakdown: { range: string; amount: number; rate: string }[] }>(null)
  // Appreciation tax state
  const [salePrice, setSalePrice] = useState('')
  const [origPrice, setOrigPrice] = useState('')
  const [improveCost, setImproveCost] = useState('')
  const [buyYear, setBuyYear] = useState('')
  const [saleYear, setSaleYear] = useState(new Date().getFullYear().toString())
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
    const saleY = parseInt(saleYear) || 2024

    if (!sale || !orig) return

    const gain = sale - orig - improve
    if (gain <= 0) {
      setAppResult({ gain, taxableGain: 0, tax: 0, effectiveRate: 0 })
      return
    }

    if (isExempt) {
      setAppResult({ gain, taxableGain: 0, tax: 0, effectiveRate: 0 })
      return
    }

    // Linear calculation for properties bought before Jan 2014
    let taxableGain = gain
    const REFORM_YEAR = 2014
    if (buyY < REFORM_YEAR) {
      const totalYears = saleY - buyY
      const postReformYears = saleY - REFORM_YEAR
      const ratio = totalYears > 0 ? postReformYears / totalYears : 1
      taxableGain = gain * ratio
    }

    const tax = taxableGain * 0.25
    const effectiveRate = (tax / gain) * 100

    setAppResult({ gain, taxableGain, tax, effectiveRate })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">📋 מחשבון מסים</h1>
        <p className="section-sub">מס רכישה ומס שבח בנדל"ן</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-card border border-dark-border rounded-xl p-1">
        {[
          { id: 'purchase' as const, label: 'מס רכישה' },
          { id: 'appreciation' as const, label: 'מס שבח' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id ? 'gold-gradient text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Purchase Tax */}
      {activeTab === 'purchase' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div>
              <label className="label">מחיר הנכס (₪)</label>
              <input className="input-field" placeholder="2,000,000" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
            </div>
            <div className="flex gap-3">
              {[
                { val: true, label: 'דירה יחידה', sub: 'מדרגות מופחתות' },
                { val: false, label: 'דירה נוספת', sub: '8%-10% מהשקל הראשון' },
              ].map(opt => (
                <button
                  key={String(opt.val)}
                  onClick={() => setIsFirstHome(opt.val)}
                  className={`flex-1 p-3 rounded-xl border text-sm transition-all ${
                    isFirstHome === opt.val
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-dark-border text-gray-400'
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
            <button className="btn-gold w-full" onClick={calcPurchase}>חשב מס רכישה</button>
          </div>

          {purchaseResult && (
            <div className="space-y-4">
              <div className="result-box text-center py-6">
                <div className="text-gray-400 text-sm mb-1">מס רכישה לתשלום</div>
                <div className="text-5xl font-black text-gold">₪{fmt(purchaseResult.tax)}</div>
                <div className="text-gray-500 text-sm mt-1">
                  {buyPrice && `${((purchaseResult.tax / parseFloat(buyPrice.replace(/,/g, ''))) * 100).toFixed(2)}% ממחיר הנכס`}
                </div>
              </div>
              {purchaseResult.breakdown.length > 0 && (
                <div className="card space-y-2">
                  <h3 className="text-gold text-sm font-bold uppercase tracking-wide">פירוט מדרגות</h3>
                  {purchaseResult.breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-dark-border pb-2 text-sm">
                      <span className="text-gray-400">{b.range} <span className="text-gray-600">({b.rate})</span></span>
                      <span className={`font-medium ${b.amount > 0 ? 'text-white' : 'text-gray-600'}`}>
                        {b.amount > 0 ? `₪${fmt(b.amount)}` : 'פטור'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Appreciation Tax */}
      {activeTab === 'appreciation' && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">מחיר מכירה (₪)</label>
                <input className="input-field" placeholder="2,500,000" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
              </div>
              <div>
                <label className="label">מחיר רכישה מקורי (₪)</label>
                <input className="input-field" placeholder="1,500,000" value={origPrice} onChange={e => setOrigPrice(e.target.value)} />
              </div>
              <div>
                <label className="label">עלויות שיפורים / שיפוץ (₪)</label>
                <input className="input-field" placeholder="100,000" value={improveCost} onChange={e => setImproveCost(e.target.value)} />
              </div>
              <div>
                <label className="label">שנת רכישה</label>
                <input className="input-field" placeholder="2010" value={buyYear} onChange={e => setBuyYear(e.target.value)} />
              </div>
            </div>
            <button
              onClick={() => setIsExempt(!isExempt)}
              className={`w-full p-3 rounded-xl border text-sm font-medium transition-all ${
                isExempt ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-dark-border text-gray-400'
              }`}
            >
              {isExempt ? '✅' : '⬜'} זכאות לפטור ממס שבח (דירה יחידה, לא נוצל פטור ב-4 שנים)
            </button>
            <button className="btn-gold w-full" onClick={calcAppreciation}>חשב מס שבח</button>
          </div>

          {appResult && (
            <div className="space-y-4">
              {isExempt || appResult.gain <= 0 ? (
                <div className="card border-green-500/40 bg-green-500/5">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-green-400 font-bold text-lg">
                      {appResult.gain <= 0 ? 'אין רווח — אין מס שבח' : 'פטור ממס שבח!'}
                    </div>
                    {appResult.gain > 0 && <div className="text-gray-400 text-sm mt-1">רווח הון: ₪{fmt(appResult.gain)}</div>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="result-box text-center py-6">
                    <div className="text-gray-400 text-sm mb-1">מס שבח לתשלום (25%)</div>
                    <div className="text-5xl font-black text-gold">₪{fmt(appResult.tax)}</div>
                    <div className="text-gray-500 text-sm mt-1">שיעור אפקטיבי: {appResult.effectiveRate.toFixed(1)}%</div>
                  </div>
                  <div className="card space-y-3">
                    <h3 className="text-gold text-sm font-bold">פירוט</h3>
                    {[
                      { label: 'רווח הון כולל', value: `₪${fmt(appResult.gain)}` },
                      { label: 'חלק חייב במס (לאחר 2014)', value: `₪${fmt(appResult.taxableGain)}` },
                      { label: 'שיעור מס שבח', value: '25%' },
                      { label: 'מס לתשלום', value: `₪${fmt(appResult.tax)}` },
                    ].map(r => (
                      <div key={r.label} className="flex justify-between text-sm border-b border-dark-border pb-2">
                        <span className="text-gray-400">{r.label}</span>
                        <span className="text-white font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card border-gold/10">
        <p className="text-gray-600 text-xs">
          * המידע מוצג לצרכי הדרכה בלבד. שיעורי מס רכישה נכונים לשנת 2024. יש להתייעץ עם עו"ד / יועץ מס לפני כל עסקה.
        </p>
      </div>
    </div>
  )
}
