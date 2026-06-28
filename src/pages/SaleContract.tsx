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

interface F { sellerName:string; sellerId:string; sellerPhone:string; buyerName:string; buyerId:string; buyerPhone:string; propertyAddress:string; city:string; rooms:string; floor:string; sqm:string; blockParcel:string; salePrice:string; downPayment:string; downPaymentDate:string; balanceDate:string; transferDate:string; contractDate:string; agentName:string; agentLicense:string; agentCommission:string; mortgageBank:string; mortgageAmount:string }
const INIT: F = { sellerName:'',sellerId:'',sellerPhone:'',buyerName:'',buyerId:'',buyerPhone:'',propertyAddress:'',city:'',rooms:'',floor:'',sqm:'',blockParcel:'',salePrice:'',downPayment:'',downPaymentDate:'',balanceDate:'',transferDate:'',contractDate:todayStr(),agentName:'',agentLicense:'',agentCommission:'',mortgageBank:'',mortgageAmount:'' }

export default function SaleContract() {
  const [form, setForm] = useState<F>(INIT)
  const [show, setShow] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const set = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setForm(p => ({...p, [k]: e.target.value}))
  const fmtNum = (n: string) => { const x = parseFloat(n.replace(/,/g,'')); return isNaN(x) ? n : x.toLocaleString('he-IL') }
  const balance = () => {
    const s = parseFloat(form.salePrice.replace(/,/g,'')), d = parseFloat(form.downPayment.replace(/,/g,''))
    return (!s || !d) ? '' : (s - d).toLocaleString('he-IL')
  }

  if (show) return (
    <div className="space-y-4">
      <div className="flex gap-3 no-print">
        <button className="btn-bronze flex-1 flex items-center justify-center gap-2" onClick={() => window.print()}>הדפס / שמור PDF</button>
        <button className="btn-outline flex-1" onClick={() => setShow(false)}>← ערוך</button>
      </div>
      <div ref={ref} className="print-contract bg-white rounded-3xl shadow-card p-8 md:p-12" dir="rtl" style={{fontFamily:'Heebo,sans-serif',color:'#000',lineHeight:'1.8'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:22,fontWeight:900,borderBottom:'3px double black',paddingBottom:12,marginBottom:8}}>חוזה מכר דירה</div>
          <div style={{fontSize:13,color:'#666'}}>נערך ביום {form.contractDate} בעיר {form.city||'___'}</div>
        </div>
        <p style={{marginBottom:16}}><strong>בין:</strong> {form.sellerName||'___'} (ת.ז. {form.sellerId||'___'}) — <strong>המוכר</strong></p>
        <p style={{marginBottom:24}}><strong>לבין:</strong> {form.buyerName||'___'} (ת.ז. {form.buyerId||'___'}) — <strong>הקונה</strong></p>
        {[
          { title:'1. הנכס הנמכר', body:`המוכר מוכר לקונה את הדירה ב${form.propertyAddress||'___'}, עיר ${form.city||'___'}${form.blockParcel ? `, גוש/חלקה ${form.blockParcel}` : ''}, קומה ${form.floor||'___'}, ${form.rooms||'___'} חדרים, ${form.sqm||'___'} מ"ר, וכל הצמוד לה.` },
          { title:'2. מחיר ותשלום', body:`מחיר המכירה: ₪${fmtNum(form.salePrice)||'___'}. מקדמה ₪${fmtNum(form.downPayment)||'___'} עד ${hebrewDate(form.downPaymentDate)||'___'}. יתרה ₪${balance()||'___'} עד ${hebrewDate(form.balanceDate)||'___'}.${form.mortgageBank ? ` חלק מהתשלום ממשכנתא בבנק ${form.mortgageBank} בסכום ₪${fmtNum(form.mortgageAmount)}.` : ''}` },
          { title:'3. מסירת הדירה', body:`המוכר יעביר חזקה ביום ${hebrewDate(form.transferDate)||'___'}, פנויה מכל אדם וחפץ, כנגד מלוא התמורה.` },
          { title:'4. מצב הנכס', body:'הקונה רכש את הדירה כמות שהיא (AS IS), לאחר שבדקה ומצאה מתאימה.' },
          { title:'5. רישום בעלות', body:'המוכר יחתום על כל מסמכי הרישום בלשכת רישום מקרקעין לאחר קבלת מלוא התמורה.' },
          { title:'6. מסים', body:'מס רכישה ישולם על הקונה. מס שבח (אם חל) ישולם על המוכר.' },
          { title:'7. תיווך', body: form.agentName ? `העסקה באמצעות ${form.agentName} (רישיון ${form.agentLicense||'___'}). עמלה: ₪${fmtNum(form.agentCommission)||'___'}.` : 'עסקה ללא מתווך.' },
        ].map(s => (
          <div key={s.title} style={{marginBottom:20}}>
            <h3 style={{fontWeight:800,fontSize:15,borderBottom:'1px solid #ddd',paddingBottom:4,marginBottom:8}}>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        ))}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,marginTop:40,borderTop:'1px solid #ccc',paddingTop:30}}>
          {[{title:'המוכר',name:form.sellerName,id:form.sellerId},{title:'הקונה',name:form.buyerName,id:form.buyerId}].map(p => (
            <div key={p.title}>
              <div style={{marginBottom:40,borderBottom:'1px solid black'}}></div>
              <div style={{fontSize:13,textAlign:'center'}}><strong>{p.title}</strong><br/>{p.name||'___'}<br/>ת.ז. {p.id||'___'}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,fontSize:10,color:'#999',textAlign:'center',borderTop:'1px solid #eee',paddingTop:12}}>
          חוזה זה נוצר באמצעות FOCUS. מסמך זה אינו ייעוץ משפטי. מומלץ לקבל ייעוץ עו"ד לפני החתימה.
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">חוזה</div>
        <h1 className="section-title">חוזה מכירה</h1>
        <p className="section-sub">חוזה מכר דירה מקצועי להדפסה</p>
      </div>

      {[
        { title:'פרטי המוכר', fields: [
          {label:'שם מלא',k:'sellerName',ph:'ישראל ישראלי'},
          {label:'מספר ת.ז.',k:'sellerId',ph:'123456789'},
          {label:'טלפון',k:'sellerPhone',ph:'050-0000000'},
        ]},
        { title:'פרטי הקונה', fields: [
          {label:'שם מלא',k:'buyerName',ph:'שרה כהן'},
          {label:'מספר ת.ז.',k:'buyerId',ph:'987654321'},
          {label:'טלפון',k:'buyerPhone',ph:'052-0000000'},
        ]},
        { title:'פרטי הנכס', fields: [
          {label:'כתובת מלאה',k:'propertyAddress',ph:'רחוב הרצל 1, דירה 5',cols:2},
          {label:'עיר',k:'city',ph:'תל אביב'},
          {label:'גוש / חלקה',k:'blockParcel',ph:'6601 / 123'},
          {label:'שטח (מ"ר)',k:'sqm',ph:'80'},
          {label:'מספר חדרים',k:'rooms',ph:'3.5'},
          {label:'קומה',k:'floor',ph:'3'},
        ]},
      ].map(section => (
        <div key={section.title} className="card space-y-4">
          <div className="text-xs font-bold text-bronze tracking-widest uppercase">{section.title}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map(f => (
              <div key={f.k} className={(f as any).cols === 2 ? 'md:col-span-2' : ''}>
                <label className="label">{f.label}</label>
                <input className="input-field" placeholder={f.ph} value={form[f.k as keyof F]} onChange={set(f.k as keyof F)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="card space-y-4">
        <div className="text-xs font-bold text-bronze tracking-widest uppercase">תנאי תשלום</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">מחיר מכירה (₪)</label><input className="input-field" placeholder="2,000,000" value={form.salePrice} onChange={set('salePrice')} /></div>
          <div><label className="label">מקדמה (₪)</label><input className="input-field" placeholder="200,000" value={form.downPayment} onChange={set('downPayment')} /></div>
          <div><label className="label">תאריך מקדמה</label><input type="date" className="input-field" value={form.downPaymentDate} onChange={set('downPaymentDate')} /></div>
          <div><label className="label">תאריך יתרה</label><input type="date" className="input-field" value={form.balanceDate} onChange={set('balanceDate')} /></div>
          <div><label className="label">תאריך מסירה</label><input type="date" className="input-field" value={form.transferDate} onChange={set('transferDate')} /></div>
        </div>
        {balance() && (
          <div className="result-box flex justify-between items-center">
            <span className="text-ink-muted text-sm">יתרת תשלום</span>
            <span className="font-black text-bronze text-lg">₪{balance()}</span>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <div className="text-xs font-bold text-bronze tracking-widest uppercase">משכנתא ומתווך</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">בנק המשכנתא</label><input className="input-field" placeholder="בנק הפועלים" value={form.mortgageBank} onChange={set('mortgageBank')} /></div>
          <div><label className="label">סכום משכנתא (₪)</label><input className="input-field" placeholder="1,500,000" value={form.mortgageAmount} onChange={set('mortgageAmount')} /></div>
          <div><label className="label">שם מתווך</label><input className="input-field" placeholder="שם מלא" value={form.agentName} onChange={set('agentName')} /></div>
          <div><label className="label">רישיון מתווך</label><input className="input-field" placeholder="12345" value={form.agentLicense} onChange={set('agentLicense')} /></div>
          <div><label className="label">עמלה (₪)</label><input className="input-field" placeholder="40,000" value={form.agentCommission} onChange={set('agentCommission')} /></div>
        </div>
      </div>

      <button className="btn-bronze w-full text-lg py-4" onClick={() => setShow(true)}>
        ✦ צור חוזה מכירה
      </button>
    </div>
  )
}
