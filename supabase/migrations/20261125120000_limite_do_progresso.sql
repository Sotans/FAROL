-- Limite de tamanho do progresso de cada pessoa (revisão de código de 2026-11-25).
-- A chave do app é pública e qualquer conta (inclusive anônima) grava a própria linha:
-- sem limite, alguém poderia guardar um JSON de qualquer tamanho e inflar o banco.
-- O progresso real fica bem abaixo disso (dezenas de KB, mesmo com centenas de cartões de revisão).

alter table public.progresso
  add constraint progresso_tamanho_maximo
  check (octet_length(estado::text) <= 1048576);

alter table public.progresso
  add constraint progresso_versao_valida
  check (versao >= 1);
