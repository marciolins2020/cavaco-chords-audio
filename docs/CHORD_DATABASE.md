# Sistema de Banco de Dados de Acordes

## Visão Geral

O **RZD Music - Dicionário de Acordes** utiliza um sistema de banco de dados local embutido que permite funcionamento offline completo. O app inclui um dicionário base com 190+ acordes e suporta importação de acordes customizados via arquivo JSON.

## Arquitetura

### 1. Banco de Dados Padrão (`DEFAULT_DB`)

Localizado em: `src/constants/chordDatabase.ts`

```typescript
export const DEFAULT_DB: ChordDatabase = {
  version: "1.0",
  description: "Dicionário com mais de 2000 acordes para cavaquinho",
  tuning: "D-G-B-D (Ré-Sol-Si-Ré)",
  author: "Mario Sérgio",
  chords: [...]
}
```

**Características:**
- ✅ Embutido no código (funciona offline)
- ✅ 190+ acordes com múltiplas posições
- ✅ Afinação padrão D-G-B-D (Ré-Sol-Si-Ré)
- ✅ Tipos: maior, menor, 7, maj7, m7, dim, aug, sus2, sus4, add9, etc.

### 2. Sistema de Importação

**Componente:** `src/components/JSONImporter.tsx`

Permite importar acordes customizados via arquivo JSON. Os acordes importados são:
- Mesclados com o banco padrão
- Salvos no `localStorage` do navegador
- Disponíveis em todas as sessões

**Localização:** Botão "Importar Acordes" no header (desktop)

## Estrutura do Arquivo JSON

### Formato Completo

```json
{
  "version": "1.0",
  "description": "Meu banco de acordes customizado",
  "tuning": "D-G-B-D",
  "author": "Seu Nome",
  "chords": [
    {
      "key": "C",
      "suffix": "major",
      "positions": [
        {
          "frets": [3, 2, 0, 3],
          "fingers": [2, 1, 0, 3],
          "baseFret": 0,
          "barre": null
        }
      ]
    }
  ]
}
```

### Campos Obrigatórios

#### Nível Raiz
- `chords` (array): Lista de acordes

#### Cada Acorde
- `key` (string): Nota fundamental (C, C#, D, Eb, E, F, F#, G, Ab, A, Bb, B)
- `suffix` (string): Tipo do acorde (ver lista abaixo)
- `positions` (array): Array de posições/variações

#### Cada Posição
- `frets` (array[4]): Casas nas 4 cordas [corda4, corda3, corda2, corda1]
  - `0` = corda solta
  - `1-15` = número da casa
  - `-1` = corda abafada (X)
- `fingers` (array[4]): Dedos [dedo4, dedo3, dedo2, dedo1]
  - `0` = não usar dedo (corda solta ou abafada)
  - `1-4` = indicador, médio, anelar, mínimo
- `baseFret` (number): Casa inicial (0 = próximo ao corpo, aumenta em direção à boca)
- `barre` (number|null): Casa da pestana (se houver)

### Sufixos Suportados

```
major, minor, dim, aug, sus2, sus4
7, maj7, m7, mMaj7, dim7, m7b5
6, m6, 6/9
9, m9, maj9, add9, madd9, 7b9, 7#9, 9b5, 9#5
11, m11, maj11
13, m13, maj13
7b5, 7#5, 7sus4, 7sus2
```

## Exemplos de Uso

### 1. Importar Acordes Básicos

```json
{
  "chords": [
    {
      "key": "C",
      "suffix": "major",
      "positions": [{
        "frets": [3, 2, 0, 3],
        "fingers": [2, 1, 0, 3],
        "baseFret": 0
      }]
    },
    {
      "key": "G",
      "suffix": "7",
      "positions": [{
        "frets": [0, 2, 1, 2],
        "fingers": [0, 2, 1, 3],
        "baseFret": 0
      }]
    }
  ]
}
```

### 2. Acorde com Múltiplas Posições

```json
{
  "key": "D",
  "suffix": "minor",
  "positions": [
    {
      "frets": [2, 2, 1, 0],
      "fingers": [2, 3, 1, 0],
      "baseFret": 0
    },
    {
      "frets": [5, 5, 5, 3],
      "fingers": [2, 3, 4, 1],
      "baseFret": 0
    }
  ]
}
```

### 3. Acorde com Pestana

```json
{
  "key": "F",
  "suffix": "major",
  "positions": [{
    "frets": [5, 5, 5, 5],
    "fingers": [1, 1, 1, 1],
    "baseFret": 0,
    "barre": 5
  }]
}
```

## Como Usar

### Desktop

1. Clique no botão **"Importar Acordes"** no header
2. Arraste um arquivo `.json` ou clique para selecionar
3. O arquivo será validado automaticamente
4. Acordes serão mesclados com o banco existente
5. Pronto! Os novos acordes estão disponíveis

### Validação

O sistema valida:
- ✅ Estrutura JSON válida
- ✅ Array `chords` presente
- ✅ Cada acorde tem `key`, `suffix`, `positions`
- ✅ Cada posição tem arrays de 4 elementos
- ✅ `baseFret` é um número

### Mesclagem de Acordes

Quando você importa acordes customizados:
- Acordes com mesmo `key + suffix` **sobrescrevem** os padrão
- Acordes novos são **adicionados** ao banco
- Banco padrão permanece intacto (pode resetar a qualquer momento)

### Resetar para Padrão

Para voltar ao banco padrão:
```typescript
const { resetChordDatabase } = useApp();
resetChordDatabase();
```

## Persistência

- **LocalStorage**: Acordes customizados salvos em `customChordDatabase`
- **Offline-First**: Funciona completamente sem internet
- **Sincronização**: Mantém entre sessões do navegador

## API do Contexto

```typescript
const {
  chordDatabase,        // Banco atual (padrão + custom)
  importChordDatabase,  // Importa novos acordes
  resetChordDatabase    // Reseta para padrão
} = useApp();
```

## Referência de Afinação

### Cavaquinho Padrão (D-G-B-D)

```
Corda 1 (mais aguda): D5 - 587.33 Hz
Corda 2: B4 - 493.88 Hz
Corda 3: G4 - 392.00 Hz
Corda 4 (mais grave): D4 - 293.66 Hz
```

### Fórmula de Frequência

Para calcular a frequência de uma nota em qualquer casa:

```
f = f0 × 2^(casa/12)
```

Onde:
- `f0` = frequência da corda solta
- `casa` = número da casa (0 = solta, 1 = primeira casa, etc.)

## Contribuindo

Para contribuir com novos acordes:

1. Crie um arquivo JSON seguindo a estrutura acima
2. Valide usando o importador
3. Compartilhe na comunidade
4. Considere fazer um PR no repositório principal

## Recursos Futuros

- [ ] Exportar banco customizado
- [ ] Compartilhar via URL/QR Code
- [ ] Importar de outros formatos (ChordPro, UltimateGuitar)
- [ ] Editor visual de acordes
- [ ] Backup em nuvem (sincronização entre dispositivos)

## Suporte

Dúvidas? Entre em contato:
- 📧 Email: suporte@rzdmusic.com
- 💬 Discord: [RZD Music Community](#)
- 📱 Instagram: @rzdmusic
