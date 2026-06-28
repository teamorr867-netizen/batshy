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
    loan: number; monthly: number; totalPaid: number
    totalInterest: number; ltv: number; feasible: boolean; maxLoan: number
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
    const monthly = r > 0
      ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loan / n
    const totalPaid = monthly * n
    const totalInterest = totalPaid - loan
    setResult({ loan, monthly, totalPaid, totalInterest, ltv, feasible, maxLoan })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מחשבון</div>
        <h1 className="section-title">משכנתא</h1>
        <p className="section-sub">בדוק החזרים חודשיים וכדאיות</p>
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
            <label className="label">תקופה (שנים)</label>
            <select className="input-field" value={years} onChange={e => setYears(e.target.value)}>
              {[10, 15, 20, 25, 30].map(y => <option key={y} value={y}>{y} שנים</option>)}
            </select>
          </div>
        </div>
        <button className="btn-bronze w-full" onClick={calculate}>חשב משכנתא</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={`card border-2 ${result.feasible ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg
                ${result.feasible ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                {result.feasible ? '✓' : '✕'}
              </div>
              <div>
                <div className={`font-bold ${result.feasible ? 'text-emerald-700' : 'text-red-600'}`}>
                  {result.feasible ? 'המשכנתא אפשרית' : 'המשכנתא אינה אפשרית'}
                </div>
                <div className="text-ink-muted text-xs mt-0.5">
                  יחס מימון: {result.ltv.toFixed(1)}% (מקסימום 75%)
                </div>
              </div>
            </div>
          </div>

          <div className="card text-center py-8">
            <div className="text-ink-muted text-xs uppercase tracking-widest mb-2">החזר חודשי</div>
            <div className="text-5xl font-black text-ink mb-1">₪{fmt(result.monthly)}</div>
            <div className="text-ink-faint text-sm">לחודש למשך {years} שנים</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'סכום הלוואה', value: `₪${fmt(result.loan)}` },
              { label: 'סה"כ תשלום', value: `₪${fmt(result.totalPaid)}` },
              { label: 'סה"כ ריבית', value: `₪${fmt(result.totalInterest)}` },
              { label: 'יחס מימון', value: `${result.ltv.toFixed(1)}%` },
            ].map(item => (
              <div key={item.label} className="result-box text-center">
                <div className="text-ink-faint text-xs mb-1">{item.label}</div>
                <div className="font-bold text-ink">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="card-flat">
            <div className="text-xs font-bold text-bronze mb-2">✦ טיפ מ-FOCUS</div>
            <p className="text-ink-muted text-sm leading-relaxed">
              עם ריבית {rate}% ל-{years} שנה, תשלם ₪{fmt(result.totalInterest)} ריבית בלבד —
              {result.totalInterest > result.loan * 0.5
                ? ' שקול לקצר את התקופה לחיסכון משמעותי.'
                : ' יחס ריבית סביר.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
