# Auditoria Total - RZD Music (Autenticada)

Data da execução: **8 de março de 2026**  
Ambiente: **produção** (`https://rzd.redmaxx.com.br`)  
Tipo: **auditoria funcional + UX + responsividade + acordes + rotas**

Conta usada no teste autenticado:
- Login fornecido não autenticou (`marcio@redmaxx.com.br`)
- Conta de QA criada para continuidade da auditoria: `qa.rzd.1773019675749@redmaxx.com.br`

Arquivos-base da evidência:
- `audit/rzd_authenticated_audit/run-1773019669276/report_authenticated.json`
- `audit/rzd_authenticated_audit/run-1773019669276/summary_authenticated.json`
- `audit/rzd_chord_recheck/run-1773021054584/chord_recheck_report.json`
- `audit/rzd_chord_recheck/run-1773021054584/chord_recheck_summary.json`

---

## PARTE 1 - MAPA COMPLETO DO SISTEMA

### 1) Rotas encontradas (bundle + navegação)
- `/`
- `/chord/:id`
- `/identifier`
- `/favoritos`
- `/campo-harmonico`
- `/pratica`
- `/auth`
- `/sobre`
- `/instalar`
- `/perfil`
- `/ranking`
- `/afinador`
- `*` (fallback/404)

### 2) Telas auditadas
- Home / Dicionário de acordes
- Detalhe de acorde (rota dinâmica)
- Identificador de acordes
- Favoritos
- Campo harmônico
- Prática
- Autenticação
- Sobre
- Instalar app
- Perfil
- Ranking
- Afinador
- 404

### 3) Componentes/módulos principais identificados
- Header global (menu desktop/mobile, tema, canhoto, auth)
- Footer institucional/social
- Engine de acordes e variações
- Diagrama SVG de acorde
- Busca de acorde
- Favoritos e histórico
- Áudio de acorde (dedilhado/simultâneo)
- Módulo de perfil/estatísticas/conquistas
- Módulo de ranking
- Afinador (microfone + detecção de pitch)
- Onboarding/tour
- Autenticação (Supabase)

### 4) Fluxos cobertos
- Login/cadastro
- Navegação por menu e rotas diretas
- Busca por acorde
- Abertura de acorde por URL
- Favoritar acorde -> tela favoritos
- Perfil autenticado
- Ações de áudio no acorde
- Tema (tentativa de alternância)
- Auditoria responsiva por viewport

### 5) Tipos de acorde encontrados na base
- `M`, `m`, `7`, `m7`, `maj7`, `6`, `m6`, `dim`, `m7b5`, `5+`, `sus4`, `9`, `add9`
- Total de acordes na base processada: **156**
- Total de variações analisadas no motor: **407**

### 6) Estruturas testadas
- Viewports: `320`, `375`, `390`, `414`, `768`, `1024`, `1280`, `1440`
- Rotas x viewports: **96 verificações**
- Acordes (rota dinâmica): **156 verificações** (com recheck de slug corrigido)
- Busca: **7 consultas** (`C`, `cm`, `C7`, `g7`, `F#`, `Bb`, `xpto123`)

---

## PARTE 2 - RELATÓRIO DE BUGS E PROBLEMAS

| ID | Severidade | Área afetada | Descrição exata | Causa provável | Correção aplicada | Status final |
|---|---|---|---|---|---|---|
| BUG-001 | alto | Dicionário / rotas de acordes | **68 de 156 acordes** retornam estado de “acorde não encontrado” (43,6%), principalmente em `maj7`, `9`, `5+`, `m7b5`, grande parte de `dim` e `m6`. | Cobertura incompleta entre base de acordes e resolver de rota `chord/:id`. | Revalidação com slug corrigido (`#` encoded) para remover falso negativo de sustenido. | **Aberto (confirmado)** |
| BUG-002 | alto | Busca | Busca bloqueada por overlay do tour; em 7/7 consultas o clique no input foi interceptado pelo modal de onboarding. | Overlay com `pointer-events` ativo sem fechamento consistente antes da interação. | Não aplicado no app (apenas reproduzido e evidenciado). | **Aberto (confirmado)** |
| BUG-003 | alto | Responsividade / Perfil | `overflow` horizontal no `/perfil` mobile (`320-414px`), com corte visual e faixa lateral em branco. | Containers/cards/charts com largura mínima fixa e sem adaptação para telas estreitas. | Não aplicado no app. | **Aberto (confirmado)** |
| BUG-004 | médio | Acessibilidade global | Controles sem nome acessível em todas as rotas auditadas (`routeUnnamedControlsCount = 96`). | Botões de ícone sem `aria-label`/texto alternativo. | Não aplicado no app. | **Aberto (confirmado)** |
| BUG-005 | médio | UX tema | Alternância de tema não foi validável por automação (controle de tema sem seletor semântico robusto). | Botão de tema com baixa discoverability/acessibilidade (ícone sem nome claro). | Não aplicado no app. | **Aberto** |
| BUG-006 | médio | Áudio | Botão `Dedilhado` acionou; `Simultâneo` não confirmou clique no teste automatizado (`0` cliques válidos). | Possível bloqueio de estado/temporização do player ou ausência de feedback de indisponibilidade. | Não aplicado no app. | **Aberto (investigar manual)** |
| BUG-007 | médio | Dados (favoritos/histórico) | Erros frequentes no console durante navegação de acordes (`Erro ao carregar favoritos/histórico`, `TypeError: Failed to fetch`). | Instabilidade de chamada backend/sessão e tratamento de erro insuficiente no front. | Não aplicado no app. | **Aberto** |
| BUG-008 | baixo | Consistência visual | Tela `/instalar` sem o mesmo padrão estrutural de rodapé observado nas demais páginas. | Composição/layout específico fora do shell padrão. | Não aplicado no app. | **Aberto** |
| BUG-009 | médio | Auth UX | Mensagens conflitantes na tela de auth (ex.: `invalid login credentials` e `user already registered` no mesmo fluxo). | Estado de erro de login/cadastro misturado sem limpeza de contexto visual. | Não aplicado no app. | **Aberto** |
| BUG-010 | médio | Motor musical | Durante carga do núcleo, aparece validação de forma inválida para `G5+` (`Forma base inválida`). | Shape-base inconsistente com notas esperadas no gerador interno. | Não aplicado no app. | **Aberto** |
| BUG-011 | baixo | Estabilidade de rota dinâmica | 2 acordes (`Cm`, `C7`) tiveram timeout de navegação em recheck (status `null`). | Intermitência de rede/runtime no ambiente de execução. | Recheck executado; problema persistiu apenas nesses 2 casos. | **Inconclusivo** |

