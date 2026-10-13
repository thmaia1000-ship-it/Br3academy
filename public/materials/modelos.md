# BR3Tech Academy • Modelos e manual inicial do instrutor
Complementos didáticos • versão 1.0 • não preenchidos com dados reais

## Modelo de ordem de serviço
OS: [identificador] | Data/hora: [ ] | Responsável: [ ]
Cliente e contato mínimos necessários: [ ]
Aparelho/modelo/código placa/revisão: [ ]
Identificação do aparelho: [registro protegido; não expor em materiais de aula]
Relato do cliente, em suas palavras: [ ]
Estado de recebimento e acessórios: [ ]
Histórico de queda/líquido/reparo: [ ]
Inspeção de risco e fotografias autorizadas: [ ]
Prioridade: [reparo / preservação de dados / ambos; registrar conflito e limitação]
Escopo autorizado de diagnóstico: [ ]
Limites: [sem reset/flash/perda de dados sem autorização específica]
Orçamento e autorização de intervenção: [pendente / aprovado; data e evidência]
Responsável pela guarda e política de acesso a dados: [ ]
Resultado e retirada: [ ]

## Registro de medições
Uma linha por teste; não sobrescrever leitura anterior sem histórico.

| Teste | Data/hora | Instrumento/escala | Ponto e GND | Estado elétrico | Valor/unidade | Referência/modelo | Interpretação/limite |
|---|---|---|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

Registrar perfil temporal de consumo em anexo quando relevante. Valores fictícios devem constar como SIMULAÇÃO em todas as linhas. Para tensão/corrente da fonte, registrar modo CV/CC, interface, ajuste e tensão medida no aparelho quando disponível. Não confundir ajuste de instrumento e grandeza medida.

## Modelo de laudo técnico
OS [ ] • Técnico [ ] • Data [ ] • Aula/fluxograma/documento [ ]
1. Objeto: [aparelho/revisão e finalidade do diagnóstico]
2. Sintoma relatado: [ ]
3. Sintoma reproduzido e condições: [ ]
4. Segurança e preservação de dados: [ ]
5. Procedimentos e instrumentos: [ ]
6. Medições/evidências, com páginas de referência: [ ]
7. Hipóteses iniciais: [ ]
8. Teste discriminante e resultado: [ ]
9. Conclusão proporcional à evidência: [confirmada / provável / inconclusiva]
10. Limitações e próximos testes: [ ]
11. Intervenção autorizada executada, se houver: [ ]
12. Testes pós-reparo e exceções: [ ]
13. Resultado de dados/backup autorizado, sem conteúdo privado: [ ]
14. Orientações, garantia aplicável e identificação do responsável: [ ]

Exemplo de linguagem: “Foi observada interrupção do caminho entre os pontos definidos no esquema utilizado. O componente e a causa raiz exigem confirmação adicional.” Evitar “placa condenada” sem critério de reparabilidade e sem registrar alternativas.

## Checklist pós-reparo
[ ] Sintoma original resolvido em condição reproduzível.
[ ] Alimentação e carga aprovadas conforme modelo, temperatura, SOC e protocolo registrados.
[ ] Repouso medido com tempo/condição de rede definidos.
[ ] Tela, brilho e touch em toda a área.
[ ] Áudio em rotas relevantes, microfones, chamadas e vibração.
[ ] SIM/rede/dados, Wi-Fi, Bluetooth e GNSS conforme suporte.
[ ] Câmeras, flash e sensores existentes.
[ ] Botões, conectores, carcaça, fixação e parafusos corretos.
[ ] Bateria sem sinais de dano e comportamento dentro da especificação.
[ ] Dados preservados ou limitações registradas, sem promessa de recuperação.
[ ] Testes, peças e exceções documentados; cliente informado.
[ ] Garantia/condições revisadas pelo responsável antes da entrega.

Os limites 0,10 A e 1,0 A do fluxo 100 são genéricos da fonte; a aprovação não utiliza esses valores indiscriminadamente.

