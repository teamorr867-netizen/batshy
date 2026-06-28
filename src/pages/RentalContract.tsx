import { useState, useRef } from 'react'

function todayStr() {
  const d = new Date()
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`
}
function hebrewDate(dateStr: string) {
  if (!dateStr) return ''
  const [y,m,d] = dateStr.split('-')
  const months = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
  return `${parseInt(d)} ב${months[parseInt(m)-1]} ${y}`
}

interface F { landlordName:string; landlordId:string; landlordPhone:string; tenantName:string; tenantId:string; tenantPhone:string; propertyAddress:string; city:string; rooms:string; floor:string; sqm:string; startDate:string; endDate:string; monthlyRent:string; payDay:string; deposit:string; depositMonths:string; contractDate:string; agentName:string; agentLicense:string; agentCommission:string }
const INIT: F = { landlordName:'',landlordId:'',landlordPhone:'',tenantName:'',tenantId:'',tenantPhone:'',propertyAddress:'',city:'',rooms:'',floor:'',sqm:'',startDate:'',endDate:'',monthlyRent:'',payDay:'1',deposit:'',depositMonths:'2',contractDate:todayStr(),agentName:'',agentLicense:'',agentCommission:'' }

const Field = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div><label className="label">{label}</label><input className="input-field" {...props} /></div>
)

export default function RentalContract() {
  const [form, setForm] = useState<F>(INIT)
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(p => ({...p, [k]: e.target.value}))
  const fmtNum = (n: string) => { const x = parseFloat(n.replace(/,/g,'')); return isNaN(x) ? n : x.toLocaleString('he-IL') }

  if (show) return (
    <div className="space-y-4">
      <div className="flex gap-3 no-print">
        <button className="btn-bronze flex-1 flex items-center justify-center gap-2" onClick={() => window.print()}>הדפס / שמור PDF</button>
        <button className="btn-outline flex-1" onClick={() => setShow(false)}>← ערוך</button>
      </div>
      <div ref={ref} className="print-contract bg-white rounded-3xl shadow-card p-8 md:p-12" dir="rtl" style={{fontFamily:'Heebo,sans-serif',color:'#000',lineHeight:'1.8'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:22,fontWeight:900,borderBottom:'3px double black',paddingBottom:12,marginBottom:8}}>חוזה שכירות למגורים</div>
          <div style={{fontSize:13,color:'#666'}}>נערך ביום {form.contractDate} בעיר {form.city||'___'}</div>
        </div>
        <p style={{marginBottom:16}}><strong>בין:</strong> {form.landlordName||'___'} (ת.ז. {form.landlordId||'___'}) טל׳ {form.landlordPhone||'___'} — <strong>המשכיר</strong></p>
        <p style={{marginBottom:24}}><strong>לבין:</strong> {form.tenantName||'___'} (ת.ז. {form.tenantId||'___'}) טל׳ {form.tenantPhone||'___'} — <strong>השוכר</strong></p>
        {[
          { title:'1. הנכס המושכר', body: `המשכיר משכיר לשוכר את הדירה הנמצאת ב${form.propertyAddress||'___'}, עיר ${form.city||'___'}, קומה ${form.floor||'___'}, ${form.rooms||'___'} חדרים, שטח ${form.sqm||'___'} מ"ר, למגורים בלבד.` },
          { title:'2. תקופת השכירות', body: `תקופת השכירות תחל ביום ${hebrewDate(form.startDate)||'___'} ותסתיים ביום ${hebrewDate(form.endDate)||'___'}. בתום התקופה יפנה השוכר את הדירה ויחזירה למשכיר.` },
          { title:'3. דמי שכירות', body: `השוכר ישלם דמי שכירות חודשיים בסכום ₪${fmtNum(form.monthlyRent)||'___'}, עד ליום ${form.payDay} בכל חודש.` },
          { title:'4. פיקדון', body: `השוכר ישלם פיקדון בסכום ₪${fmtNum(form.deposit)||'___'} (${form.depositMonths} חודשי שכירות). הפיקדון יוחזר בתום השכירות, בניכוי נזקים.` },
          { title:'5. אחריות ותחזוקה', body: 'השוכר מתחייב לשמור על הדירה בתנאים תקינים, לא לבצע שינויים ללא אישור, ולשלם חשמל, מים, גז, ועד בית וארנונה.' },
          { title:'6. איסור העברה', body: 'השוכר אינו רשאי להשכיר בשכירות משנה או להסב את החוזה ללא הסכמת המשכיר בכתב.' },
          { title:'7. תיווך', body: form.agentName ? `העסקה בוצעה באמצעות ${form.agentName} (רישיון ${form.agentLicense||'___'}). עמלה: ₪${fmtNum(form.agentCommission)||'___'}.` : 'עסקה זו בוצעה ללא מתווך.' },
        ].map(s => (
          <div key={s.title} style={{marginBottom:20}}>
            <h3 style={{fontWeight:800,fontSize:15,borderBottom:'1px solid #ddd',paddingBottom:4,marginBottom:8}}>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,marginTop:40,borderTop:'1px solid #ccc',paddingTop:30}}>
          {[{title:'המשכיר',name:form.landlordName,id:form.landlordId},{title:'השוכר',name:form.tenantName,id:form.tenantId}].map(p => (
            <div key={p.title}>
              <div style={{marginBottom:40,borderBottom:'1px solid black'}}></div>
              <div style={{fontSize:13,textAlign:'center'}}><strong>{p.title}</strong><br/>{p.name||'___'}<br/>ת.ז. {p.id||'___'}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,fontSize:10,color:'#999',textAlign:'center',borderTop:'1px solid #eee',paddingTop:12}}>
          חוזה זה נוצר באמצעות FOCUS. מומלץ לקבל ייעוץ משפטי לפני החתימה.
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">חוזה</div>
        <h1 className="section-title">חוזה שכירות</h1>
        <p className="section-sub">מלא פרטים וצור חוזה מקצועי להורדה</p>
      </div>

      {[
        { title:'פרטי המשכיר', fields: [
          { label:'שם מלא', k:'landlordName', ph:'ישראל ישראלי' },
          { label:'מספר ת.ז.', k:'landlordId', ph:'123456789' },
          { label:'טלפון', k:'landlordPhone', ph:'050-0000000' },
        ]},
        { title:'פרטי השוכר', fields: [
          { label:'שם מלא', k:'tenantName', ph:'שרה כהן' },
          { label:'מספר ת.ז.', k:'tenantId', ph:'987654321' },
          { label:'טלפון', k:'tenantPhone', ph:'052-0000000' },
        ]},
        { title:'פרטי הנכס', fields: [
          { label:'כתובת מלאה', k:'propertyAddress', ph:'רחוב הרצל 1, דירה 5', cols:2 },
          { label:'עיר', k:'city', ph:'תל אביב' },
          { label:'מספר חדרים', k:'rooms', ph:'3.5' },
          { label:'קומה', k:'floor', ph:'3' },
          { label:'שטח (מ"ר)', k:'sqm', ph:'75' },
        ]},
        { title:'תנאי שכירות', fields: [
          { label:'שכר דירה חודשי (₪)', k:'monthlyRent', ph:'5,000' },
          { label:'פיקדון (₪)', k:'deposit', ph:'10,000' },
        ]},
        { title:'פרטי המתווך', fields: [
          { label:'שם מתווך', k:'agentName', ph:'שם מלא' },
          { label:'מספר רישיון', k:'agentLicense', ph:'12345' },
          { label:'עמלה (₪)', k:'agentCommission', ph:'5,000' },
        ]},
      ].map(section => (
        <div key={section.title} className="card space-y-4">
          <div className="text-xs font-bold text-bronze tracking-widest uppercase">{section.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(f => (
              <div key={f.k} className={(f as any).cols === 2 ? 'md:col-span-2' : ''}>
                <Field label={f.label} placeholder={f.ph} value={form[f.k as keyof F]} onChange={set(f.k as keyof F)} />
              </div>
            ))}
          </div>
          {section.title === 'תנאי שכירות' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="label">תאריך תחילה</label><input type="date" className="input-field" value={form.startDate} onChange={set('startDate')} /></div>
              <div><label className="label">תאריך סיום</label><input type="date" className="input-field" value={form.endDate} onChange={set('endDate')} /></div>
              <div>
                <label className="label">יום תשלום בחודש</label>
                <select className="input-field" value={form.payDay} onChange={set('payDay')}>
                  {[1,5,10,15,20,25].map(d => <option key={d} value={d}>יום {d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">פיקדון — חודשי שכירות</label>
                <select className="input-field" value={form.depositMonths} onChange={set('depositMonths')}>
                  {[1,2,3].map(m => <option key={m} value={m}>{m} חודשים</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn-bronze w-full text-lg py-4" onClick={() => setShow(true)}>
        ✦ צור חוזה שכירות
      </button>
    </div>
  )
}
