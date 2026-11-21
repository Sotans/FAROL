-- Progresso de cada pessoa (submetas 2.5 e 3.5).
-- O app guarda o progresso no aparelho e envia uma cópia para cá; o formato do JSON é o
-- tipo Estado de src/estado/progresso.tsx, na versão indicada em "versao".

create table if not exists public.progresso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  estado jsonb not null,
  versao integer not null default 1,
  atualizado_em timestamptz not null default now()
);

comment on table public.progresso is 'Progresso do app FAROL por pessoa (inclusive contas anônimas).';

-- Cada pessoa só lê e grava a própria linha. A chave que vai no app é pública:
-- a proteção dos dados está nestas regras.
alter table public.progresso enable row level security;

create policy "ler o próprio progresso"
  on public.progresso for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "criar o próprio progresso"
  on public.progresso for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "atualizar o próprio progresso"
  on public.progresso for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.progresso to authenticated;
