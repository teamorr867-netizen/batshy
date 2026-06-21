import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

export default function MortgageCalc() {
  const [propertyPrice, setPropertyPrice] = useState('')
  const [equity, setEquity] = useState('')
  const [rate, setRate] = useState('4.5')
  const [years, setYears] = useState('25')
  const [result, setResult] = useState<null | {
    loan: number
    monthly: number
    totalPaid: number
    totalInterest: number
    ltv: number
    feasible: boolean
    maxLoan: number
  }>(null)

  const calculate = () => {
    const price = parseFloat(propertyPrice.replace(/,/g, ''))
    const eq = parseFloat(equity.replace(/,/g, ''))
    const r = parseFloat(rate) / 100 / 12
    const n = parseFloat(years) * 12

    if (!price || !eq) return

    const loan = price - eq
    const ltv = (loan / price) * 100
    const maxLoan = price * 0.75
    const feasible = loan <= maxLoan && eq >= price * 0.25

    let monthly = 0
    if (r > 0) {
      monthly = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    } else {
      monthly = loan / n
    }

    const totalPaid = monthly * n
    const totalInterest = totalPaid - loan

    setResult({ loan, monthly, totalPaid, totalInterest, ltv, feasible, maxLoan })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">🏦 מחשבון משכנתא</h1>
        <p className="section-sub">בדוק החזרים חודשיים וכדאיות משכנתא</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">שווי הנכס (₪)</label>
            <input className="input-field" placeholder="2,000,000" value={propertyPrice} onChange={e => setPropertyPrice(e.target.value)} />
          </div>
          <div>
            <label className="label">הון עצמי (₪)</label>
            <input className="input-field" placeholder="500,000" value={equity} onChange={e => setEquity(e.target.value)} />
          </div>
          <div>
            <label className="label">ריבית שנתית (%)</label>
            <input className="input-field" type="number" step="0.1" min="0" max="20" value={rate} onChange={e => setRate(e.target.value)} />
          </div>
          <div>
            <label className="label">תקופת הלוואה (שנים)</label>
            <select className="input-field" value={years} onChange={e => setYears(e.target.value)}>
              {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} שנים</option>)}
            </select>
          </div>
        </div>
        <button className="btn-gold w-full" onClick={calculate}>חשב משכנתא</button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Feasibility */}
          <div className={`card border ${result.feasible ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{result.feasible ? '✅' : '❌'}</span>
              <div>
                <div className={`font-bold text-lg ${result.feasible ? 'text-green-400' : 'text-red-400'}`}>
                  {result.feasible ? 'המשכנתא אפשרית' : 'המשכנתא אינה אפשרית'}
                </div>
                <div className="text-gray-400 text-sm">
                  {result.feasible
                    ? `יחס מימון: ${result.ltv.toFixed(1)}% (מקסימום 75%)`
                    : `נדרש הון עצמי מינימלי: ₪${fmt(result.maxLoan * 0.25 + (parseFloat(propertyPrice.replace(/,/g, '')) - result.loan * 1))} — יחס מימון נוכחי: ${result.ltv.toFixed(1)}%`
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Monthly payment highlight */}
          <div className="result-box text-center py-6">
            <div className="text-gray-400 text-sm mb-1">החזר חודשי</div>
            <div className="text-5xl font-black text-gold">₪{fmt(result.monthly)}</div>
            <div className="text-gray-500 text-sm mt-2">לחודש למשך {years} שנים</div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'סכום הלוואה', value: `₪${fmt(result.loan)}`, sub: `${result.ltv.toFixed(1)}% מימון` },
              { label: 'סה"כ תשלום', value: `₪${fmt(result.totalPaid)}`, sub: 'על כל התקופה' },
              { label: 'סה"כ ריבית', value: `₪${fmt(result.totalInterest)}`, sub: `${((result.totalInterest / result.loan) * 100).toFixed(0)}% מהקרן` },
              { label: 'יחס מימון', value: `${result.ltv.toFixed(1)}%`, sub: result.ltv <= 75 ? 'תקין' : 'גבוה מהמותר' },
            ].map(item => (
              <div key={item.label} className="result-box">
                <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                <div className="text-xl font-bold text-white">{item.value}</div>
                <div className="text-gray-600 text-xs mt-1">{item.sub}</div>
              </div>
            ))}
          </div>

          {/* Amortization info */}
          <div className="card">
            <h3 className="font-bold text-gold text-sm mb-3">טיפ מהרובוט</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              עם ריבית של {rate}% ל-{years} שנה, תשלם ₪{fmt(result.totalInterest)} ריבית בלבד.
              {result.totalInterest > result.loan * 0.5 && ' שקול לקצר את תקופת ההלוואה לחיסכון משמעותי בריבית.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