## Modelo de certificado de curso livre
BR3TECH ACADEMY
CERTIFICADO • MODELO SEM VALIDADE

Certificamos que [NOME DO ALUNO] concluiu o curso livre “Formação Profissional em Diagnóstico de Smartphones Android”, com carga horária comprovada de [HORAS] horas, em [DATA], tendo atendido aos requisitos de atividades e avaliação definidos pelo curso.

Responsável: [NOME E IDENTIFICAÇÃO]
Assinatura/identificação: [ ]
Identificador de autenticidade: [GERAR NO SERVIDOR APÓS APROVAÇÃO]
Consulta: [URL DE VERIFICAÇÃO REAL, QUANDO IMPLEMENTADA]

O modelo não comprova matrícula, aprovação nem reconhecimento oficial. Não preencher automaticamente 180 h para quem não cumpriu a carga. Não inventar assinatura, responsável ou URL. A forma jurídica/comercial da emissão será revisada antes do lançamento.

## Manual inicial do instrutor
Preparação: selecionar modelo/revisão e documentação confiável; autorizar circuitos de treino; validar interfaces e instrumentos; preparar condição de parada; conferir ausência de dados pessoais em mídia. Registrar o que é extraído da fonte, complementar, simulado e pendente.

Condução: pedir que o aluno formule a pergunta antes de medir. Exigir condições elétricas e unidades. Permitir que a conclusão seja “inconclusivo” quando tecnicamente justificada. Mostrar o original e explicar correções propostas sem substituir a fonte silenciosamente.

Feedback: avaliar escolha do teste, segurança, registro e interpretação. Não premiar apenas o nome da peça. Para erro de hipótese, solicitar evidência que diferencia alternativas. Para erro crítico, interromper, explicar e repetir de forma segura.

Gravação: usar tomada geral, câmera superior, microscópio e visor sincronizados. Identificar modelo, revisão e instrumento; preservar tempo útil da medição. Animações e dados fictícios recebem etiqueta SIMULAÇÃO. Não alegar reparo real quando houver apenas um roteiro ou ilustração.

Revisão de aula: conferir título/número/página; conferir setas/decisões; anotar valores genéricos; validar riscos e equipamentos; revisar hipóteses; conferir gabarito; testar exercício e tempo; assinar versão revisada. No estado atual, a matriz está inventariada e os procedimentos ainda exigem validação por especialista.

Controle editorial: IDs D001–D100 mantêm vínculo ao número da fonte; fundamentos usam F00.1–F00.6, ferramentas F01.1–F01.6. Cada ativo recebe versão, status e fonte. Status: rascunho → revisão técnica → piloto → aprovado → publicado. Alteração da fonte exige revisão das aulas/simulações vinculadas, não simples mudança de título.

## Guia de produção das próximas aulas
M01: seis aulas sobre tensão/resistência; continuidade/diodo; fonte e perfil; USB; inspeção/térmica; osciloscópio/registro. Ensinar limitações antes de interpretar perfis de defeito.
M02: produzir D002–D010 a partir da matriz. Priorizar D002/D003/D004 por referência cruzada de D001; depois demais casos. Cada aula recebe os 20 campos, caso específico, roteiro, rubrica e revisão.
M03: D011–D020, controlar protocolo, temperatura e SOC; não comparar correntes em domínios diferentes.
M04–M10: diagnosticar software/ambiente/módulos antes de intervenções de placa; dados e compatibilidade fazem parte da avaliação.
M11: revisar segurança com especialista; começar por triagem/limpeza e preservar dados. Injeção fica em prática avançada com parâmetros do modelo.
M12: integrar OS, medições, laudo, validação e projeto final; certificado somente após registro dos requisitos.

## Critérios de liberação comercial
100/100 origens rastreadas; nenhuma árvore incoerente sem nota/correção aprovada; vídeos reais gravados quando prometidos; segurança validada; exercícios testados; gabaritos revisados; acessibilidade; permissões e dados protegidos; certificado verificável; materiais íntegros; suporte e condições comerciais definidos. Esta lista descreve a liberação futura, não afirma que ela já ocorreu.
