-- Bucket para anexos de comentários
insert into storage.buckets (id, name, public)
values ('comentarios-anexos', 'comentarios-anexos', false)
on conflict do nothing;

create policy "anexos_select" on storage.objects
  for select using (
    bucket_id = 'comentarios-anexos' and auth.role() = 'authenticated'
  );

create policy "anexos_insert" on storage.objects
  for insert with check (
    bucket_id = 'comentarios-anexos' and auth.role() = 'authenticated'
  );

create policy "anexos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'comentarios-anexos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
