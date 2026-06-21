import { useState, useRef } from 'react'

function todayStr() {
  const d = new Date()
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function hebrewDate(dateStr: string) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
  return `${parseInt(d)} ב${months[parseInt(m) - 1]} ${y}`
}

interface FormData {
  sellerName: string
  sellerId: string
  sellerPhone: string
  buyerName: string
  buyerId: string
  buyerPhone: string
  propertyAddress: string
  city: string
  rooms: string
  floor: string
  sqm: string
  blockParcel: string
  salePrice: string
  downPayment: string
  downPaymentDate: string
  balanceDate: string
  transferDate: string
  contractDate: string
  agentName: string
  agentLicense: string
  agentCommission: string
  mortgageBank: string
  mortgageAmount: string
}

const INITIAL: FormData = {
  sellerName: '', sellerId: '', sellerPhone: '',
  buyerName: '', buyerId: '', buyerPhone: '',
  propertyAddress: '', city: '', rooms: '', floor: '', sqm: '', blockParcel: '',
  salePrice: '', downPayment: '', downPaymentDate: '', balanceDate: '', transferDate: '',
  contractDate: todayStr(),
  agentName: '', agentLicense: '', agentCommission: '',
  mortgageBank: '', mortgageAmount: '',
}

export default function SaleContract() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [showContract, setShowContract] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const fmt = (n: string) => {
    const num = parseFloat(n.replace(/,/g, ''))
    return isNaN(num) ? n : num.toLocaleString('he-IL')
  }

  const balance = () => {
    const sale = parseFloat(form.salePrice.replace(/,/g, ''))
    const down = parseFloat(form.downPayment.replace(/,/g, ''))
    if (!sale || !down) return ''
    return (sale - down).toLocaleString('he-IL')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">🤝 חוזה מכירה</h1>
        <p className="section-sub">חוזה מכר דירה — מלא פרטים וצור חוזה להדפסה</p>
      </div>

      {!showContract ? (
        <div className="space-y-6">
          {/* Seller */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי המוכר</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם מלא</label><input className="input-field" placeholder="ישראל ישראלי" value={form.sellerName} onChange={set('sellerName')} /></div>
              <div><label className="label">מספר ת.ז.</label><input className="input-field" placeholder="123456789" value={form.sellerId} onChange={set('sellerId')} /></div>
              <div><label className="label">טלפון</label><input className="input-field" placeholder="050-0000000" value={form.sellerPhone} onChange={set('sellerPhone')} /></div>
            </div>
          </div>

          {/* Buyer */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי הקונה</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם מלא</label><input className="input-field" placeholder="שרה כהן" value={form.buyerName} onChange={set('buyerName')} /></div>
              <div><label className="label">מספר ת.ז.</label><input className="input-field" placeholder="987654321" value={form.buyerId} onChange={set('buyerId')} /></div>
              <div><label className="label">טלפון</label><input className="input-field" placeholder="052-0000000" value={form.buyerPhone} onChange={set('buyerPhone')} /></div>
            </div>
          </div>

          {/* Property */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי הנכס</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">כתובת מלאה (רחוב + מספר + דירה)</label><input className="input-field" placeholder="רחוב הרצל 1, דירה 5" value={form.propertyAddress} onChange={set('propertyAddress')} /></div>
              <div><label className="label">עיר</label><input className="input-field" placeholder="תל אביב" value={form.city} onChange={set('city')} /></div>
              <div><label className="label">גוש / חלקה</label><input className="input-field" placeholder="6601 / 123" value={form.blockParcel} onChange={set('blockParcel')} /></div>
              <div><label className="label">שטח (מ"ר)</label><input className="input-field" placeholder="80" value={form.sqm} onChange={set('sqm')} /></div>
              <div><label className="label">מספר חדרים</label><input className="input-field" placeholder="3.5" value={form.rooms} onChange={set('rooms')} /></div>
              <div><label className="label">קומה</label><input className="input-field" placeholder="3" value={form.floor} onChange={set('floor')} /></div>
            </div>
          </div>

          {/* Payment */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">תנאי תשלום</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">מחיר מכירה (₪)</label><input className="input-field" placeholder="2,000,000" value={form.salePrice} onChange={set('salePrice')} /></div>
              <div><label className="label">מקדמה / תשלום ראשון (₪)</label><input className="input-field" placeholder="200,000" value={form.downPayment} onChange={set('downPayment')} /></div>
              <div><label className="label">תאריך תשלום מקדמה</label><input type="date" className="input-field" value={form.downPaymentDate} onChange={set('downPaymentDate')} /></div>
              <div><label className="label">תאריך יתרת התשלום</label><input type="date" className="input-field" value={form.balanceDate} onChange={set('balanceDate')} /></div>
              <div><label className="label">תאריך מסירת החזקה</label><input type="date" className="input-field" value={form.transferDate} onChange={set('transferDate')} /></div>
            </div>
          </div>

          {/* Mortgage */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי משכנתא (אם רלוונטי)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">שם הבנק</label><input className="input-field" placeholder="בנק הפועלים" value={form.mortgageBank} onChange={set('mortgageBank')} /></div>
              <div><label className="label">סכום משכנתא (₪)</label><input className="input-field" placeholder="1,500,000" value={form.mortgageAmount} onChange={set('mortgageAmount')} /></div>
            </div>
          </div>

          {/* Agent */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי המתווך</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם המתווך</label><input className="input-field" placeholder="שם מלא" value={form.agentName} onChange={set('agentName')} /></div>
              <div><label className="label">מספר רישיון</label><input className="input-field" placeholder="12345" value={form.agentLicense} onChange={set('agentLicense')} /></div>
              <div><label className="label">עמלה (₪)</label><input className="input-field" placeholder="40,000" value={form.agentCommission} onChange={set('agentCommission')} /></div>
            </div>
          </div>

          <button className="btn-gold w-full text-lg py-4" onClick={() => setShowContract(true)}>
            צור חוזה מכירה ←
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 no-print">
            <button className="btn-gold flex-1 flex items-center justify-center gap-2" onClick={() => window.print()}>
              🖨️ הדפס / שמור PDF
            </button>
            <button
              className="flex-1 border border-dark-border text-gray-400 py-3 rounded-xl hover:border-gray-500 transition-colors"
              onClick={() => setShowContract(false)}
            >
              ← ערוך פרטים
            </button>
          </div>

          <div ref={printRef} className="print-contract bg-white text-black rounded-2xl p-8 md:p-12" dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', lineHeight: '1.8', color: '#000' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', borderBottom: '3px double black', paddingBottom: '12px', marginBottom: '8px' }}>
                חוזה מכר דירה
              </div>
              <div style={{ fontSize: '13px', color: '#555' }}>נערך ונחתם ביום {form.contractDate} בעיר {form.city || '___'}</div>
            </div>

            <p style={{ marginBottom: '16px' }}>
              <strong>בין:</strong> {form.sellerName || '___'} (ת.ז. {form.sellerId || '___'}) טל׳ {form.sellerPhone || '___'} — <strong>המוכר</strong>
            </p>
            <p style={{ marginBottom: '24px' }}>
              <strong>לבין:</strong> {form.buyerName || '___'} (ת.ז. {form.buyerId || '___'}) טל׳ {form.buyerPhone || '___'} — <strong>הקונה</strong>
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>1. הנכס הנמכר</h3>
            <p style={{ marginBottom: '20px' }}>
              המוכר מוכר לקונה את הדירה הנמצאת ב<strong>{form.propertyAddress || '___'}</strong>, עיר <strong>{form.city || '___'}</strong>,
              {form.blockParcel && ` גוש/חלקה ${form.blockParcel},`} קומה <strong>{form.floor || '___'}</strong>,
              {form.rooms || '___'} חדרים, שטח <strong>{form.sqm || '___'} מ"ר</strong> (להלן: "הדירה"),
              וכל הצמוד לה כפי שהיא ועל כל אשר בה ומחובר אליה.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>2. מחיר המכירה ותנאי תשלום</h3>
            <p style={{ marginBottom: '20px' }}>
              מחיר המכירה הכולל הינו <strong>₪{fmt(form.salePrice) || '___'}</strong>.
              התשלום יבוצע כדלקמן:
            </p>
            <ul style={{ marginRight: '20px', marginBottom: '20px' }}>
              <li>מקדמה בסך <strong>₪{fmt(form.downPayment) || '___'}</strong> — עד ליום <strong>{hebrewDate(form.downPaymentDate) || '___'}</strong>.</li>
              <li>יתרה בסך <strong>₪{balance() || '___'}</strong> — עד ליום <strong>{hebrewDate(form.balanceDate) || '___'}</strong>, כנגד מסירת מסמכי הבעלות.</li>
              {form.mortgageBank && form.mortgageAmount && (
                <li>חלק מהתשלום יבוצע באמצעות משכנתא מ<strong>{form.mortgageBank}</strong> בסכום <strong>₪{fmt(form.mortgageAmount)}</strong>.</li>
              )}
            </ul>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>3. מסירת הדירה</h3>
            <p style={{ marginBottom: '20px' }}>
              המוכר יעביר לקונה את החזקה בדירה ביום <strong>{hebrewDate(form.transferDate) || '___'}</strong>, כשהיא פנויה מכל אדם וחפץ ונקייה,
              כנגד תשלום מלוא התמורה החוזית.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>4. מצב הדירה</h3>
            <p style={{ marginBottom: '20px' }}>
              הקונה מצהיר כי ראה את הדירה, בדקה ומצאה מתאימה לצרכיו. הקונה קונה את הדירה כמות שהיא (AS IS),
              בכפוף לכך שהיא תימסר במצב שראה אותה בעת סיכום העסקה.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>5. רישום הבעלות</h3>
            <p style={{ marginBottom: '20px' }}>
              המוכר מתחייב לחתום על כל המסמכים הדרושים לרישום הנכס על שם הקונה בלשכת רישום המקרקעין, וזאת לאחר קבלת מלוא התמורה ותשלום כל המסים הנדרשים.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>6. מסים ואגרות</h3>
            <p style={{ marginBottom: '20px' }}>
              מס הרכישה ישולם על ידי הקונה. מס שבח (אם חל) ישולם על ידי המוכר. שכ"ט עו"ד ייסגר בנפרד בין כל צד לעורך דינו.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>7. תיווך</h3>
            <p style={{ marginBottom: '30px' }}>
              {form.agentName
                ? `העסקה בוצעה באמצעות המתווך ${form.agentName} (רישיון מס׳ ${form.agentLicense || '___'}). עמלת התיווך בסכום ₪${fmt(form.agentCommission) || '___'} תשולם על ידי _____ בעת חתימת החוזה.`
                : 'עסקה זו בוצעה ללא מתווך.'}
            </p>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '30px' }}>
              <div>
                <div style={{ marginBottom: '40px', borderBottom: '1px solid black' }}></div>
                <div style={{ fontSize: '13px', textAlign: 'center' }}>
                  <strong>המוכר</strong><br />
                  {form.sellerName || '___'}<br />
                  ת.ז. {form.sellerId || '___'}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '40px', borderBottom: '1px solid black' }}></div>
                <div style={{ fontSize: '13px', textAlign: 'center' }}>
                  <strong>הקונה</strong><br />
                  {form.buyerName || '___'}<br />
                  ת.ז. {form.buyerId || '___'}
                </div>
              </div>
            </div>

            {form.agentName && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <div style={{ display: 'inline-block', width: '200px', borderBottom: '1px solid black', marginBottom: '4px' }}></div>
                <div style={{ fontSize: '13px' }}>
                  <strong>המתווך</strong><br />
                  {form.agentName} | רישיון {form.agentLicense}
                </div>
              </div>
            )}

            <div style={{ marginTop: '40px', fontSize: '10px', color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '12px' }}>
              חוזה זה נוצר באמצעות BrokerBot. מסמך זה אינו מהווה ייעוץ משפטי. מומלץ לקבל ייעוץ עו"ד לפני החתימה.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
