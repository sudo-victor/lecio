# Lécio — Assistente de Planejamento de Aulas

## Visão
IA que entrega um plano de aula completo em **< 5 minutos** a partir de um único campo de entrada, para professores do Ensino Fundamental II e Médio de escolas públicas.

**Critério de sucesso:** ≥ 7/10 professores afirmarem "Isso realmente facilitou minha vida."

## Problema
Professores enfrentam: falta de tempo para pesquisa, domínio parcial de todos os temas da grade e dificuldade de adaptar conteúdo para alunos com atenção fragmentada → planejamento burocrático, exaustivo e com improviso constante.

## Fluxo do MVP
1. Professor acessa → campo único: "Sobre o que é sua aula?"
2. Digita o tema livremente (ex: "fotossíntese", "Segunda Guerra", "equações do 2º grau")
3. Clica em [Gerar Plano de Aula]
4. IA processa → retorna output nas 6 seções
5. Professor vê o plano formatado em 6 seções navegáveis
6. Ao final: foi útil? ✅ Sim / ❌ Não

## Output: 6 Seções Obrigatórias (nesta ordem)

**6.1 Fundamentação Acadêmica** — conceito formal + competências e habilidades BNCC; referencias apenas a obras clássicas conhecidas ou diretamente à BNCC (nunca inventar fontes).

**6.2 Contexto Rápido para o Professor** — explicação simplificada para aumentar segurança do professor + conexões interdisciplinares + onde o tema gera dúvida/resistência.

**6.3 Como Explicar para a Turma** — analogias do cotidiano (não forçadas) + exemplos reais + linguagem simples sem gíria forçada.

**6.4 Pontos de Confusão Comuns** — onde alunos erram/travam + como corrigir + pergunta estratégica para destravar entendimento.

**6.5 Roteiro de Aula — 50 minutos**
| Bloco | Tempo | Descrição |
|---|---|---|
| Abertura provocativa | 10 min | Pergunta ou situação-problema que engaja imediatamente |
| Explicação em blocos | 20 min | 2–3 blocos de no máximo 7 min cada |
| Atividade prática leve | 12 min | Exercício individual ou em dupla |
| Fechamento reflexivo | 8 min | Recapitulação + pergunta reflexiva para levar para casa |

**6.6 Perguntas Avaliativas** — 3 objetivas (múltipla escolha) + 2 discursivas (resposta curta) + 1 reflexiva (sem resposta certa); todas classificadas por nível cognitivo (Bloom).

## Arquitetura
- **Frontend:** input único + botão Gerar + exibição das 6 seções + feedback binário; responsivo (mobile)
- **Backend:** endpoint de API + prompt fixo + integração LLM (modelo atual: Claude Haiku 4.5)
- **LLM:** system prompt estruturado e rígido; sem RAG na v1
- **Dados:** log de interações (input, output, feedback) em SQLite ou Postgres

## System Prompt (Base)
```
Você é um assistente pedagógico especializado em planejamento de aulas para professores
do ensino fundamental II e médio. Seu objetivo é gerar um plano de aula completo e estruturado.

REGRAS OBRIGATÓRIAS:
1. Sempre responda nas 6 seções definidas, nesta ordem exata
2. Nunca invente referências bibliográficas específicas (autores/anos/editoras)
3. Use apenas obras clássicas amplamente conhecidas ou referencie diretamente a BNCC
4. Mantenha blocos curtos — máximo 5 linhas por subitem
5. Infira o nível de ensino pelo tema; se ambíguo, use ensino médio como padrão
6. Nunca responda fora do contexto educacional
```

## Requisitos

**Funcionais (S1, Alta):** gerar plano a partir de 1 input livre (RF01) · estruturar nas 6 seções (RF02) · referências confiáveis BNCC/clássicos (RF03) · conexão com competências BNCC (RF04) · tradução para professor e aluno (RF05) · log de interações (RF08)
**Funcionais (S1, Média):** registro de feedback binário (RF06)
**Funcionais (S2, Média):** interface responsiva/mobile (RF07)

**Não-Funcionais (S1, Alta):** resposta < 8s P95 (RNF01) · output escaneável sem muros de texto (RNF02) · linguagem clara e aplicável (RNF03) · zero alucinação de referências (RNF04)
**Não-Funcionais (S2, Média):** disponibilidade > 99% em horário escolar 7h–18h (RNF05)

## Fora do Escopo (v1)
Login · histórico · exportação PDF · dashboard · personalização avançada (série/duração/estilo) · integração com secretaria · RAG/busca em tempo real · editor de texto

## Riscos
1. **Alucinação de referências** → instruir no prompt; testar 20+ temas antes do lançamento
2. **Conteúdo genérico** → prompt rígido com exemplos de qualidade; iterar com feedback
3. **Output longo demais** → limite de linhas por subseção no prompt; validar com professores reais
4. **Professor não confiar na IA** → seção 6.1 ancora credibilidade; transparência sobre limitações

## Métricas de Validação
**Primárias:** "Você usaria isso amanhã?" (meta: >70% sim) · "Aumentou sua segurança?" (meta: >70% sim)
**Secundárias:** tempo economizado · feedback positivo por disciplina · sessões com output sem edição
**Pivô:** se < 50% de positivos na 1ª rodada → revisar formato antes de continuar
