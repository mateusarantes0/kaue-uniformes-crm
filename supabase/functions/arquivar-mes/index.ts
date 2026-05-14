import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const agora = new Date()
  const primeiroDoMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString()

  const { error } = await supabase
    .from('orcamentos')
    .update({ arquivado_em: agora.toISOString() })
    .in('coluna', ['sucesso', 'perdido'])
    .lt('atualizado_em', primeiroDoMes)
    .is('arquivado_em', null)

  if (error) {
    console.error('Erro ao arquivar:', error)
    return new Response('Erro', { status: 500 })
  }

  return new Response('OK', { status: 200 })
})
