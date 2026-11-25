/**
 * Gera a versão legível de um rascunho de módulo, para a conferência humana
 * (docs/14-rascunho-de-conteudo.md, seção 5).
 * Uso: node scripts/gerar-revisao.js src/conteudo/rascunhos/<modulo>.json <saida>.md
 */
const fs = require('fs');
const path = require('path');

const [entrada, saida] = process.argv.slice(2);
if (!entrada || !saida) {
  console.error('Uso: node scripts/gerar-revisao.js <rascunho.json> <saida.md>');
  process.exit(1);
}

const m = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const nomeDoNivel = ['', 'reconhecer', 'aplicar', 'estilo de prova', 'pegadinha', 'pegadinha'];
const hoje = new Date().toISOString().slice(0, 10);
const L = [];

L.push(`# Revisão do módulo: ${m.nome}`, '');
L.push(`> Gerado em ${hoje} a partir de \`${entrada.replace(/\\/g, '/')}\`, já aprovado pelo validador automático.`);
L.push('> Confira cada gabarito com a gramática e marque [x] quando estiver certo. Anote correções ao lado.', '');
if (m.duvidas?.length) L.push('## Dúvidas e decisões', '', ...m.duvidas.map((d) => `- [ ] ${d}`), '');
L.push(
  '## Lista de conferência',
  '',
  '- [ ] Gabarito de cada questão conferido na gramática',
  '- [ ] Nenhum distrator também pode ser defendido como certo',
  '- [ ] Cada parte ensina uma nuance só, sem cobrar o que ainda não veio',
  '- [ ] O farol não traz conteúdo novo',
  '- [ ] As dicas ajudam sem entregar a resposta',
  '- [ ] Tom acolhedor, sem a palavra "errou"',
  '',
);

function questao(q, n) {
  const cab = `**${n}.** [${q.tipo}, nível ${q.nivel}: ${nomeDoNivel[q.nivel]}]`;
  const o = [];
  if (q.tipo === 'certoErrado') o.push(`${cab} Certo ou errado? ${q.afirmacao}`, '', `- Gabarito: **${q.certo ? 'CERTO' : 'ERRADO'}**`);
  else if (q.tipo === 'identificarErro')
    o.push(
      `${cab} Toque no trecho com erro:`,
      '',
      q.trechos.map((t, i) => (i === q.erro ? `**[${t}]**` : `[${t}]`)).join(' '),
      '',
      '- Gabarito: o trecho em negrito',
    );
  else if (q.tipo === 'ordenar') o.push(`${cab} ${q.enunciado}`, '', `- Ordem certa: ${q.itens.map((t) => `"${t}"`).join(' → ')}`);
  else if (q.tipo === 'ligarPares') o.push(`${cab} ${q.enunciado}`, '', ...q.pares.map(([a, b]) => `- ${a} → **${b}**`));
  else o.push(`${cab} ${q.enunciado}`, '', ...q.opcoes.map((t, i) => (i === q.correta ? `- **${t}** ✓` : `- ${t}`)));
  o.push(`- Explicação: ${q.explicacao}`, `- Dica: ${q.dica}`);
  if (q.armadilha) o.push(`- Armadilha: ${q.armadilha}`);
  if (q.fonte) o.push(`- Fonte: ${q.fonte}`);
  o.push('- [ ] conferida', '');
  return o;
}

m.partes.forEach((p, i) => {
  L.push(`## Parte ${i + 1}: ${p.nome}`, '');
  if (p.nuance) L.push(`*${p.nuance}*`, '');
  p.questoes.forEach((q, j) => L.push(...questao(q, j + 1)));
});
L.push('## Farol do módulo', '', '*Estilo de prova, sem conteúdo novo.*', '');
m.farol.forEach((q, j) => L.push(...questao(q, j + 1)));

fs.mkdirSync(path.dirname(saida), { recursive: true });
fs.writeFileSync(saida, L.join('\n'));
console.log(`Revisão gerada: ${saida}`);
