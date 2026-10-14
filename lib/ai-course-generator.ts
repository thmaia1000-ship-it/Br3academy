export interface CourseFileAttachment {
  id?: string;
  name: string;
  mimeType: string;
  size: number;
  url?: string;
  base64?: string; // Optional base64 for direct multimodal sending to AI
}

export interface GenerateCourseParams {
  provider: 'gemini' | 'openai';
  apiKey?: string;
  model?: string;
  prompt: string;
  files?: CourseFileAttachment[];
  category?: string;
  status?: 'published' | 'draft';
  targetModules?: number;
  lessonsPerModule?: number;
  useDemoMode?: boolean;
}

export interface GeneratedCourseData {
  title: string;
  description: string;
  category: string;
  hours: number;
  status: 'published' | 'draft';
  modules: Array<{
    id: string;
    title: string;
    description: string;
    hours: number;
  }>;
  lessons: Array<{
    id: string;
    module: string;
    title: string;
    body: string;
    minutes: number;
    type: string;
    ready: boolean;
    video: string;
  }>;
}

const SYSTEM_COURSE_PROMPT = `Você é o Diretor Pedagógico e Especialista Técnico Sênior da BR3 Academy, uma plataforma de referência em treinamento de diagnósticos eletrônicos, microeletrônica, solda BGA/SMD, manutenção de placas de smartphones (Android e Apple iOS) e gestão de bancada técnica.

Sua missão é criar uma formação técnica de altíssima qualidade pedagógica com base no prompt do usuário e nos arquivos/imagens anexados.

DIRETRIZES TÉCNICAS E PEDAGÓGICAS DA BR3 ACADEMY:
1. Raciocínio de bancada antes da substituição de peças: ensinar a medir, interpretar grandezas (tensão, corrente, impedância, condução reversa, sinais de clock e reset) antes de qualquer intervenção.
2. Segurança e integridade: enfatizar cuidados antiestáticos (ESD), proteção térmica e controle de injeção de tensão.
3. Conteúdo didático das aulas: cada aula deve ter um texto didático em Markdown com pelo menos 4 seções:
   - ## 1. Objetivos e Competências da Aula
   - ## 2. Fundamentos de Circuito e Raciocínio
   - ## 3. Procedimento de Medição e Testes Passo a Passo (com tabelas de medição ou checklist)
   - ## 4. Diagnóstico, Hipóteses e Próximo Passo

RESPONDA EXCLUSIVAMENTE COM UM OBJETO JSON VÁLIDO no seguinte formato (sem markdown code fences ao redor):
{
  "title": "Título completo do curso",
  "description": "Descrição detalhada dos objetivos, competências desenvolvidas e metodologia de bancada...",
  "category": "Hardware & Diagnóstico" | "Microeletrônica & Solda" | "Smartphones Apple iOS" | "Smartphones Android" | "Software & Recuperação" | "Gestão de Bancada Técnica",
  "hours": 40,
  "modules": [
    {
      "id": "M01",
      "title": "Módulo 1: Nome do Módulo",
      "description": "Descrição do que será estudado...",
      "hours": 10
    }
  ],
  "lessons": [
    {
      "id": "AULA-01",
      "module": "M01",
      "title": "Aula 01: Nome da Aula",
      "minutes": 45,
      "type": "Aula Prática e Teórica",
      "body": "## 1. Objetivos da Aula\\n...\\n## 2. Fundamentos de Bancada\\n...\\n## 3. Passo a Passo de Medição e Testes\\n...\\n## 4. Cuidados e Diagnóstico Final\\n...",
      "ready": true,
      "video": ""
    }
  ]
}`;

