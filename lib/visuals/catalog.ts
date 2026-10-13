import assets from './assets.json';
import sources from './sources.json';
export {sources as visualSources};
const byId=new Map(assets.map(x=>[x.id,x]));
const foundation:Record<string,string[]>={
'F00.1':['resistor','tensao-dc','resistencia'],'F00.2':['resistor','capacitor','bobina','diodo','mosfet','ci-memoria'],'F00.3':['origem-destino','regulador','rede-esquema'],'F00.4':['referencias-esquema','boardview','ponto-medicao'],'F00.5':['fonte-inspecao','pontas','fonte-polaridade'],'F00.6':['inspecao-placa','procedure_09','ponto-medicao'],
'F01.1':['pontas','tensao-dc','resistencia'],'F01.2':['continuidade','modo-diodo','bobina'],'F01.3':['fonte-ajuste','fonte-polaridade','consumo-zero','consumo-trava'],'F01.4':['entrada-placa','fonte-ajuste'],'F01.5':['inspecao-placa','termica','oxidacao'],'F01.6':['consumo-pulso','ponto-medicao']
};
const moduleMedia:Record<string,string[]>={
'02':['entrada-placa','power-placa','consumo-zero','consumo-trava','regulador'],'03':['entrada-placa','conector','tensao-dc','regulador'],'04':['consumo-pulso','consumo-trava','ci-memoria','queda-placa'],'05':['conector','tensao-dc','regulador'],'06':['fonte-ajuste','consumo-zero','consumo-alto','regulador'],'07':['conector','continuidade','ci-memoria'],'08':['conector','boardview','continuidade'],'09':['conector','boardview','ci-memoria'],'10':['conector','ponto-medicao','regulador'],'11':['oxidacao','queda-placa','inspecao-placa','procedure_08','procedure_05'],'12':['procedure_09','procedure_06','ponto-medicao']
};
const clean=(t:string)=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function visualDetailsForStep(lesson:{id:string;module:string},step:{id:string;title:string;body:string;exercise?:{type:string;critical?:boolean;prompt:string}}){
if(step.id==='finish')return [];
let ids=[...(foundation[lesson.id]||moduleMedia[lesson.module]||['inspecao-placa'])];
const text=clean(step.title+' '+step.body+' '+(step.exercise?.prompt||''));
if(step.id==='prepare-check'||step.exercise?.critical)ids=['fonte-inspecao','pontas','fonte-polaridade'];
else{
const rules:[RegExp,string[]][]=[[/\b(resistor|resistores)\b/,['resistor','resistencia']],[/\b(capacitor|capacitores)\b/,['capacitor']],[/\b(bobina|indutor)\b/,['bobina']],[/\b(diodo)\b/,['modo-diodo','diodo']],[/\b(continuidade)\b/,['continuidade']],[/\b(clock|osciloscopio)\b/,['consumo-pulso','ponto-medicao']],[/\b(boardview|esquema)\b/,['boardview','rede-esquema']],[/\b(pmic|regulador)\b/,['regulador','origem-destino']],[/\b(memoria|cpu|codec)\b/,['ci-memoria']],[/\b(conector|flex|fpc|usb)\b/,['conector','entrada-placa']],[/\b(oxidacao|liquido|molhad)\b/,['oxidacao','inspecao-placa']],[/\b(queda|trinca)\b/,['queda-placa','procedure_08']],[/\b(termica|aquecimento|ponto quente)\b/,['termica']],[/\b(pad|pads|trilha|trilhas|jumper)\b/,['procedure_08','procedure_05','procedure_06']],[/\b(bga|reballing)\b/,['procedure_04','procedure_03']],[/\b(ressolda|solda|ponte)\b/,['procedure_09','procedure_16']],[/\b(polaridade|interface)\b/,['fonte-polaridade']],[/\b(0,00|zero|sem consumo)\b/,['consumo-zero']],[/\b(pulso|bootloop|reinicia)\b/,['consumo-pulso']]];
const matched=rules.filter(([rx])=>rx.test(text));const title=clean(step.title);
const priority=matched.filter(([rx])=>rx.test(title)).flatMap(([,a])=>a);const secondary=matched.flatMap(([,a])=>a);
ids=[...priority,...secondary,...ids];
if(step.exercise?.type==='number')ids=lesson.id==='F01.4'?['fonte-ajuste','tensao-dc']:['resistor','resistencia'];
}
return [...new Set(ids)].map(id=>byId.get(id)).filter(Boolean).slice(0,4).map(a=>lesson.id==='F01.6'&&a?.id==='consumo-pulso'?{...a,caption:'Este gráfico ilustra consumo de corrente, não uma captura de clock. A validação de clock exige outra documentação e uma sonda adequada.'}:a);
}
