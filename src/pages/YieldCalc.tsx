import { useState } from 'react'

function fmt(n: number) {
  return n.toLocaleString('he-IL', { maximumFractionDigits: 0 })
}

export default function YieldCalc() {
  const [price, setPrice] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [expenses, setExpenses] = useState('')
  const [vacancyMonths, setVacancyMonths] = useState('1')
  const [result, setResult] = useState<null | {
    grossYield: number
    netYield: number
    annualRent: number
    annualExpenses: number
    annualNet: number
    paybackYears: number
  }>(null)

  const calculate = () => {
    const p = parseFloat(price.replace(/,/g, ''))
    const rent = parseFloat(monthlyRent.replace(/,/g, ''))
    const exp = parseFloat(expenses.replace(/,/g, '')) || 0
    const vacancy = parseFloat(vacancyMonths) || 0

    if (!p || !rent) return

    const effectiveMonths = 12 - vacancy
    const annualRent = rent * effectiveMonths
    const annualExpenses = exp * 12
    const annualNet = annualRent - annualExpenses
    const grossYield = (annualRent / p) * 100
    const netYield = (annualNet / p) * 100
    const paybackYears = annualNet > 0 ? p / annualNet : 0

    setResult({ grossYield, netYield, annualRent, annualExpenses, annualNet, paybackYears })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">📈 מחשבון תשואה</h1>
        <p className="section-sub">חשב תשואה ברוטו ונטו על הנכס שלך</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">מחיר הנכס (₪)</label>
            <input
              className="input-field"
              placeholder="1,500,000"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="label">שכירות חודשית (₪)</label>
            <input
              className="input-field"
              placeholder="4,500"
              value={monthlyRent}
              onChange={e => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className="label">הוצאות חודשיות (ועד, ביטוח, אחזקה) (₪)</label>
            <input
              className="input-field"
              placeholder="500"
              value={expenses}
              onChange={e => setExpenses(e.target.value)}
            />
          </div>
          <div>
            <label className="label">חודשי ריקנות צפויים בשנה</label>
            <select
              className="input-field"
              value={vacancyMonths}
              onChange={e => setVacancyMonths(e.target.value)}
            >
              {[0, 0.5, 1, 1.5, 2, 3].map(v => (
                <option key={v} value={v}>{v} חודשים</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-gold w-full" onClick={calculate}>
          חשב תשואה
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Main yields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="result-box text-center">
              <div className="text-gray-400 text-sm mb-1">תשואה ברוטו</div>
              <div className={`text-4xl font-black ${result.grossYield >= 5 ? 'text-green-400' : result.grossYield >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                {result.grossYield.toFixed(2)}%
              </div>
            </div>
            <div className="result-box text-center">
              <div className="text-gray-400 text-sm mb-1">תשואה נטו</div>
              <div className={`text-4xl font-black ${result.netYield >= 4 ? 'text-green-400' : result.netYield >= 2.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {result.netYield.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="card space-y-3">
            <h3 className="font-bold text-gold text-sm uppercase tracking-wide">פירוט שנתי</h3>
            <div className="space-y-2">
              {[
                { label: 'הכנסה שנתית משכירות', value: `₪${fmt(result.annualRent)}`, color: 'text-green-400' },
                { label: 'הוצאות שנתיות', value: `₪${fmt(result.annualExpenses)}`, color: 'text-red-400' },
                { label: 'רווח נטו שנתי', value: `₪${fmt(result.annualNet)}`, color: 'text-gold' },
                { label: 'החזר השקעה בשנים', value: `${result.paybackYears.toFixed(1)} שנים`, color: 'text-white' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center border-b border-dark-border pb-2">
                  <span className="text-gray-400 text-sm">{row.label}</span>
                  <span className={`font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benchmark */}
          <div className="card">
            <h3 className="font-bold text-gold text-sm mb-3">מדד תשואה</h3>
            <div className="space-y-2">
              {[
                { label: 'פחות מ-3%', status: 'חלש', color: 'bg-red-500' },
                { label: '3% – 5%', status: 'סביר', color: 'bg-yellow-500' },
                { label: '5% – 7%', status: 'טוב', color: 'bg-green-500' },
                { label: 'מעל 7%', status: 'מצוין', color: 'bg-emerald-400' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3 text-sm">
                  <div className={`w-3 h-3 rounded-full ${b.color}`} />
                  <span className="text-gray-400">{b.label}</span>
                  <span className="text-white font-medium">— {b.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
