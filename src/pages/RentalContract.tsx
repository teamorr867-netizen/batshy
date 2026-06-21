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
  landlordName: string
  landlordId: string
  landlordPhone: string
  tenantName: string
  tenantId: string
  tenantPhone: string
  propertyAddress: string
  city: string
  rooms: string
  floor: string
  sqm: string
  startDate: string
  endDate: string
  monthlyRent: string
  payDay: string
  deposit: string
  depositMonths: string
  contractDate: string
  agentName: string
  agentLicense: string
  agentCommission: string
}

const INITIAL: FormData = {
  landlordName: '', landlordId: '', landlordPhone: '',
  tenantName: '', tenantId: '', tenantPhone: '',
  propertyAddress: '', city: '', rooms: '', floor: '', sqm: '',
  startDate: '', endDate: '',
  monthlyRent: '', payDay: '1', deposit: '', depositMonths: '2',
  contractDate: todayStr(),
  agentName: '', agentLicense: '', agentCommission: '',
}

export default function RentalContract() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [showContract, setShowContract] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handlePrint = () => {
    window.print()
  }

  const fmt = (n: string) => {
    const num = parseFloat(n.replace(/,/g, ''))
    return isNaN(num) ? n : num.toLocaleString('he-IL')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">📝 חוזה שכירות</h1>
        <p className="section-sub">מלא את הפרטים ויצא חוזה מקצועי להדפסה</p>
      </div>

      {!showContract ? (
        <div className="space-y-6">
          {/* Landlord */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי המשכיר</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם מלא</label><input className="input-field" placeholder="ישראל ישראלי" value={form.landlordName} onChange={set('landlordName')} /></div>
              <div><label className="label">מספר ת.ז.</label><input className="input-field" placeholder="123456789" value={form.landlordId} onChange={set('landlordId')} /></div>
              <div><label className="label">טלפון</label><input className="input-field" placeholder="050-0000000" value={form.landlordPhone} onChange={set('landlordPhone')} /></div>
            </div>
          </div>

          {/* Tenant */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי השוכר</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם מלא</label><input className="input-field" placeholder="שרה כהן" value={form.tenantName} onChange={set('tenantName')} /></div>
              <div><label className="label">מספר ת.ז.</label><input className="input-field" placeholder="987654321" value={form.tenantId} onChange={set('tenantId')} /></div>
              <div><label className="label">טלפון</label><input className="input-field" placeholder="052-0000000" value={form.tenantPhone} onChange={set('tenantPhone')} /></div>
            </div>
          </div>

          {/* Property */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי הנכס</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">כתובת מלאה</label><input className="input-field" placeholder="רחוב הרצל 1, דירה 5" value={form.propertyAddress} onChange={set('propertyAddress')} /></div>
              <div><label className="label">עיר</label><input className="input-field" placeholder="תל אביב" value={form.city} onChange={set('city')} /></div>
              <div><label className="label">מספר חדרים</label><input className="input-field" placeholder="3.5" value={form.rooms} onChange={set('rooms')} /></div>
              <div><label className="label">קומה</label><input className="input-field" placeholder="3" value={form.floor} onChange={set('floor')} /></div>
              <div><label className="label">שטח (מ"ר)</label><input className="input-field" placeholder="75" value={form.sqm} onChange={set('sqm')} /></div>
            </div>
          </div>

          {/* Lease terms */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">תנאי שכירות</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">תאריך תחילת שכירות</label><input type="date" className="input-field" value={form.startDate} onChange={set('startDate')} /></div>
              <div><label className="label">תאריך סיום שכירות</label><input type="date" className="input-field" value={form.endDate} onChange={set('endDate')} /></div>
              <div><label className="label">שכר דירה חודשי (₪)</label><input className="input-field" placeholder="5,000" value={form.monthlyRent} onChange={set('monthlyRent')} /></div>
              <div>
                <label className="label">יום תשלום בחודש</label>
                <select className="input-field" value={form.payDay} onChange={set('payDay')}>
                  {[1,5,10,15,20,25].map(d => <option key={d} value={d}>יום {d}</option>)}
                </select>
              </div>
              <div><label className="label">פיקדון (₪)</label><input className="input-field" placeholder="10,000" value={form.deposit} onChange={set('deposit')} /></div>
              <div>
                <label className="label">שווה ערך לחודשי שכירות</label>
                <select className="input-field" value={form.depositMonths} onChange={set('depositMonths')}>
                  {[1,2,3].map(m => <option key={m} value={m}>{m} חודשים</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Agent */}
          <div className="card space-y-4">
            <h3 className="font-bold text-gold">פרטי המתווך</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="label">שם המתווך</label><input className="input-field" placeholder="שם מלא" value={form.agentName} onChange={set('agentName')} /></div>
              <div><label className="label">מספר רישיון</label><input className="input-field" placeholder="12345" value={form.agentLicense} onChange={set('agentLicense')} /></div>
              <div><label className="label">עמלה (₪)</label><input className="input-field" placeholder="5,000" value={form.agentCommission} onChange={set('agentCommission')} /></div>
            </div>
          </div>

          <button
            className="btn-gold w-full text-lg py-4"
            onClick={() => setShowContract(true)}
          >
            צור חוזה שכירות ←
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-3 no-print">
            <button className="btn-gold flex-1 flex items-center justify-center gap-2" onClick={handlePrint}>
              🖨️ הדפס / שמור PDF
            </button>
            <button
              className="flex-1 border border-dark-border text-gray-400 py-3 rounded-xl hover:border-gray-500 transition-colors"
              onClick={() => setShowContract(false)}
            >
              ← ערוך פרטים
            </button>
          </div>

          {/* Contract */}
          <div ref={printRef} className="print-contract bg-white text-black rounded-2xl p-8 md:p-12" dir="rtl" style={{ fontFamily: 'Heebo, sans-serif', lineHeight: '1.8', color: '#000' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '22px', fontWeight: '900', borderBottom: '3px double black', paddingBottom: '12px', marginBottom: '8px' }}>
                חוזה שכירות למגורים
              </div>
              <div style={{ fontSize: '13px', color: '#555' }}>נערך ונחתם ביום {form.contractDate} בעיר {form.city || '___'}</div>
            </div>

            <p style={{ marginBottom: '16px' }}>
              <strong>בין:</strong> {form.landlordName || '___'} (ת.ז. {form.landlordId || '___'}) טל׳ {form.landlordPhone || '___'} — <strong>המשכיר</strong>
            </p>
            <p style={{ marginBottom: '24px' }}>
              <strong>לבין:</strong> {form.tenantName || '___'} (ת.ז. {form.tenantId || '___'}) טל׳ {form.tenantPhone || '___'} — <strong>השוכר</strong>
            </p>

            <p style={{ marginBottom: '24px' }}>
              הוסכם, הותנה והוצהר בין הצדדים כדלקמן:
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>1. הנכס המושכר</h3>
            <p style={{ marginBottom: '20px' }}>
              המשכיר משכיר לשוכר את הדירה הנמצאת ב<strong>{form.propertyAddress || '___'}</strong>, עיר <strong>{form.city || '___'}</strong>,
              קומה <strong>{form.floor || '___'}</strong>, {form.rooms || '___'} חדרים, שטח <strong>{form.sqm || '___'} מ"ר</strong>
              (להלן: "הדירה"), למגורים בלבד.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>2. תקופת השכירות</h3>
            <p style={{ marginBottom: '20px' }}>
              תקופת השכירות תחל ביום <strong>{hebrewDate(form.startDate) || '___'}</strong> ותסתיים ביום <strong>{hebrewDate(form.endDate) || '___'}</strong>.
              בתום תקופת השכירות יפנה השוכר את הדירה ויחזירה למשכיר במצבה כפי שקיבלה.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>3. דמי שכירות</h3>
            <p style={{ marginBottom: '20px' }}>
              השוכר ישלם למשכיר דמי שכירות חודשיים בסכום של <strong>₪{fmt(form.monthlyRent) || '___'}</strong> (במילים: {form.monthlyRent ? '' : '___'}),
              אשר ישולמו עד ליום <strong>{form.payDay}</strong> בכל חודש. התשלום יבוצע בהעברה בנקאית / שיקים / מזומן לפי הסכמת הצדדים.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>4. פיקדון</h3>
            <p style={{ marginBottom: '20px' }}>
              עם חתימת חוזה זה, ישלם השוכר למשכיר פיקדון בסכום של <strong>₪{fmt(form.deposit) || '___'}</strong>
              (שווה ערך ל-{form.depositMonths} חודשי שכירות).
              הפיקדון יוחזר לשוכר בתום תקופת השכירות, בניכוי כל נזק שנגרם לדירה מעבר לבלאי סביר.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>5. אחריות ותחזוקה</h3>
            <p style={{ marginBottom: '20px' }}>
              השוכר מתחייב: לשמור על הדירה ורכושה בתנאים תקינים; לא לבצע שינויים מבניים ללא אישור בכתב מהמשכיר;
              לשלם את חשבונות החשמל, מים, גז, ועד בית וארנונה; להודיע למשכיר על כל תקלה מיד עם גילויה.
              המשכיר מתחייב לתיקון ליקויים מבניים ותשתיות בתוך זמן סביר.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>6. איסור העברה</h3>
            <p style={{ marginBottom: '20px' }}>
              השוכר אינו רשאי להשכיר את הדירה בשכירות משנה, להסב את החוזה לאחר, או להכניס דיירים נוספים, ללא הסכמת המשכיר בכתב מראש.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>7. פינוי בסיום החוזה</h3>
            <p style={{ marginBottom: '20px' }}>
              בתום תקופת השכירות, ישיב השוכר את הדירה לידי המשכיר כשהיא פנויה מכל אדם וחפץ, נקייה ובמצב תקין, כשכל המתקנים והאביזרים שנמסרו עמה שלמים ותקינים.
            </p>

            <h3 style={{ fontWeight: '800', fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>8. תיווך</h3>
            <p style={{ marginBottom: '30px' }}>
              {form.agentName
                ? `העסקה בוצעה באמצעות המתווך ${form.agentName} (רישיון מס׳ ${form.agentLicense || '___'}). עמלת התיווך בסכום ₪${fmt(form.agentCommission) || '___'} תשולם על ידי _____ בעת חתימת החוזה.`
                : 'עסקה זו בוצעה ללא מתווך.'}
            </p>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '30px' }}>
              <div>
                <div style={{ marginBottom: '40px', borderBottom: '1px solid black', paddingBottom: '4px' }}></div>
                <div style={{ fontSize: '13px', textAlign: 'center' }}>
                  <strong>המשכיר</strong><br />
                  {form.landlordName || '___'}<br />
                  ת.ז. {form.landlordId || '___'}
                </div>
              </div>
              <div>
                <div style={{ marginBottom: '40px', borderBottom: '1px solid black', paddingBottom: '4px' }}></div>
                <div style={{ fontSize: '13px', textAlign: 'center' }}>
                  <strong>השוכר</strong><br />
                  {form.tenantName || '___'}<br />
                  ת.ז. {form.tenantId || '___'}
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
              חוזה זה נוצר באמצעות BrokerBot. מומלץ לקבל ייעוץ משפטי לפני החתימה.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
