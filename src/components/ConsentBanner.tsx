'use client'
import { useEffect, useState } from 'react'
export default function ConsentBanner(){
  const [show, setShow] = useState(false)
  useEffect(()=>{ try{ const k='consent:v1'; const v=localStorage.getItem(k); if(!v) setShow(true)}catch{} },[])
  const choose=(v:'accepted'|'declined')=>{ try{ localStorage.setItem('consent:v1', v); setShow(false)}catch{} }
  if(!show) return null
  return (
    <div style={{position:'fixed',left:0,right:0,bottom:0,background:'#111827',color:'#fff',padding:'12px 16px',zIndex:50}}>
      <div style={{maxWidth:960,margin:'0 auto',display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}>
        <span style={{fontSize:14}}>Vi bruger kun nødvendige cookies til at huske dine indstillinger. Valgfrie cookies bruges kun med samtykke.</span>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>choose('accepted')} style={{background:'#10b981',color:'#fff',border:'none',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}>Accepter</button>
          <button onClick={()=>choose('declined')} style={{background:'#374151',color:'#fff',border:'none',padding:'8px 12px',borderRadius:6,cursor:'pointer'}}>Afvis</button>
        </div>
      </div>
    </div>
  )
}
