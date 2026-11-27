import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuestaoDeClassificar, QuestaoDeMontarFrase, QuestaoDeProporcao } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';
import { AreaDeArrastar, Arrastavel, ZonaDeSoltura } from './Arrastar';
import { Alternador, Ficha, estadoPeloTom, estilos as comum, type PropsDaQuestao } from './comum';

/**
 * As questões de montar: arrastar fichas para vagas, para a linha da frase ou para colunas.
 * Em todas, o banco de fichas fica embaixo (a pessoa arrasta para cima, longe do polegar)
 * e tocar numa ficha faz o mesmo que arrastá-la para o próximo lugar livre.
 */

// ---------- Proporção (regra de três) ----------

export function Proporcao({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeProporcao>) {
  const r =
    resposta.tipo === 'proporcao' ? resposta : { tipo: 'proporcao' as const, relacao: null, vagas: [null, null, null] };
  const vagas = r.vagas;

  // O banco mostra as fichas que ainda não estão nas vagas (pelo valor, contando repetidas).
  const usadas = [...vagas];
  const banco = q.fichas
    .map((valor, i) => ({ valor, i }))
    .filter(({ valor }) => {
      const j = usadas.indexOf(valor);
      if (j === -1) return true;
      usadas[j] = null;
      return false;
    });

  const mudarVagas = (novas: (number | null)[]) => onMudar({ ...r, vagas: novas });

  // Depois de um erro, cada parte mostra se está certa: a relação e cada vaga, comparada com a
  // montagem aceita que mais se parece com a da pessoa. Ensina mais que pintar tudo de coral.
  const referencia = q.montagens.reduce((melhor, m) =>
    m.filter((v, i) => v === vagas[i]).length > melhor.filter((v, i) => v === vagas[i]).length ? m : melhor,
  );
  const tomDaVaga = (i: number) => (tom === 'errado' ? (vagas[i] === referencia[i] ? 'certo' : 'errado') : tom);
  const tomDaRelacao = tom === 'errado' ? (r.relacao === q.relacao ? 'certo' : 'errado') : tom;

  function soltarDoBanco(valor: number, zona: string | null) {
    if (!zona?.startsWith('vaga-')) return;
    const novas = [...vagas];
    novas[Number(zona.slice(5))] = valor;
    mudarVagas(novas);
  }

  function tocarNoBanco(valor: number) {
    const livre = vagas.indexOf(null);
    if (livre === -1) return;
    const novas = [...vagas];
    novas[livre] = valor;
    mudarVagas(novas);
  }

  function soltarDaVaga(origem: number, zona: string | null) {
    const novas = [...vagas];
    const valor = novas[origem];
    novas[origem] = null;
    if (zona?.startsWith('vaga-')) {
      const destino = Number(zona.slice(5));
      // Troca: a ficha que estava no destino vai para a vaga de origem.
      novas[origem] = novas[destino];
      novas[destino] = valor;
    }
    mudarVagas(novas);
  }

  const vaga = (i: number) => (
    <ZonaDeSoltura key={i} id={`vaga-${i}`} style={estilos.vaga} estiloSobre={estilos.vagaSobre}>
      {vagas[i] !== null ? (
        <Arrastavel
          desabilitado={travada}
          rotulo={`${vagas[i]}, na vaga ${i + 1}. Toque para devolver`}
          onToque={() => soltarDaVaga(i, null)}
          onSoltar={(z) => soltarDaVaga(i, z)}>
          <Ficha texto={String(vagas[i])} estado={estadoPeloTom(tomDaVaga(i), true)} />
        </Arrastavel>
      ) : (
        <Text style={estilos.vagaVazia} accessibilityLabel={`Vaga ${i + 1}, vazia`}>
          {' '}
        </Text>
      )}
    </ZonaDeSoltura>
  );

  return (
    <AreaDeArrastar>
      <View style={estilos.coluna}>
        <Alternador
          rotulo="Tipo de proporção"
          opcoes={[
            { valor: 'direta', texto: 'Direta' },
            { valor: 'inversa', texto: 'Inversa' },
          ]}
          valor={r.relacao}
          travado={travada}
          tom={tomDaRelacao}
          onEscolher={(relacao) => onMudar({ ...r, relacao })}
        />
        <View style={estilos.proporcao}>
          <View style={estilos.fracao}>
            {vaga(0)}
            <View style={estilos.traco} />
            {vaga(1)}
          </View>
          <Text style={estilos.igual}>=</Text>
          <View style={estilos.fracao}>
            {vaga(2)}
            <View style={estilos.traco} />
            <View style={[estilos.vaga, estilos.vagaX]}>
              <Text style={estilos.x}>x</Text>
            </View>
          </View>
        </View>
        {q.legenda ? <Text style={comum.legenda}>{q.legenda}</Text> : null}
        <ZonaDeSoltura id="banco" style={comum.banco}>
          {banco.map(({ valor, i }) => (
            <Arrastavel
              key={i}
              desabilitado={travada}
              rotulo={`${valor}. Arraste para uma vaga ou toque para colocar`}
              onToque={() => tocarNoBanco(valor)}
              onSoltar={(z) => soltarDoBanco(valor, z)}>
              <Ficha texto={String(valor)} />
            </Arrastavel>
          ))}
        </ZonaDeSoltura>
      </View>
    </AreaDeArrastar>
  );
}

// ---------- Montar a frase ----------

export function MontarFrase({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeMontarFrase>) {
  const pecas = resposta.tipo === 'montarFrase' ? resposta.pecas : [];
  const banco = q.pecas.map((texto, i) => ({ texto, i })).filter(({ i }) => !pecas.includes(i));
  const mudar = (novas: number[]) => onMudar({ tipo: 'montarFrase', pecas: novas });

  return (
    <AreaDeArrastar>
      <View style={estilos.coluna}>
        <ZonaDeSoltura id="frase" style={estilos.frase} estiloSobre={estilos.fraseSobre}>
          {pecas.length === 0 ? <Text style={estilos.fraseVazia}>Arraste os blocos para cá</Text> : null}
          {pecas.map((i, posicao) => (
            <Arrastavel
              key={i}
              desabilitado={travada}
              rotulo={`${q.pecas[i]}, na frase. Toque para tirar`}
              onToque={() => mudar(pecas.filter((_, p) => p !== posicao))}
              onSoltar={(z) => {
                if (z !== 'frase') mudar(pecas.filter((_, p) => p !== posicao));
              }}>
              <Ficha
                texto={q.pecas[i]}
                estado={estadoPeloTom(
                  tom === 'errado' ? (q.pecas[i] === q.correta[posicao] ? 'certo' : 'errado') : tom,
                  true,
                )}
              />
            </Arrastavel>
          ))}
        </ZonaDeSoltura>
        <ZonaDeSoltura id="banco" style={comum.banco}>
          {banco.map(({ texto, i }) => (
            <Arrastavel
              key={i}
              desabilitado={travada}
              rotulo={`${texto}. Arraste para a frase ou toque para colocar no fim`}
              onToque={() => mudar([...pecas, i])}
              onSoltar={(z) => {
                if (z === 'frase') mudar([...pecas, i]);
              }}>
              <Ficha texto={texto} />
            </Arrastavel>
          ))}
        </ZonaDeSoltura>
      </View>
    </AreaDeArrastar>
  );
}

// ---------- Classificar em colunas ----------

export function Classificar({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeClassificar>) {
  const colunaDe = resposta.tipo === 'classificar' ? resposta.colunaDe : q.itens.map(() => null);
  // Tocar num item o seleciona; tocar numa coluna o coloca nela (o caminho sem arrastar).
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const mover = (item: number, coluna: 0 | 1 | null) => {
    const nova = [...colunaDe];
    nova[item] = coluna;
    setSelecionado(null);
    onMudar({ tipo: 'classificar', colunaDe: nova });
  };
  const zonaParaColuna = (z: string | null): 0 | 1 | null => (z === 'col-0' ? 0 : z === 'col-1' ? 1 : null);

  const estadoDoItem = (i: number) => {
    if (tom === 'neutro') return selecionado === i ? 'selecionada' : 'normal';
    return colunaDe[i] === q.itens[i].coluna ? 'certa' : 'errada';
  };

  return (
    <AreaDeArrastar>
      <View style={estilos.coluna}>
        <View style={estilos.colunas}>
          {([0, 1] as const).map((c) => (
            <ZonaDeSoltura key={c} id={`col-${c}`} style={{ flex: 1 }} estiloSobre={estilos.colunaSobre}>
              <View style={[estilos.colunaCaixa, selecionado !== null ? estilos.colunaAlvo : null]}>
                {/* Tocar no fundo da coluna coloca o item selecionado. Fica atrás das fichas, e não
                    em volta delas: um botão não pode conter outro (na web, isso quebra). */}
                <Pressable
                  disabled={travada || selecionado === null}
                  accessibilityRole="button"
                  accessibilityLabel={`Colocar em ${q.colunas[c]}`}
                  onPress={() => selecionado !== null && mover(selecionado, c)}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={estilos.colunaTitulo} pointerEvents="none">
                  {q.colunas[c]}
                </Text>
                {q.itens.map((item, i) =>
                  colunaDe[i] === c ? (
                    <Arrastavel
                      key={i}
                      desabilitado={travada}
                      rotulo={`${item.texto}, em ${q.colunas[c]}. Toque para tirar`}
                      onToque={() => mover(i, null)}
                      onSoltar={(z) => mover(i, zonaParaColuna(z))}>
                      <Ficha texto={item.texto} estado={estadoDoItem(i)} pequena />
                    </Arrastavel>
                  ) : null,
                )}
              </View>
            </ZonaDeSoltura>
          ))}
        </View>
        <ZonaDeSoltura id="banco" style={comum.banco}>
          {q.itens.map((item, i) =>
            colunaDe[i] === null ? (
              <Arrastavel
                key={i}
                desabilitado={travada}
                rotulo={`${item.texto}. Arraste para uma coluna, ou toque e depois toque na coluna`}
                onToque={() => {
                  haptico.selecao();
                  setSelecionado(selecionado === i ? null : i);
                }}
                onSoltar={(z) => {
                  const c = zonaParaColuna(z);
                  if (c !== null) mover(i, c);
                }}>
                <Ficha texto={item.texto} estado={estadoDoItem(i)} pequena />
              </Arrastavel>
            ) : null,
          )}
        </ZonaDeSoltura>
      </View>
    </AreaDeArrastar>
  );
}

const LARGURA_DA_VAGA = 76;

const estilos = StyleSheet.create({
  coluna: { gap: 14 },
  proporcao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  fracao: { alignItems: 'center', gap: 6 },
  traco: { width: LARGURA_DA_VAGA, height: 3, borderRadius: 2, backgroundColor: cor.textoSuave },
  vaga: {
    width: LARGURA_DA_VAGA,
    height: 56,
    borderRadius: raio.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: cor.linhaForte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vagaSobre: { borderColor: cor.mare, backgroundColor: cor.mareVeu },
  vagaVazia: { fontSize: tamanho.md },
  vagaX: { borderStyle: 'solid', borderColor: cor.luz },
  x: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.luz },
  igual: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.textoSuave },
  frase: {
    minHeight: 72,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: cor.linha,
  },
  fraseSobre: { borderBottomColor: cor.mare, backgroundColor: cor.mareVeu },
  fraseVazia: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  colunas: { flexDirection: 'row', gap: 10 },
  colunaCaixa: {
    minHeight: 150,
    borderRadius: raio.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: cor.linhaForte,
    padding: 8,
    gap: 6,
  },
  colunaAlvo: { borderColor: cor.mare },
  colunaSobre: { borderRadius: raio.md, backgroundColor: cor.mareVeu },
  colunaTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
});
