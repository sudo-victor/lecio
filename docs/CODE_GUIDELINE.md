# CODEGUIDELINE — Lécio MVP
Stack: Next.js · Tailwind CSS · Claude API · Neon PostgreSQL · Drizzle · Vercel
Princípio: clareza acima de esperteza. Código legível, previsível, fácil de deletar.

---

## Estrutura de Pastas

```
lecio/
├── app/
│   ├── layout.tsx              # Root layout, fontes, metadata
│   ├── page.tsx                # Tela principal (idle — input)
│   ├── globals.css
│   └── api/
│       ├── generate/route.ts   # Streaming Claude API
│       └── feedback/route.ts   # Salva feedback no Neon
├── components/
│   ├── ui/                     # Button.tsx · Input.tsx · SectionCard.tsx
│   └── lecio/                  # Header · TopicChip · PlanOutput · SectionList · FeedbackBar
├── lib/
│   ├── claude.ts               # SYSTEM_PROMPT · MODEL · MAX_TOKENS
│   ├── db.ts                   # Conexão Neon + instância Drizzle
│   └── utils.ts
├── db/schema.ts                # Schema Drizzle
├── hooks/useGenerate.ts        # Estados: idle/loading/result/error
├── types/plan.ts               # Tipos TypeScript do output
├── tailwind.config.ts          # Tokens de design
├── .env.local                  # NUNCA commitar
└── .env.example
```

---

## Variáveis de Ambiente

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=        # Opcional; padrão: claude-haiku-4-5
DATABASE_URL=           # Neon pooled (runtime)
DATABASE_URL_UNPOOLED=  # Neon direct (migrações drizzle-kit push)
```

- Acessar apenas via `process.env` em Server Components ou API Routes
- Nunca expor no cliente

---

## TypeScript

- `"strict": true` no tsconfig
- Proibido `any` — usar `unknown` quando o tipo não for conhecido
- Sempre tipar retorno de funções assíncronas
- `interface` para objetos de domínio · `type` para unions/aliases

```ts
interface LessonPlan {
  foundation: string
  teacherContext: string
  studentExplanation: string
  commonMistakes: string
  lessonScript: string
  assessmentQuestions: string
}
```

---

## Nomenclatura

| Elemento          | Convenção        | Exemplo                      |
|-------------------|------------------|------------------------------|
| Componentes       | PascalCase       | `SectionCard.tsx`            |
| Hooks             | camelCase + `use`| `useGenerate.ts`             |
| Funções utilitárias | camelCase      | `parseSection()`             |
| Constantes globais| UPPER_SNAKE_CASE | `MAX_TOKENS`                 |
| Variáveis e props | camelCase        | `isLoading`, `planOutput`    |
| Arquivos de rota  | `route.ts`       | `app/api/generate/route.ts`  |

---

## Componentes React

- Sempre functional components com arrow function
- Props tipadas com `interface` acima do componente
- Um componente por arquivo; sem mistura de default + named exports

```tsx
interface SectionCardProps {
  title: string
  content: string
  defaultOpen?: boolean
}

const SectionCard = ({ title, content, defaultOpen = false }: SectionCardProps) => {
  // ...
}

export default SectionCard
```

---

## Server vs Client Components

- Padrão: Server Component (sem `"use client"`)
- `"use client"` apenas para: estado local, eventos, hooks do browser
- Fetch e chamadas de API sempre no servidor

```
app/page.tsx                     → Server (renderiza shell)
components/lecio/PlanOutput.tsx  → "use client" (accordion state)
app/api/generate/route.ts        → Server (acessa ANTHROPIC_API_KEY)
```

---

## Design System — Tailwind

Usar **sempre** tokens do `tailwind.config.ts`. Proibido `style={{}}` ou valores hardcoded.

### Paleta

| Token       | Valor     | Uso                        |
|-------------|-----------|----------------------------|
| `green-500` | `#33cc99` | CTA, accent, destaques     |
| `green-600` | `#28a37a` | Hover do CTA               |
| `gray-50`   | `#f4f4f4` | Background de cards        |
| `gray-100`  | `#dfdfdf` | Bordas suaves              |
| `gray-800`  | `#272727` | Texto primário             |
| `gray-700`  | `#3a3a3b` | Texto corpo                |
| `gray-500`  | `#626263` | Texto secundário           |
| `gray-300`  | `#a0a0a1` | Texto muted                |

### Tipografia — Lexend Deca

