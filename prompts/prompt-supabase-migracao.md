# Prompt — Migração para Supabase

> Cole inteiro no Claude Code, na raiz do projeto `kaue-uniformes-crm`.
> ⚠️ Faça **backup do projeto** antes de rodar (commit no git ou zip da pasta `src/`).

---

Migrar o CRM Kauê Uniformes de localStorage para Supabase (PostgreSQL + Auth). Manter toda a interface visual e a estrutura de stores Zustand existentes — apenas substituir a camada de persistência.

## Stack atual

- React 18 + TypeScript + Vite + Tailwind
- Zustand (4 stores) com `persist` no localStorage
- Sem backend
- Login fake com 3 usuários hardcoded em `useAuthStore`

## Stack alvo

- Mesmo front-end
- Supabase como backend (PostgreSQL + Auth + RLS)
- Usuários autenticados via Supabase Auth (email + senha)
- Dados das 3 entidades em tabelas Postgres
- RLS (Row Level Security) garantindo: admin vê tudo, employee só vê os seus

---

## CREDENCIAIS DO SUPABASE

```
VITE_SUPABASE_URL=https://mfmprkwzkpaodgwyezwp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbXBya3d6a3Bhb2Rnd3llendwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjgwNjIsImV4cCI6MjA5Mzg0NDA2Mn0.OdXTHJD_GiPpL_9On8q84S8JPaaQ1JzaVZzo6yaosLI
```

Salvar em `.env.local` (criar se não existir) e adicionar `.env.local` ao `.gitignore`.

---

## PARTE 1 — INSTALAÇÃO E CONFIGURAÇÃO

1. Instalar dependência:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Criar `src/lib/supabase.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js'

   const url = import.meta.env.VITE_SUPABASE_URL
   const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   if (!url || !anonKey) {
     throw new Error('Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias')
   }

   export const supabase = createClient(url, anonKey, {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
     },
   })
   ```

---

## PARTE 2 — SCHEMA SQL DO BANCO

Criar arquivo `supabase/schema.sql` com o SQL completo abaixo. **NÃO executar pelo Claude Code** — eu vou rodar manualmente no painel do Supabase. Apenas gerar o arquivo:

```sql
-- ============================================================
-- TABELA DE PERFIS (estende auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ============================================================
-- EMPRESAS
-- ============================================================
create table public.empresas (
  id text primary key,
  nome text not null,
  responsaveis_ids text[] default '{}',
  razao_social text,
  cnpj text,
  segmento text,
  tipo_cliente text,
  grupo_estrategico text,
  frequencia text,
  status_cliente text,
  porte_empresa text,
  site text,
  email text,
  instagram text,
  linkedin text,
  endereco text,
  cidade text,
  uf text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index empresas_owner_idx on public.empresas(owner_id);

alter table public.empresas enable row level security;

create policy "empresas_select" on public.empresas
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "empresas_insert" on public.empresas
  for insert with check (auth.uid() = owner_id);

create policy "empresas_update" on public.empresas
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "empresas_delete" on public.empresas
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- PESSOAS
-- ============================================================
create table public.pessoas (
  id text primary key,
  nome text not null,
  responsaveis_ids text[] default '{}',
  telefone text,
  empresas_ids text[] default '{}',
  tipo_contato text,
  cargo text,
  grau_influencia text,
  email text,
  instagram text,
  cpf text,
  data_nascimento date,
  sexo text,
  endereco text,
  cidade text,
  uf text,
  avaliou_no_google text,
  pedimos_indicacao text,
  indicacoes text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index pessoas_owner_idx on public.pessoas(owner_id);

alter table public.pessoas enable row level security;

create policy "pessoas_select" on public.pessoas
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "pessoas_insert" on public.pessoas
  for insert with check (auth.uid() = owner_id);

create policy "pessoas_update" on public.pessoas
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "pessoas_delete" on public.pessoas
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- ORCAMENTOS
-- ============================================================
create table public.orcamentos (
  id text primary key,
  nome text not null,
  responsavel_id uuid references auth.users(id),
  valor numeric,
  empresa_id text references empresas(id) on delete set null,
  contatos_ids text[] default '{}',
  coluna text not null default 'lead',
  probabilidade numeric,
  ultimo_contato_em timestamptz,
  orcamento_enviado_em timestamptz,
  data_fechamento_esperada date,
  proxima_atividade timestamptz,
  vendido_em timestamptz,
  data_perda timestamptz,
  data_entrega date,
  origem text,
  campanhas_ofertadas text[] default '{}',
  fechou_pela text,
  tipo_objecao text,
  observacao_objecao text,
  cenario_atual text,
  itens_acao jsonb default '[]'::jsonb,
  historico jsonb default '[]'::jsonb,
  owner_id uuid not null references auth.users(id) on delete cascade,
  criado_por uuid not null references auth.users(id),
  atualizado_por uuid not null references auth.users(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create index orcamentos_owner_idx on public.orcamentos(owner_id);
create index orcamentos_empresa_idx on public.orcamentos(empresa_id);
create index orcamentos_coluna_idx on public.orcamentos(coluna);

alter table public.orcamentos enable row level security;

create policy "orcamentos_select" on public.orcamentos
  for select using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "orcamentos_insert" on public.orcamentos
  for insert with check (auth.uid() = owner_id);

create policy "orcamentos_update" on public.orcamentos
  for update using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "orcamentos_delete" on public.orcamentos
  for delete using (
    auth.uid() = owner_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- TRIGGER: criar profile automaticamente ao registrar
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'name', 'Usuário'),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## PARTE 3 — REFATORAR `useAuthStore`

Substituir o `src/store/useAuthStore.ts` para usar Supabase Auth:

```ts
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string                    // UUID do Supabase
  username: string
  name: string
  role: 'admin' | 'employee'
}

