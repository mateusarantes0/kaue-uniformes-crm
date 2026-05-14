-- ⚠️ Substitua SERVICE_ROLE_KEY_AQUI pela Service Role Key real:
--    Supabase Dashboard → Settings → API → service_role secret

-- Habilita extensão pg_cron (se ainda não estiver habilitada)
create extension if not exists pg_cron;

-- A cada hora: verificar vencimentos e mover cards
select cron.schedule(
  'check-vencimentos-hourly',
  '0 * * * *',
  $$select net.http_post(
    url := 'https://mfmprkwzkpaodgwyezwp.supabase.co/functions/v1/check-vencimentos',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY_AQUI", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )$$
);

-- Dia 1 de cada mês às 00:30: arquivar sucesso/perdido do mês anterior
select cron.schedule(
  'arquivar-mensal',
  '30 0 1 * *',
  $$select net.http_post(
    url := 'https://mfmprkwzkpaodgwyezwp.supabase.co/functions/v1/arquivar-mes',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY_AQUI", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )$$
);
