import { createClient } from 'jsr:@supabase/supabase-js@2'

const limites: Record<string, { limite: number; destino: string; tipoObjecao: string }> = {
  lead:              { limite: 1,  destino: 'objecao', tipoObjecao: 'sem_retorno' },
  qualificacao:      { limite: 2,  destino: 'objecao', tipoObjecao: 'sem_retorno' },
  orcamento_enviado: { limite: 5,  destino: 'objecao', tipoObjecao: 'sem_retorno' },
  negociacao:        { limite: 15, destino: 'objecao', tipoObjecao: 'preco' },
  objecao:           { limite: 45, destino: 'perdido', tipoObjecao: 'sem_retorno' },
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  for (const [coluna, cfg] of Object.entries(limites)) {
    const now = Date.now()
    const cutoff     = new Date(now - cfg.limite * 86400000).toISOString()
    const warnCutoff = new Date(now - (cfg.limite - 1) * 86400000).toISOString()
    const hoje = new Date().toISOString().split('T')[0]

    // Busca todos os cards ativos da coluna (sem arquivado_em)
    const { data: cards } = await supabase
      .from('orcamentos')
      .select('id, owner_id, nome, ultimo_contato_em, criado_em, historico')
      .eq('coluna', coluna)
      .is('arquivado_em', null)

    for (const orc of cards ?? []) {
      const ref = orc.ultimo_contato_em ?? orc.criado_em
      if (!ref) continue
      const refDate = new Date(ref)

      if (refDate < new Date(cutoff)) {
        // Mover automaticamente
        await supabase.from('orcamentos').update({
          coluna: cfg.destino,
          tipo_objecao: cfg.tipoObjecao,
          atualizado_em: new Date().toISOString(),
          historico: [
            ...(orc.historico ?? []),
            {
              data: new Date().toISOString(),
              texto: `Movido automaticamente: prazo vencido em ${coluna}`,
              usuarioId: 'sistema',
            },
          ],
        }).eq('id', orc.id)

        await supabase.from('notificacoes').insert({
          user_id: orc.owner_id,
          tipo: 'card_vencido',
          titulo: `Card movido para ${cfg.destino === 'objecao' ? 'Objeção' : 'Perdido'}`,
          mensagem: `O orçamento "${orc.nome}" estava parado em ${coluna} há mais de ${cfg.limite} dias.`,
          orcamento_id: orc.id,
        })
      } else if (refDate < new Date(warnCutoff)) {
        // Avisar que está vencendo
        const { data: jaTem } = await supabase
          .from('notificacoes')
          .select('id')
          .eq('user_id', orc.owner_id)
          .eq('orcamento_id', orc.id)
          .eq('tipo', 'card_vencendo')
          .gte('criada_em', hoje + 'T00:00:00.000Z')
          .limit(1)

        if (!jaTem?.length) {
          await supabase.from('notificacoes').insert({
            user_id: orc.owner_id,
            tipo: 'card_vencendo',
            titulo: `Orçamento vencendo`,
            mensagem: `"${orc.nome}" vence em breve em ${coluna}.`,
            orcamento_id: orc.id,
          })
        }
      }
    }
  }

  // Notificação diária para aguardando + vendido
  const colunasNotificarDiario = ['aguardando', 'vendido']
  for (const c of colunasNotificarDiario) {
    const hoje = new Date().toISOString().split('T')[0]
    const { data: cards } = await supabase
      .from('orcamentos')
      .select('id, owner_id, nome')
      .eq('coluna', c)
      .is('arquivado_em', null)

    for (const orc of cards ?? []) {
      const { data: jaTem } = await supabase
        .from('notificacoes')
        .select('id')
        .eq('user_id', orc.owner_id)
        .eq('orcamento_id', orc.id)
        .eq('tipo', 'aguardando_pagamento')
        .gte('criada_em', hoje + 'T00:00:00.000Z')
        .limit(1)

      if (!jaTem?.length) {
        await supabase.from('notificacoes').insert({
          user_id: orc.owner_id,
          tipo: 'aguardando_pagamento',
          titulo: c === 'aguardando' ? 'Aguardando pagamento' : 'Pagamento pendente',
          mensagem: `Lembre-se de cobrar "${orc.nome}".`,
          orcamento_id: orc.id,
        })
      }
    }
  }

  return new Response('OK', { status: 200 })
})
