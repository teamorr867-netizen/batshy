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
    grossYield: number; netYield: number; annualRent: number
    annualExpenses: number; annualNet: number; paybackYears: number
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

  const yieldColor = (y: number) =>
    y >= 5 ? 'text-emerald-600' : y >= 3 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מחשבון</div>
        <h1 className="section-title">תשואה על נכס</h1>
        <p className="section-sub">חשב תשואה ברוטו ונטו על הנכס שלך</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">מחיר הנכס (₪)</label>
            <input className="input-field" placeholder="1,500,000" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
          <div>
            <label className="label">שכירות חודשית (₪)</label>
            <input className="input-field" placeholder="4,500" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} />
          </div>
          <div>
            <label className="label">הוצאות חודשיות (₪)</label>
            <input className="input-field" placeholder="500" value={expenses} onChange={e => setExpenses(e.target.value)} />
          </div>
          <div>
            <label className="label">חודשי ריקנות בשנה</label>
            <select className="input-field" value={vacancyMonths} onChange={e => setVacancyMonths(e.target.value)}>
              {[0, 0.5, 1, 1.5, 2, 3].map(v => (
                <option key={v} value={v}>{v} חודשים</option>
              ))}
            </select>
          </div>
        </div>
        <button className="btn-bronze w-full" onClick={calculate}>חשב תשואה</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'תשואה ברוטו', value: result.grossYield },
              { label: 'תשואה נטו', value: result.netYield },
            ].map(item => (
              <div key={item.label} className="card text-center py-6">
                <div className="text-ink-muted text-xs mb-2 uppercase tracking-wide">{item.label}</div>
                <div className={`text-4xl font-black ${yieldColor(item.value)}`}>
                  {item.value.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          <div className="card space-y-3">
            <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-2">פירוט שנתי</div>
            {[
              { label: 'הכנסה שנתית', value: `₪${fmt(result.annualRent)}`, color: 'text-emerald-600' },
              { label: 'הוצאות שנתיות', value: `₪${fmt(result.annualExpenses)}`, color: 'text-red-500' },
              { label: 'רווח נטו שנתי', value: `₪${fmt(result.annualNet)}`, color: 'text-bronze font-bold' },
              { label: 'החזר השקעה', value: `${result.paybackYears.toFixed(1)} שנים`, color: 'text-ink' },
            ].map(row => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b border-cream-dark last:border-0">
                <span className="text-ink-muted text-sm">{row.label}</span>
                <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="card-flat space-y-2">
            <div className="text-xs font-bold text-ink-faint tracking-widest uppercase mb-3">מדד תשואה</div>
            {[
              { label: 'פחות מ-3%', status: 'חלש', color: 'bg-red-400' },
              { label: '3% – 5%', status: 'סביר', color: 'bg-amber-400' },
              { label: '5% – 7%', status: 'טוב', color: 'bg-emerald-500' },
              { label: 'מעל 7%', status: 'מצוין', color: 'bg-emerald-400' },
            ].map(b => (
              <div key={b.label} className="flex items-center gap-3 text-sm">
                <div className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                <span className="text-ink-muted">{b.label}</span>
                <span className="text-ink font-medium">— {b.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
