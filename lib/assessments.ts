export type Question={id:string;question:string;options:string[];answer:number;explanation:string;critical?:boolean};
function q(id:string,question:string,options:string[],answer:number,explanation:string,critical=false):Question{return {id,question,options,answer,explanation,critical}}
export const quizzes:Record<string,{title:string;questions:Question[]}>= {
'fundamentos':{title:'Fundamentos e segurança',questions:[
q('f1','Um resistor ideal de 1.000 Ω alimentado a 3 V tem corrente de:', ['3 A','3 mA','3 µA'],1,'I = V/R = 0,003 A = 3 mA. Exemplo didático.'),
q('f2','A tensão deve ser medida:', ['Em paralelo entre pontos definidos','Pelo borne de corrente em paralelo','Na escala de continuidade'],0,'Tensão é diferença de potencial entre dois pontos.'),
q('f3','Antes de medir resistência, você deve:', ['Aumentar a tensão','Desenergizar e verificar condição residual conforme manual','Apertar power'],1,'O teste resistivo exige circuito desenergizado.',true),
q('f4','Uma bobina que emite bip:', ['Está necessariamente defeituosa','Pode apresentar baixa resistência normal','Deve ser retirada imediatamente'],1,'O limiar do bip depende do multímetro e não identifica defeito.'),
q('f5','Saída ausente em regulador comprova CI defeituoso?', ['Sim','Não; entrada, comando e carga precisam ser avaliados','Somente quando estiver quente'],1,'Outras condições podem impedir a saída.'),
q('f6','Uma documentação de outra revisão de placa:', ['Autoriza usar a mesma pinagem','Precisa de compatibilidade confirmada','É suficiente se a aparência for igual'],1,'Confirmar modelo, revisão e correspondência física.'),
q('f7','Bateria inchada deve ser:', ['Carregada para teste','Aquecida para remover','Retirada de uso e tratada por procedimento seguro'],2,'Não carregar, perfurar, comprimir ou aquecer bateria danificada.',true),
q('f8','Placa molhada pode ser energizada para localizar falha?', ['Sim, com qualquer corrente baixa','Não; fazer triagem, desconexão e avaliação segura','Sim, se o cliente autorizar'],1,'Autorização não remove o risco de energização.',true),
q('f9','Um CI quente por si só é:', ['Diagnóstico definitivo','Uma observação que exige interpretação','Motivo suficiente para reballing'],1,'Calor pode ser consequência ou operação normal.'),
q('f10','Registro reproduzível inclui:', ['Só o número','Ponto, referência, estado, instrumento, escala e unidade','Só a marca do aparelho'],1,'As condições permitem interpretar e repetir o teste.')
]},
'ferramentas':{title:'Instrumentos e interpretação',questions:[
q('t1','O modo diodo apresenta:', ['Tensão de operação universal','Leitura de teste dependente de instrumento, polaridade e rede','Pinagem do componente'],1,'Registrar polaridade e condições; não comparar como tensão de operação.'),
q('t2','Uma fonte em limitação com queda de tensão:', ['Confirma CPU defeituosa','Pode impedir partida; exige investigação da condição','Deve receber mais corrente sem limite'],1,'Registrar CV/CC, tensão no aparelho, conexão e parâmetros aprovados.'),
q('t3','Corrente medida na entrada USB é:', ['Sempre corrente líquida da bateria','Corrente naquele domínio de entrada','Prova automática de carga normal'],1,'Há conversão de tensão e consumo simultâneo do aparelho.'),
q('t4','Carregamento rápido exige necessariamente 9 V?', ['Sim','Não; depende de protocolo e modelo','Sim, com qualquer cabo'],1,'A referência de 9 V do PDF é genérica.'),
q('t5','Para validar clock no fluxo 003:', ['Só multímetro é suficiente','Usar osciloscópio e sonda apropriados com documentação','Medir resistência enquanto ligado'],1,'Multímetro não valida sozinho forma de onda e frequência.'),
q('t6','Usar álcool em placa energizada e aquecida:', ['É a prática inicial recomendada','Deve ser evitado; há risco e a prática precisa de método seguro','É seguro com qualquer tensão'],1,'Solvente inflamável não deve ser empregado dessa forma nesta prática.',true)
]},
'nao-liga':{title:'Aula 001 • ausência de partida',questions:[
q('d1','0,00 A no visor prova PMIC defeituoso?', ['Sim','Não','Apenas em 4 V'],1,'Validar instrumento, cabo, interface e sequência de partida.'),
q('d2','Primeira ação numa placa molhada:', ['Fonte com limite baixo','Interromper alimentação e fazer triagem segura','Aquecer bateria'],1,'Não energizar placa molhada.',true),
q('d3','Continuidade deve ser testada:', ['Com circuito ativo','Com circuito desenergizado e sem energia residual conforme manual','Com fonte no máximo'],1,'Não medir continuidade energizado.',true),
q('d4','No cenário fictício, 4 V em P1 e 0 V em P2 sugerem:', ['Display confirmado defeituoso','Investigar caminho interrompido ou proteção entre os pontos','CPU condenada'],1,'Localiza uma diferença no caminho, sem condenar um CI.'),
q('d5','O valor 4,0 V do PDF autoriza qualquer aparelho?', ['Sim','Não; validar modelo e interface','Se a bateria foi removida'],1,'Referências do PDF são genéricas.'),
q('d6','Fonte desarma ao power. Você deve:', ['Concluir curto','Registrar tensão, corrente e limitação; investigar','Trocar PMIC'],1,'Desarme tem causas concorrentes.'),
q('d7','Linha power sem transição comprova botão ruim?', ['Sim','Não; conferir lógica, polarização e conexão','Se houver tela preta'],1,'O comando depende de circuito e referência documentados.'),
q('d8','No caso de caminho aberto P1–P2, a conclusão é:', ['Trocar PMIC','Investigar interrupção e causa raiz','Memória condenada'],1,'A conclusão precisa corresponder às evidências.')
]}
};
export const scenarios:Record<string,any>={
'partida':{title:'Sem sinal de vida',category:'Alimentação',description:'Selecione os testes e investigue um caminho de alimentação. Todos os pontos e valores são fictícios.',initial:'triagem',nodes:{
triagem:{text:'SIMULAÇÃO • aparelho fictício seco, sem deformação. Você ainda não validou documentação e interface. Qual é o primeiro passo?',choices:[{label:'Verificar segurança, documento e interface de alimentação',next:'fonte',points:25},{label:'Ligar imediatamente em 4 V',next:'unsafe',points:0}]},
fonte:{text:'No roteiro de treino, interface e limites foram aprovados. A fonte indica 0,00 A após power. Qual teste diferencia falha do equipamento de alimentação disponível?',choices:[{label:'Verificar saída, cabo e tensão no terminal definido P1',next:'entrada',points:25},{label:'Concluir PMIC defeituoso e retrabalhar',next:'unsupported',points:0}]},
entrada:{text:'SIMULAÇÃO • P1 = 4,00 V. A fonte está habilitada; não há resposta detectável. No diagrama fictício, P2 fica após F1. O sinal de comando varia de 1,80 para 0,02 V. Próxima ação?',choices:[{label:'Rastrear alimentação até P2; depois investigar o caminho desenergizado',next:'conclusao',points:25},{label:'Medir resistência mantendo a fonte ligada',next:'unsafe',points:0}]},
conclusao:{text:'SIMULAÇÃO • P2 = 0,00 V. Com circuito seguro, desenergizado e caminho isolado conforme roteiro, F1 apresenta abertura. O que as evidências sustentam?',choices:[{label:'Interrupção P1–P2; ainda investigar por que F1 abriu',next:'success',points:25},{label:'Defeito definitivo de CPU',next:'unsupported',points:0}]},
success:{text:'Você identificou a hipótese suportada pelas medições. Registre evidências, causa ainda pendente e próximo teste.',terminal:true},unsafe:{text:'Tentativa interrompida por ação insegura. Rever condição elétrica e preparação antes de repetir.',terminal:true,failed:true},unsupported:{text:'Conclusão sem teste suficiente. Refaça a tentativa escolhendo uma ação que diferencie hipóteses.',terminal:true,failed:true}
}},
'sim':{title:'Chip não reconhecido',category:'Rede e SIM',description:'Versão didática revisada do fluxo 062. Testes cruzados distinguem SIM e aparelho.',initial:'compare',nodes:{
compare:{text:'SIMULAÇÃO • aparelho A não reconhece SIM S. Como separar falha do SIM de falha do aparelho?',choices:[{label:'SIM S em aparelho bom e SIM bom no aparelho A',next:'result',points:50},{label:'Trocar leitor sem comparação',next:'unsupported',points:0}]},
result:{text:'SIMULAÇÃO • S funciona no aparelho de comparação; SIM conhecido bom também não é detectado em A. Qual conclusão é sustentada?',choices:[{label:'Investigar contatos, compatibilidade e circuito de detecção de A',next:'success',points:50},{label:'Concluir que S está defeituoso',next:'unsupported',points:0}]},
success:{text:'Os testes favorecem uma falha no aparelho A. Ainda não identificam o componente. Justifique o próximo teste.',terminal:true},unsupported:{text:'A conclusão não corresponde ao teste cruzado. Repita considerando SIM e aparelho separadamente.',terminal:true,failed:true}
}},
'vibracao':{title:'Vibração ausente',category:'Sensores',description:'Versão didática revisada do fluxo 082. Separe configuração de resposta física.',initial:'hardware',nodes:{
hardware:{text:'SIMULAÇÃO • a vibração funciona repetidamente no teste de hardware, mas não no toque de chamada. Onde investigar primeiro?',choices:[{label:'Configuração, modo de uso e aplicativo',next:'confirm',points:50},{label:'Trocar motor imediatamente',next:'unsupported',points:0}]},
confirm:{text:'SIMULAÇÃO • vibração de chamadas estava desativada. Ativada, a função responde em reteste. Conclusão?',choices:[{label:'Falha de configuração nesse cenário; documentar e retestar',next:'success',points:50},{label:'Driver de vibração definitivamente ruim',next:'unsupported',points:0}]},
success:{text:'A resposta física e o reteste sustentam configuração como causa neste cenário. Não extrapole para todos os aparelhos.',terminal:true},unsupported:{text:'A troca proposta não é sustentada. Refaça a tentativa e examine a resposta de hardware.',terminal:true,failed:true}
}}
};
