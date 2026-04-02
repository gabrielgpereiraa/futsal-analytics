# Futsal Analytics — V0.1

Plataforma web para análise manual de partidas de futsal gravadas em vídeo.

---

## Pré-requisitos

- Node.js 20+
- npm 10+ (ou pnpm/yarn)
- Conta no [Supabase](https://supabase.com) (plano gratuito é suficiente)

---

## 1. Configuração do Supabase

### 1.1 Criar o projeto

1. Acesse https://app.supabase.com e crie um novo projeto.
2. Anote a **URL** e as chaves **anon** e **service_role**.

### 1.2 Executar a migration

No painel do Supabase, vá em **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/migrations/001_initial.sql
```

Isso cria todas as tabelas, enums, triggers, políticas RLS e o bucket de Storage.

### 1.3 Verificar o bucket

Em **Storage → Buckets**, confirme que o bucket `match-videos` foi criado.  
Ele deve estar como **Private** (não público).

### 1.4 Configurar autenticação

Em **Authentication → Providers**, confirme que **Email** está habilitado.

Para criar o primeiro usuário, vá em **Authentication → Users → Add user**.

---

## 2. Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd futsal-analytics

# Instale as dependências
npm install

# Copie as variáveis de ambiente
cp .env.example .env.local
```

Edite `.env.local` com os valores do seu projeto Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ A `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no cliente.  
> Ela é usada apenas em Route Handlers server-side.

---

## 3. Instalar componentes shadcn/ui

```bash
npx shadcn@latest init
```

Quando perguntado, selecione:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

Em seguida, instale os componentes usados:

```bash
npx shadcn@latest add alert alert-dialog badge button card \
  input label progress select separator slider switch \
  textarea toast tooltip
```

---

## 4. Executar

```bash
npm run dev
```

Acesse http://localhost:3000 — você será redirecionado para `/login`.

---

## 5. Fluxo de uso

### Primeiro acesso

1. Faça login com o usuário criado no Supabase Auth.
2. Vá em **Times → Novo time** e cadastre pelo menos 2 times.
3. Vá em **Jogadores → Novo jogador** e cadastre os jogadores de cada time.
4. Vá em **Partidas → Nova partida** e selecione os times e a data.
5. Na página da partida, clique em **Enviar vídeo** e aguarde o upload.
6. Após o upload, clique em **Iniciar revisão**.

### Tela de revisão

| Hotkey         | Ação                         |
|----------------|------------------------------|
| `Space`        | Play / Pause                 |
| `J`            | Voltar 2 segundos            |
| `L`            | Avançar 2 segundos           |
| `,`            | Frame anterior               |
| `.`            | Próximo frame                |
| `1`            | Marcar: Gol                  |
| `2`            | Marcar: Finalização          |
| `3`            | Marcar: Defesa               |
| `4`            | Marcar: Dividida             |
| `5`            | Marcar: Falta                |
| `6`            | Marcar: Recuperação          |
| `7`            | Marcar: Perda de bola        |
| `Enter`        | Salvar evento                |
| `Backspace`    | Desfazer último evento (até 10s) |

**Fluxo típico de revisão:**

1. Assista o vídeo com `Space`.
2. Ao ver um lance, pressione a hotkey do tipo de evento (ex: `1` para gol).
3. O vídeo pausa automaticamente.
4. Selecione o time e o jogador no painel lateral.
5. Pressione `Enter` para salvar.
6. Continue com `Space`.

---

## 6. Checklist de testes manuais

- [ ] Login com e-mail/senha válido funciona
- [ ] Login com credenciais erradas mostra mensagem de erro
- [ ] Criar time com abreviação de 5 caracteres
- [ ] Tentar criar time com abreviação de 6 caracteres falha com mensagem clara
- [ ] Criar jogador vinculado a um time
- [ ] Criar partida com dois times diferentes
- [ ] Tentar criar partida com o mesmo time para os dois lados falha
- [ ] Upload de vídeo MP4 funciona e exibe progresso
- [ ] Após upload, status da partida muda para "Vídeo enviado"
- [ ] Tela de revisão carrega o vídeo corretamente
- [ ] `Space` inicia e pausa o vídeo
- [ ] `J` / `L` movem o vídeo em 2 segundos
- [ ] `,` / `.` avançam frame a frame (com vídeo pausado)
- [ ] Pressionar `1` pausa o vídeo e preenche o tipo "Gol" no form
- [ ] `Enter` salva o evento e ele aparece na lista e na timeline
- [ ] Clicar em um marcador da timeline navega para o timestamp correto
- [ ] Filtrar eventos por tipo e por time funciona
- [ ] Editar um evento pelo botão de lápis carrega os dados no form
- [ ] Excluir um evento com confirmação remove da lista e da timeline
- [ ] `Backspace` desfaz o último evento se foi criado há menos de 10s
- [ ] Página de estatísticas exibe gols, finalizações e comparativo correto
- [ ] Usuário A não vê dados do usuário B (RLS)

---

## 7. Estrutura do projeto

```
futsal-analytics/
├── app/
│   ├── (auth)/login/          # Página de login
│   ├── (app)/
│   │   ├── dashboard/         # Resumo geral
│   │   ├── teams/             # CRUD de times
│   │   ├── players/           # CRUD de jogadores
│   │   └── matches/
│   │       ├── [id]/
│   │       │   ├── page.tsx          # Hub da partida + upload
│   │       │   ├── review/           # Tela de revisão
│   │       │   └── stats/            # Estatísticas
│   │       └── new/
│   └── api/matches/[id]/video-url/   # Route Handler: signed URL
├── components/
│   ├── layout/sidebar.tsx
│   ├── teams/
│   ├── players/
│   ├── matches/
│   └── review/                # VideoPlayer, Timeline, EventForm, EventList
├── hooks/
│   ├── use-video-player.ts
│   ├── use-hotkeys.ts
│   └── use-match-events.ts
├── lib/
│   ├── types/                 # database.ts + index.ts (domain types)
│   ├── schemas/               # Zod schemas
│   ├── stats/                 # match-stats.ts
│   ├── supabase/              # client.ts + server.ts
│   └── utils/                 # cn.ts + format.ts
├── supabase/migrations/
│   └── 001_initial.sql
├── middleware.ts
└── .env.example
```

---

## 8. Limitações conhecidas da V0.1

- **Frame-a-frame impreciso:** depende de codec e FPS fixo (default 30). Vídeos com FPS diferente terão step errado. Corrigível na V0.2 lendo o FPS real do arquivo.
- **Signed URLs expiram em 12h:** se a tela de revisão ficar aberta por mais de 12h, o vídeo para. Renovação automática não implementada.
- **Sem busca de partidas:** a listagem de partidas não tem filtro/busca. Aceitável para volume pequeno.
- **Upload sem retry automático:** falhas de rede durante upload requerem novo upload manual.
- **Sem suporte mobile:** a tela de revisão foi projetada exclusivamente para desktop.
- **FPS configurado manualmente:** o valor de 30 FPS é padrão. Para outros valores, edite diretamente o registro `match_videos` ou adicione campo no form de upload na V0.2.

---

## Próximos passos seguros (V0.2)

1. Leitura real de FPS e duração via ffprobe no upload (serviço Python)
2. Renovação automática de signed URL na tela de revisão
3. Exportação de estatísticas em CSV
4. Busca/filtro na listagem de partidas
5. Suporte a hotkey presets configuráveis por usuário