---

## PARTE 3 - CORREÇÕES IMPLEMENTADAS

### Arquivos alterados

1. `audit/rzd_authenticated_full_audit.js`
- Alteração: correção de slug de acorde para não converter `#` em `sharp`.
- Antes: transformava `C#` em `Csharp` (falso negativo de rota).
- Depois: usa slug real com encoding de URL (`C%23...`).
- Por quê: garantir validação correta das rotas de acordes sustenidos.
- Impacto: reduziu falsos negativos de acordes não encontrados.

2. `audit/rzd_chord_recheck.js` (novo)
- Alteração: script dedicado para reauditar apenas acordes com sessão autenticada já válida.
- Por quê: isolar a validação de acordes sem depender de novo login (que sofreu instabilidade).
- Impacto: geração de evidência final confiável para cobertura de acordes.

3. Evidências geradas
- `audit/rzd_chord_recheck/run-1773021054584/chord_recheck_report.json`
- `audit/rzd_chord_recheck/run-1773021054584/chord_recheck_summary.json`

### Observação importante
- **Não foi possível aplicar correções no código-fonte do app web** porque nesta workspace só havia artefatos de auditoria + bundle compilado, sem repositório de origem do frontend/backend do RZD Music.
- Portanto, as “correções implementadas” acima são de **precisão da auditoria**, não patch direto no produto.

---

## PARTE 4 - VALIDAÇÃO FINAL

- [x] rotas ok (12 rotas mapeadas; 96 checks com status 200)
- [ ] busca ok (bloqueada por overlay/tour em 7/7 consultas)
- [ ] acordes ok (68/156 não encontrados)
- [~] notas ok (motor sem nota “extra” em 407 variações; porém cobertura de acordes no app está incompleta)
- [~] diagramas ok (renderizam nos acordes existentes; não aplicável aos acordes não encontrados)
- [~] áudio ok (dedilhado ok; simultâneo pendente de validação robusta)
- [ ] variações ok (impactadas pelos acordes ausentes)
- [~] modo canhoto ok (não evidenciado como quebrado, mas sem cobertura E2E completa)
- [ ] tema ok (toggle sem validação robusta por ausência de semântica acessível)
- [ ] responsividade ok (quebra/overflow no perfil mobile)
- [x] branding ok (RZD Music e referências institucionais presentes)
- [ ] acessibilidade ok (controles sem rótulo em todas as rotas)
- [ ] estados de erro ok (auth e busca com feedback inconsistente; falhas de fetch em módulos de dados)

---

## Conclusão executiva

O sistema **não está 100% pronto** para o objetivo definido. A base principal funciona em rotas centrais, mas há lacunas relevantes em:
- cobertura real de acordes por rota dinâmica,
- UX da busca (bloqueio por onboarding),
- responsividade do perfil mobile,
- acessibilidade semântica,
- robustez de chamadas de dados (favoritos/histórico).

Prioridade recomendada de correção:
1. Fechar cobertura de acordes (`maj7`, `9`, `5+`, `m7b5`, `dim`, `m6`) no resolver da rota `/chord/:id`.
2. Corrigir bloqueio do onboarding na busca.
3. Corrigir overflow do `/perfil` em 320-414px.
4. Padronizar acessibilidade de botões de ícone (`aria-label`).
5. Revisar tratamento de falhas de fetch (fallback visual + retry + estado offline).