interface AuthStore {
  user: User | null
  loading: boolean

  initialize: () => Promise<void>
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ ok: boolean; error?: string }>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      if (profile) {
        set({
          user: {
            id: profile.id,
            username: profile.username,
            name: profile.name,
            role: profile.role,
          },
          loading: false,
        })
      } else {
        set({ user: null, loading: false })
      }
    } else {
      set({ user: null, loading: false })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) {
          set({
            user: {
              id: profile.id,
              username: profile.username,
              name: profile.name,
              role: profile.role,
            },
          })
        }
      } else {
        set({ user: null })
      }
    })
  },

  login: async (username, password) => {
    // Supabase usa email; vamos converter username → email fictício
    const email = `${username}@kaueuniformes.local`
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: 'Usuário ou senha inválidos' }
    return { ok: true }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  changePassword: async (currentPassword, newPassword) => {
    const user = get().user
    if (!user) return { ok: false, error: 'Não autenticado' }

    // Verificar senha atual reautenticando
    const email = `${user.username}@kaueuniformes.local`
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword })
    if (signInError) return { ok: false, error: 'Senha atual incorreta' }

    // Atualizar senha
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },
}))
```

⚠️ Atualizar `LoginPage.tsx` e `ChangePasswordModal.tsx` para usarem as funções async novas (mostrar toast com `error` quando retornar `{ ok: false }`).

⚠️ Atualizar `App.tsx` para chamar `initialize()` no `useEffect` inicial e mostrar loading enquanto carrega:

```tsx
useEffect(() => {
  useAuthStore.getState().initialize()
}, [])

