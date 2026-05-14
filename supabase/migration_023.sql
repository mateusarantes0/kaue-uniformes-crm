-- migration_023: empresas visíveis para todos os usuários autenticados
drop policy if exists "empresas_select" on public.empresas;
create policy "empresas_select_all" on public.empresas
  for select using (auth.role() = 'authenticated');
