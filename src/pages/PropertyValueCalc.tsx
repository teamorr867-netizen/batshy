import { useState } from 'react'

function fmt(n: number) { return n.toLocaleString('he-IL', { maximumFractionDigits: 0 }) }

const CITIES: Record<string, { label: string; pricePerSqm: number }> = {
  'tel-aviv': { label: 'תל אביב', pricePerSqm: 52000 },
  'ramat-gan': { label: 'רמת גן / גבעתיים', pricePerSqm: 32000 },
  'herzliya': { label: 'הרצליה / רעננה', pricePerSqm: 25000 },
  'jerusalem': { label: 'ירושלים', pricePerSqm: 23000 },
  'rehovot': { label: 'רחובות / נס ציונה', pricePerSqm: 18000 },
  'rishon': { label: 'ראשון לציון / פ"ת', pricePerSqm: 17000 },
  'haifa': { label: 'חיפה', pricePerSqm: 14000 },
  'netanya': { label: 'נתניה / חדרה', pricePerSqm: 14000 },
  'ashkelon': { label: 'אשקלון / אשדוד', pricePerSqm: 12000 },
  'beer-sheva': { label: 'באר שבע', pricePerSqm: 9000 },
  'other': { label: 'אחר (ממוצע ארצי)', pricePerSqm: 13000 },
}
const ROOM_MULT: Record<string, number> = {
  '1': 0.78, '1.5': 0.82, '2': 0.86, '2.5': 0.91, '3': 0.95, '3.5': 0.98,
  '4': 1.00, '4.5': 1.04, '5': 1.08, '5.5': 1.12, '6': 1.16, '7+': 1.22,
}
const CONDITION_MULT: Record<string, number> = {
  ruin: 0.80, old: 0.90, average: 1.00, renovated: 1.10, new: 1.22,
}

export default function PropertyValueCalc() {
  const [city, setCity] = useState('tel-aviv')
  const [sqm, setSqm] = useState('')
  const [rooms, setRooms] = useState('4')
  const [floor, setFloor] = useState('3')
  const [condition, setCondition] = useState('average')
  const [parking, setParking] = useState(false)
  const [storage, setStorage] = useState(false)
  const [balcony, setBalcony] = useState('')
  const [result, setResult] = useState<null | { low: number; mid: number; high: number; pricePerSqm: number }>(null)

  const calculate = () => {
    const s = parseFloat(sqm)
    if (!s) return
    const cityData = CITIES[city]
    const roomMult = ROOM_MULT[rooms] || 1
    const condMult = CONDITION_MULT[condition] || 1
    const floorN = parseFloat(floor)
    const floorMult = floorN === 0 ? 0.92 : floorN === 1 ? 0.95 : floorN === 2 ? 0.97 : floorN >= 5 ? 1.03 : 1.00
    const base = s * cityData.pricePerSqm * roomMult * condMult * floorMult
    const balconySqm = parseFloat(balcony) || 0
    const extras = (parking ? 65000 : 0) + (storage ? 20000 : 0) + balconySqm * 2500
    const mid = base + extras
    setResult({ low: mid * 0.90, mid, high: mid * 1.10, pricePerSqm: mid / s })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">מחשבון</div>
        <h1 className="section-title">הערכת שווי נכס</h1>
        <p className="section-sub">הערכת מחיר לפי אזור, גודל ומאפיינים</p>
      </div>

      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">עיר / אזור</label>
            <select className="input-field" value={city} onChange={e => setCity(e.target.value)}>
              {Object.entries(CITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">שטח (מ"ר)</label>
            <input className="input-field" placeholder="80" value={sqm} onChange={e => setSqm(e.target.value)} />
          </div>
          <div>
            <label className="label">מספר חדרים</label>
            <select className="input-field" value={rooms} onChange={e => setRooms(e.target.value)}>
              {Object.keys(ROOM_MULT).map(r => <option key={r} value={r}>{r} חדרים</option>)}
            </select>
          </div>
          <div>
            <label className="label">קומה</label>
            <select className="input-field" value={floor} onChange={e => setFloor(e.target.value)}>
              {['קרקע', '1', '2', '3', '4', '5', '6', '7', '8+'].map((f, i) => (
                <option key={i} value={i}>{f === 'קרקע' ? 'קרקע' : `קומה ${f}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">מצב הנכס</label>
            <select className="input-field" value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="ruin">דורש שיפוץ מקיף</option>
              <option value="old">ישן / לא משופץ</option>
              <option value="average">ממוצע</option>
              <option value="renovated">משופץ</option>
              <option value="new">חדש / יוקרה</option>
            </select>
          </div>
          <div>
            <label className="label">שטח מרפסת (מ"ר)</label>
            <input className="input-field" placeholder="12" value={balcony} onChange={e => setBalcony(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'חניה', state: parking, set: setParking },
            { label: 'מחסן', state: storage, set: setStorage },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => opt.set(!opt.state)}
              className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                opt.state ? 'border-bronze bg-bronze/5 text-bronze' : 'border-cream-dark text-ink-muted'
              }`}
            >
              {opt.state ? '✓ ' : ''}{opt.label}
            </button>
          ))}
        </div>

        <button className="btn-bronze w-full" onClick={calculate}>הערך שווי</button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="card text-center py-8">
            <div className="text-ink-faint text-xs uppercase tracking-widest mb-2">הערכת שווי משוערת</div>
            <div className="text-5xl font-black text-ink mb-1">₪{fmt(result.mid)}</div>
            <div className="text-bronze text-sm font-medium">₪{fmt(result.pricePerSqm)} למ"ר</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="result-box text-center">
              <div className="text-ink-faint text-xs mb-1">טווח נמוך</div>
              <div className="font-bold text-ink">₪{fmt(result.low)}</div>
            </div>
            <div className="result-box text-center">
              <div className="text-ink-faint text-xs mb-1">טווח גבוה</div>
              <div className="font-bold text-ink">₪{fmt(result.high)}</div>
            </div>
          </div>

          <div className="card-flat text-sm text-ink-muted leading-relaxed">
            ⚠️ הערכה זו מבוססת על ממוצעי שוק. להערכה מדויקת בדוק עסקאות ספציפיות ב{CITIES[city].label}.
          </div>
        </div>
      )}
    </div>
  )
}