| Classe                 | Peso | Uso                         |
|------------------------|------|-----------------------------|
| `font-display-light`   | 300  | Taglines, subtítulos suaves |
| `font-display`         | 400  | Corpo de texto              |
| `font-display-medium`  | 500  | Labels de UI, placeholders  |
| `font-display-semibold`| 600  | Títulos de seção            |
| `font-display-bold`    | 700  | Wordmark, CTA               |

### Mobile-first

Estilos base para mobile; breakpoints apenas para desktop.

```tsx
<div className="px-4 md:px-0 md:max-w-[640px] md:mx-auto">
```

---

## Claude API

Modelo atual: **claude-haiku-4-5** (configurável via `ANTHROPIC_MODEL`).

### lib/claude.ts

```ts
export const SYSTEM_PROMPT = `
Você é um assistente pedagógico especializado em planejamento de aulas
para professores do ensino fundamental II e médio.

REGRAS OBRIGATÓRIAS:
1. Sempre responda nas 6 seções definidas, nesta ordem exata
2. Nunca invente referências bibliográficas específicas
3. Use apenas obras clássicas amplamente conhecidas ou cite diretamente a BNCC
4. Mantenha blocos curtos — máximo 5 linhas por subitem
5. Infira o nível de ensino pelo tema; se ambíguo, use ensino médio como padrão
6. Nunca responda fora do contexto educacional

FORMATO DE RESPOSTA OBRIGATÓRIO:
## 1. Fundamentação Acadêmica
## 2. Ementa
## 3. Como Explicar para a Turma
## 4. Pontos de Confusão Comuns
## 5. Roteiro de Aula (50 min)
## 6. Perguntas Avaliativas
`

export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5'
export const MAX_TOKENS = 2048
```

### app/api/generate/route.ts — Streaming obrigatório

Resposta **sempre** streamada (RNF: < 2s para primeiro conteúdo visível).

```ts
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, MODEL, MAX_TOKENS } from '@/lib/claude'

export async function POST(req: Request) {
  const { topic } = await req.json()
  const client = new Anthropic()
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: topic }],
  })
  return new Response(stream.toReadableStream())
}
```

### Regras Claude API

- Nunca chamar a Claude API do cliente
- Nunca logar output em produção
- Validar que `topic` não é vazio antes de chamar
- `topic` máximo 280 caracteres

---

## Banco de Dados — Neon + Drizzle

### db/schema.ts

```ts
import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const interactions = pgTable('interactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  topic: text('topic').notNull(),
  output: text('output').notNull(),
  useful: boolean('useful'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### lib/db.ts

```ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

### Regras DB

- `DATABASE_URL` (pooled) em runtime
- `DATABASE_URL_UNPOOLED` (direct) apenas para `drizzle-kit push`
- Nunca fazer queries no cliente
- Salvar `output` completo para análise qualitativa

---

## Estado da Aplicação — useGenerate

```ts
type GenerateState = 'idle' | 'loading' | 'result' | 'error'

interface UseGenerateReturn {
  state: GenerateState
  topic: string
  output: string
  setTopic: (topic: string) => void
  generate: () => Promise<void>
  reset: () => void
}
```

Transições válidas: `idle → loading → result | error` · `result | error → idle`

---

## Tratamento de Erros

- Sempre `try/catch` em chamadas de API
- Erros de rede: mensagem amigável, nunca stack trace
- Rate limit / timeout Claude: mensagem com orientação para tentar novamente
- `console.log` apenas com `process.env.NODE_ENV === 'development'`

---

## Performance

- Streaming first — professor vê conteúdo em < 2s
- Sem libs de animação externas — apenas Tailwind transitions
- Sem imagens — produto é texto
- Lexend Deca via `next/font/google` com `display: swap`

```ts
// app/layout.tsx
import { Lexend_Deca } from 'next/font/google'
const lexend = Lexend_Deca({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-lexend',
})
```

---

## Hard Rules (proibido)

| Proibido                                     |
|----------------------------------------------|
| `any` no TypeScript                          |
| Claude API no cliente                        |
| Cores hardcoded fora do Tailwind config      |
| Commitar `.env.local`                        |
| Nova tabela sem atualizar `schema.ts`        |
| Adicionar biblioteca sem justificativa       |
| Múltiplos componentes no mesmo arquivo       |
| CSS inline `style={{}}`                      |

---

## Checklist pré-commit

- [ ] `tsc --noEmit` sem erros
- [ ] Sem `console.log` fora de bloco de desenvolvimento
- [ ] Novas env vars adicionadas ao `.env.example`
- [ ] Novo componente tem props tipadas
- [ ] Sem `any` introduzido
- [ ] Mobile testado (375px e 390px)