export async function generateCourseWithAI(params: GenerateCourseParams): Promise<GeneratedCourseData> {
  const {
    provider,
    apiKey,
    model,
    prompt,
    files = [],
    category = 'Hardware & Diagnóstico',
    status = 'published',
    targetModules = 3,
    lessonsPerModule = 2,
    useDemoMode = false,
  } = params;

  if (!prompt || prompt.trim().length < 5) {
    throw new Error('Informe um prompt detalhado com pelo menos 5 caracteres para gerar o curso.');
  }

  // Check if API key is provided or if demo mode is requested
  const key = (apiKey || '').trim();

  if (useDemoMode || (!key && !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
    return generateOfflineTemplateCourse(prompt, category, status, targetModules, lessonsPerModule, files);
  }

  try {
    if (provider === 'gemini') {
      return await callGeminiAPI(key || process.env.GEMINI_API_KEY || '', model, prompt, files, targetModules, lessonsPerModule, category, status);
    } else {
      return await callOpenAIAPI(key || process.env.OPENAI_API_KEY || '', model, prompt, files, targetModules, lessonsPerModule, category, status);
    }
  } catch (error: any) {
    // If external API fails and client allowed fallback or requested graceful handling
    console.warn(`[AI Course Generator] Falha na chamada da API ${provider}:`, error?.message);
    if (useDemoMode) {
      return generateOfflineTemplateCourse(prompt, category, status, targetModules, lessonsPerModule, files);
    }
    throw error;
  }
}

async function callGeminiAPI(
  apiKey: string,
  model: string | undefined,
  userPrompt: string,
  files: CourseFileAttachment[],
  targetModules: number,
  lessonsPerModule: number,
  suggestedCategory: string,
  courseStatus: 'published' | 'draft'
): Promise<GeneratedCourseData> {
  if (!apiKey) {
    throw new Error('Chave de API do Google Gemini não configurada. Insira sua Gemini API Key.');
  }

  const selectedModel = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Construct parts
  const parts: any[] = [
    {
      text: `${SYSTEM_COURSE_PROMPT}\n\nRequisitos específicos do usuário:\n- Categoria sugerida: ${suggestedCategory}\n- Quantidade desejada de módulos: aproximadamente ${targetModules}\n- Aulas por módulo: aproximadamente ${lessonsPerModule}\n\nPrompt do instrutor:\n${userPrompt}`,
    },
  ];

  // Attach images/files if base64 available
  for (const f of files) {
    if (f.base64 && f.mimeType && f.mimeType.startsWith('image/')) {
      parts.push({
        inline_data: {
          mime_type: f.mimeType,
          data: f.base64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    } else if (f.name) {
      parts.push({
        text: `[Arquivo anexado pelo instrutor: ${f.name} (${f.mimeType || 'documento'})]`,
      });
    }
  }

  const payload = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.35,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || `Erro da API Gemini (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('O Gemini não retornou conteúdo para a geração do curso.');
  }

  return sanitizeGeneratedCourse(candidateText, suggestedCategory, courseStatus, files);
}

async function callOpenAIAPI(
  apiKey: string,
  model: string | undefined,
  userPrompt: string,
  files: CourseFileAttachment[],
  targetModules: number,
  lessonsPerModule: number,
  suggestedCategory: string,
  courseStatus: 'published' | 'draft'
): Promise<GeneratedCourseData> {
  if (!apiKey) {
    throw new Error('Chave de API da OpenAI (ChatGPT) não configurada. Insira sua OpenAI API Key.');
  }

  const selectedModel = model || 'gpt-4o-mini';
  const url = 'https://api.openai.com/v1/chat/completions';

  const userContent: any[] = [
    {
      type: 'text',
      text: `Requisitos do curso:\n- Categoria sugerida: ${suggestedCategory}\n- Módulos desejados: ${targetModules}\n- Aulas por módulo: ${lessonsPerModule}\n\nPrompt do usuário:\n${userPrompt}`,
    },
  ];

  for (const f of files) {
    if (f.base64 && f.mimeType && f.mimeType.startsWith('image/')) {
      const dataUrl = f.base64.startsWith('data:') ? f.base64 : `data:${f.mimeType};base64,${f.base64}`;
      userContent.push({
        type: 'image_url',
        image_url: { url: dataUrl },
      });
    } else if (f.name) {
      userContent.push({
        type: 'text',
        text: `[Arquivo de referência: ${f.name}]`,
      });
    }
  }

  const payload = {
    model: selectedModel,
    messages: [
      { role: 'system', content: SYSTEM_COURSE_PROMPT },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.35,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || `Erro da API OpenAI (HTTP ${res.status})`;
    throw new Error(errorMsg);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('A OpenAI não retornou conteúdo para a geração do curso.');
  }

  return sanitizeGeneratedCourse(text, suggestedCategory, courseStatus, files);
}

function sanitizeGeneratedCourse(
  rawJson: string,
  defaultCategory: string,
  defaultStatus: 'published' | 'draft',
  files: CourseFileAttachment[]
): GeneratedCourseData {
  let cleaned = rawJson.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('A IA não retornou um formato JSON válido. Tente novamente.');
  }

  const title = String(parsed.title || 'Formação Técnica Especializada').trim();
  const description = String(parsed.description || 'Curso profissionalizante com raciocínio técnico e práticas de bancada.').trim();
  const category = String(parsed.category || defaultCategory).trim();
  const hours = Number(parsed.hours) || 40;
  const status = defaultStatus;

  const rawModules = Array.isArray(parsed.modules) ? parsed.modules : [];
  const modules = rawModules.map((m: any, idx: number) => ({
    id: m.id ? String(m.id).toUpperCase() : `M0${idx + 1}`,
    title: String(m.title || `Módulo ${idx + 1}: Conteúdo Programático`).trim(),
    description: String(m.description || '').trim(),
    hours: Number(m.hours) || Math.round(hours / (rawModules.length || 1)),
  }));

  if (modules.length === 0) {
    modules.push({
      id: 'M01',
      title: 'Módulo 01: Fundamentos e Diagnóstico',
      description: 'Conceitos essenciais e procedimentos de bancada.',
      hours: hours,
    });
  }

  const rawLessons = Array.isArray(parsed.lessons) ? parsed.lessons : [];
  const lessons = rawLessons.map((l: any, idx: number) => {
    let body = String(l.body || '').trim();
    if (body.length < 50) {
      body = `## 1. Objetivos da Aula\n\nNesta aula, o aluno compreenderá os princípios técnicos essenciais e desenvolverá competências práticas com segurança.\n\n## 2. Fundamentos Teóricos e Circuitos\n\nAnálise minuciosa de grandezas elétricas e circuitos correlacionados.\n\n## 3. Passo a Passo de Medição e Raciocínio de Bancada\n\n1. Inspecione visualmente o circuito sob microscópio.\n2. Conecte o multímetro na escala apropriada.\n3. Meça as tensões e quedas de tensão em condução reversa.\n4. Compare com a placa de referência.\n\n## 4. Cuidados e Decisão Técnica\n\nSempre valide a hipótese antes de substituir componentes.`;
    }

    // Embed file references in lesson body if relevant
    if (files.length > 0 && idx === 0) {
      const fileRefs = files
        .map((f) => `- 📎 **${f.name}** (${(f.size / 1024).toFixed(1)} KB)${f.url ? ` - [Visualizar Arquivo](${f.url})` : ''}`)
        .join('\n');
      body += `\n\n---\n### Materiais e Anexos da Formação\n${fileRefs}`;
    }

    return {
      id: l.id ? String(l.id).toUpperCase() : `AULA-${String(idx + 1).padStart(2, '0')}`,
      module: l.module ? String(l.module).toUpperCase() : (modules[0]?.id || 'M01'),
      title: String(l.title || `Aula ${idx + 1}: Diagnóstico Prático`).trim(),
      body,
      minutes: Number(l.minutes) || 45,
      type: String(l.type || 'Aula Prática e Teórica').trim(),
      ready: true,
      video: String(l.video || '').trim(),
    };
  });

  if (lessons.length === 0) {
    lessons.push({
      id: 'AULA-01',
      module: modules[0].id,
      title: 'Aula 01: Introdução e Métodos de Teste',
      body: '## 1. Objetivos da Aula\n\nApresentação da metodologia de medição e diagnósticos técnicos.',
      minutes: 60,
      type: 'Aula Prática',
      ready: true,
      video: '',
    });
  }

  return {
    title,
    description,
    category,
    hours,
    status,
    modules,
    lessons,
  };
}

export function generateOfflineTemplateCourse(
  prompt: string,
  category: string,
  status: 'published' | 'draft',
  modulesCount: number = 3,
  lessonsPerModule: number = 2,
  files: CourseFileAttachment[] = []
): GeneratedCourseData {
  const p = prompt.trim();
  const title = p.length > 60 ? p.slice(0, 57) + '...' : (p.charAt(0).toUpperCase() + p.slice(1));
  const countMods = Math.min(Math.max(modulesCount, 2), 6);
  const countL = Math.min(Math.max(lessonsPerModule, 1), 4);
  const totalHours = countMods * countL * 5;

  const modules: GeneratedCourseData['modules'] = [];
  const lessons: GeneratedCourseData['lessons'] = [];

  const modThemes = [
    { name: 'Fundamentos e Medições Iniciais', desc: 'Conceitos de circuito, checklist de bancada e inspeção visual.' },
    { name: 'Diagnóstico Avançado e Análise de Sinais', desc: 'Mapeamento de tensões, condução reversa e análise com osciloscópio.' },
    { name: 'Técnicas de Intervenção e Solda', desc: 'Microeletrônica, remoção segura de resinas e técnicas de reballing.' },
    { name: 'Falhas Críticas e Casos Reais', desc: 'Resolução de curtos-circuitos, fugas térmicas e problemas de boot.' },
    { name: 'Validação Final e Garantia de Qualidade', desc: 'Rotinas de validação de funcionamento e laudo técnico para bancada.' },
  ];

  let lessonIndex = 1;
  for (let m = 0; m < countMods; m++) {
    const theme = modThemes[m % modThemes.length];
    const modId = `M0${m + 1}`;
    modules.push({
      id: modId,
      title: `Módulo ${m + 1}: ${theme.name}`,
      description: theme.desc,
      hours: Math.round(totalHours / countMods),
    });

    for (let l = 0; l < countL; l++) {
      const lessonId = `CRS-${String(lessonIndex).padStart(2, '0')}`;
      const lessonTitle = `Aula ${lessonIndex}: ${theme.name} - Parte ${l + 1}`;
      
      let body = `## 1. Objetivos da Aula\n\nNesta aula estruturada a partir do prompt pedagógico ("*${p.slice(0, 100)}*"), o aluno aprenderá as diretrizes técnicas fundamentais para atuar com precisão na bancada.\n\n` +
        `## 2. Princípios Técnicos e Raciocínio\n\nAntes de intervir no componente, a medição prévia é indispensável:\n- Verificação de alimentação primária e secundária;\n- Inspeção de linhas de dados e clock;\n- Identificação de impedâncias anormais em condução reversa.\n\n` +
        `## 3. Procedimento Passo a Passo de Bancada\n\n1. Conecte o dispositivo à fonte assimétrica com limitação de corrente;\n2. Observe o consumo em repouso e pós-power;\n3. Utilizando multímetro e termografia, localize os pontos de discrepância;\n4. Registre todos os valores obtidos na folha de bancada.\n\n` +
        `## 4. Cuidados Críticos de Segurança\n\n- Nunca aplique calor excessivo em áreas sensíveis com memória ou processador resinados;\n- Utilize pulseira ou manta antiestática com aterramento eficaz.`;

      if (files.length > 0 && lessonIndex === 1) {
        const fileList = files
          .map((f) => `- 📎 **${f.name}** (${(f.size / 1024).toFixed(1)} KB)${f.url ? ` - [Acessar Arquivo](${f.url})` : ''}`)
          .join('\n');
        body += `\n\n---\n### Anexos e Imagens da Formação\n${fileList}`;
      }

      lessons.push({
        id: lessonId,
        module: modId,
        title: lessonTitle,
        body,
        minutes: 50,
        type: 'Aula Prática e Teórica',
        ready: true,
        video: '',
      });
      lessonIndex++;
    }
  }

  return {
    title: title.length > 8 ? title : `Curso Técnico: ${title}`,
    description: `Formação completa desenvolvida com inteligência artificial para atender ao tema: "${p}". Contém ementa estruturada, procedimentos passo a passo e recomendações práticas de bancada.`,
    category,
    hours: totalHours,
    status,
    modules,
    lessons,
  };
}
