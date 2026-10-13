'use client';
import React,{useEffect,useRef,useState} from 'react';
import {ZoomIn,X,ChevronLeft,ChevronRight,Eye,FileText,ArrowUpRight,Maximize,Image as ImageIcon} from 'lucide-react';
export default function StepVisuals({items,stepId}:{items:any[];stepId:string}){
const [index,setIndex]=useState(0),[whole,setWhole]=useState(false),[scale,setScale]=useState(1);const dialog=useRef<HTMLDialogElement>(null);const zoom=useRef<HTMLButtonElement>(null);
useEffect(()=>{setIndex(0);setWhole(false);setScale(1);dialog.current?.close()},[stepId]);
if(!items?.length)return null;
const active=items[Math.min(index,items.length-1)];
function show(page=false){setWhole(page);setScale(1);dialog.current?.showModal()}
return <aside className="step-visuals" aria-label="Referências visuais desta etapa"><div className="visual-heading"><span><ImageIcon size={15}/>APOIO VISUAL</span><small>{index+1}/{items.length}</small></div>
<figure><button ref={zoom} className="visual-image" onClick={()=>show()} aria-label={'Ampliar imagem: '+active.title}><img src={active.src} alt={active.title+' — detalhe didático extraído de '+active.sourceTitle+', página '+active.page} loading="lazy"/><span><ZoomIn size={14}/>Ampliar</span></button><figcaption><span className="visual-kind">{active.kind}</span><h3>{active.title}</h3><p>{active.caption}</p></figcaption></figure>
{items.length>1&&<div className="visual-carousel"><button className="icon-button" onClick={()=>setIndex((index+items.length-1)%items.length)} aria-label="Referência visual anterior"><ChevronLeft size={16}/></button><div>{items.map((it:any,i:number)=><button key={it.id} className={i===index?'active':''} onClick={()=>setIndex(i)} aria-label={'Mostrar '+it.title} aria-pressed={i===index}/>)}</div><button className="icon-button" onClick={()=>setIndex((index+1)%items.length)} aria-label="Próxima referência visual"><ChevronRight size={16}/></button></div>}
<details className="visual-observe" open><summary><Eye size={15}/>O que observar</summary><ul>{active.observe.map((t:string)=><li key={t}>{t}</li>)}</ul></details>
<details className="visual-source"><summary><FileText size={14}/>Fonte e limites</summary><p>{active.sourceTitle} • página {active.page}</p><p>{active.caution}</p><div><button className="text-btn" onClick={()=>show(true)}>Ver prancha inteira <Maximize size={13}/></button><a className="text-btn" href={active.sourceUrl} target="_blank" rel="noreferrer">Original no Drive <ArrowUpRight size={13}/></a></div></details>
<dialog ref={dialog} className="visual-dialog" onClose={()=>{setScale(1);zoom.current?.focus()}} onClick={e=>{if(e.target===dialog.current)dialog.current.close()}}><div className="visual-dialog-bar"><div><b>{whole?'Prancha de origem':active.title}</b><small>{active.sourceTitle} • p. {active.page}</small></div><div><button className="btn secondary" onClick={()=>setScale(scale===1?2:1)}><ZoomIn size={16}/>{scale===1?'2×':'Ajustar'}</button><button className="icon-button" onClick={()=>dialog.current?.close()} aria-label="Fechar imagem ampliada"><X size={22}/></button></div></div><div className={'visual-dialog-scroll '+(scale===2?'zoomed':'')}><img src={whole?active.fullSrc:active.src} alt={whole?'Prancha didática completa de '+active.sourceTitle:active.title}/></div><div className="visual-dialog-note">{active.caution}</div></dialog>
</aside>
}
