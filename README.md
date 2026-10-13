# BR3 Academy

Formação Profissional em Diagnóstico de Smartphones Android.

Aprenda a medir, interpretar e diagnosticar antes de substituir componentes.

## Recursos atuais

- Área do aluno, Minha conta, progresso individual e retomada de percursos.
- Aulas interativas em modo de foco, exercícios corrigidos no servidor e imagens com referência à fonte.
- 13 módulos e 100 fluxogramas; 112 aulas previstas, com 13 textos completos disponíveis.
- Biblioteca pesquisável, laboratório simulado, avaliações e relatórios de práticas.
- Administração de conteúdos, questões, arquivos e revisão de atividades.
- Identidade visual BR3Tech, materiais PDF e imagens do curso incluídos.

## Tecnologia

React 19, TypeScript, Vinext/Vite, Cloudflare Workers, D1 (SQLite), Drizzle e R2.
O código foi exportado da versão publicada do Site. Não contém dados de alunos nem arquivos enviados ao R2 após a publicação.

## Instalação local

Requer Node.js >=22.13.0, pnpm 11.25.0 e Git.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Use o endereço exibido no terminal. Sem o perfil local de execução, o projeto usa automaticamente o modo portátil.
O login de desenvolvimento no endereço de loopback é uma simulação de identidade do starter, não autenticação Google nem uma conta real de aluno.

## Verificação

```sh
pnpm exec tsc --noEmit
pnpm build
node tests/academy.integration.mjs
```

Os testes criam bases e usuários fictícios e conferem isolamento, permissões, avaliação, segurança, etapas interativas e arquivos.

## Organização

- `app/`: interface e rotas de API.
- `lib/`: curso, fluxogramas, avaliações, percursos e metadados das imagens.
- `db/schema.ts`: estrutura do banco.
- `drizzle/`: migrações e histórico do esquema.
- `public/images/`: identidade e imagens de aprendizagem.
- `public/materials/`: PDFs e modelos.
- `tests/`: testes de integração.
- `build/` e `scripts/`: integração de runtime e ferramentas de desenvolvimento.
- `.openai/hosting.json`: vínculo com o Site e bindings DB/BUCKET. O identificador do projeto não é uma credencial.

## Autenticação e hospedagem

O Site atual usa autenticação gerenciada pelo ChatGPT e permanece privado.
Salvar o código no GitHub não altera o site publicado, não libera alunos externos e não ativa Google OAuth.
A autenticação de produção depende da infraestrutura Sites que injeta a identidade confiável no servidor.
Não publique este Worker isoladamente aceitando os cabeçalhos de identidade enviados diretamente por clientes.
Para outra hospedagem, substitua a integração de identidade por uma implementação verificável, configure os bindings D1/R2, aplique as migrações e defina previamente o administrador.
O cadastro automático do proprietário inicial em `lib/server.ts` pressupõe o acesso privado do Site original; precisa ser substituído antes de uma abertura pública.
Credenciais de Google OAuth e armazenamento não acompanham este pacote.

## Banco e arquivos

O pacote inclui o esquema e as migrações, não uma cópia do banco de produção.
O código utiliza DB para D1 e BUCKET para R2. A infraestrutura deve disponibilizar esses bindings.
Preserve as migrações existentes ao gerar novas com `pnpm db:generate`.

## Importar no GitHub

1. Crie um repositório privado chamado `br3-academy`, sem README, licença ou .gitignore automáticos.
2. Extraia este ZIP. Entre na pasta que contém `package.json`.
3. Substitua SEU_USUARIO pelo proprietário do repositório nos comandos abaixo.

```sh
git init -b main
git add .
git commit -m "Importar BR3 Academy"
git remote add origin https://github.com/SEU_USUARIO/br3-academy.git
git push -u origin main
```

Autentique pelo procedimento do GitHub no seu computador. Não compartilhe senhas ou tokens em conversas.
Para o envio assistido, forneça o link do repositório e habilite seu acesso na conexão GitHub.

## Limitações pedagógicas

99 aulas de diagnóstico ainda têm percursos de referência e não aulas completas.
Videoaulas reais, validação técnica por modelo e emissão final de certificados continuam pendentes.
As medições de simulação são fictícias e os parâmetros do PDF original são genéricos.
Materiais da marca e PDFs não recebem licença pública neste export. Mantenha o repositório privado para preservar o conteúdo do curso.