if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-slate-400">Carregando...</div>
```

---

## PARTE 4 — REFATORAR STORES DE DADOS

Para cada uma das 3 stores (`useEmpresaStore`, `usePessoaStore`, `useOrcamentoStore`), aplicar o **mesmo padrão**:

### Padrão geral

1. **Remover** o `persist` middleware (Supabase é a fonte de verdade agora)
2. **Remover** o import de `sampleData` (começar vazio)
3. **Adicionar** método `loadAll()` que busca do Supabase:

```ts
loadAll: async () => {
  const { data, error } = await supabase
    .from('empresas')
    .select('*')
    .order('criado_em', { ascending: false })
  if (error) {
    console.error(error)
    return
  }
  set({ empresas: data.map(rowToEmpresa) })
}
```

4. **Helpers** de conversão entre snake_case (banco) e camelCase (frontend):

```ts
// Empresa: rowToEmpresa(row) e empresaToRow(empresa)
// Pessoa:  rowToPessoa(row)  e pessoaToRow(pessoa)
// Orcamento: rowToOrcamento(row) e orcamentoToRow(orc)
```

Cuidados especiais:
- `responsaveisIds` ↔ `responsaveis_ids`
- `empresasIds` ↔ `empresas_ids`
- `contatosIds` ↔ `contatos_ids`
- `campanhasOfertadas` ↔ `campanhas_ofertadas`
- `criadoEm` ↔ `criado_em`
- `atualizadoEm` ↔ `atualizado_em`
- `criadoPor` ↔ `criado_por`
- `atualizadoPor` ↔ `atualizado_por`
- `ownerId` ↔ `owner_id`
- `itensAcao` ↔ `itens_acao` (jsonb)
- `historico` ↔ `historico` (jsonb)

5. **`addX`, `updateX`, `deleteX`** viram async e fazem insert/update/delete no Supabase + atualizam o estado local em caso de sucesso.

6. **Realtime opcional** — depois de `loadAll`, subscrever a mudanças (assim quando a Noemi adicionar um cliente, o admin vê na hora):

```ts
supabase
  .channel('empresas-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'empresas' }, (payload) => {
    // recarregar ou aplicar diff
    get().loadAll()
  })
  .subscribe()
```

7. **Chamar `loadAll()` quando o usuário faz login**. Adicionar no `useAuthStore.initialize()`:

```ts
if (profile) {
  set({ user: ... })
  // Carregar dados das 3 stores
  const { useEmpresaStore } = await import('./useEmpresaStore')
  const { usePessoaStore } = await import('./usePessoaStore')
  const { useOrcamentoStore } = await import('./useOrcamentoStore')
  await Promise.all([
    useEmpresaStore.getState().loadAll(),
    usePessoaStore.getState().loadAll(),
    useOrcamentoStore.getState().loadAll(),
  ])
}
```

8. **`refreshFiltrados` e RLS** — A filtragem por owner agora é feita pelo banco via RLS, mas mantenha o `pessoasFiltradas` como alias de `pessoas` (já vem filtrado do banco) para não quebrar componentes que usam.

9. **IDs sequenciais** — manter o `nextId()` atual, mas calcular sobre os dados já carregados. Como o admin pode ver dados de todos, isso continua funcionando.

10. **Cascades** — `deleteEmpresa` precisa atualizar pessoas que tinham essa empresa em `empresasIds[]` e orçamentos que tinham `empresaId`. Fazer via `update` no Supabase com filtros.

---

## PARTE 5 — REMOVER `sampleData.ts`

Apagar `src/data/sampleData.ts` (ou esvaziar exports). Banco vazio é o estado correto.

Remover qualquer referência a `sampleEmpresas`, `samplePessoas`, `sampleOrcamentos` das stores.

---

## PARTE 6 — ATUALIZAR `.gitignore`

Adicionar:
```
.env.local
.env*.local
```

---

## ENTREGÁVEIS FINAIS

Ao terminar, o Claude Code deve me retornar:

1. Lista de arquivos criados/editados
2. **O conteúdo do arquivo `supabase/schema.sql` impresso na resposta** para eu copiar e rodar no painel do Supabase
3. Um passo a passo claro do que eu preciso fazer manualmente no Supabase:
   - Rodar o schema SQL no SQL Editor
   - Criar 3 usuários iniciais via Authentication → Users → Add user (admin@kaueuniformes.local, noemi@kaueuniformes.local, dione@kaueuniformes.local)
   - Atualizar `profiles` desses 3 usuários com `username`, `name` e `role` corretos
4. Aviso para rodar `npm install @supabase/supabase-js`
5. Aviso para conferir que `.env.local` foi criado com as 2 variáveis

## Restrições

- Não quebrar nenhum componente visual existente
- Manter exatamente as mesmas interfaces dos stores (componentes não devem precisar mudar)
- IDs continuam sendo strings tipo `ORC-0001`, `PES-0001`, `EMP-0001`
- Toast de erro em caso de falha de rede/auth
- Tratamento de loading em chamadas async (mostrar spinner ou desabilitar botão durante save)
- NÃO executar o schema SQL pelo Claude Code — apenas gerar o arquivo
- NÃO criar usuários via código — apenas instruir o usuário a criar manualmente
