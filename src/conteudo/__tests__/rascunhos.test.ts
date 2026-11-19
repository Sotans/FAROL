/// <reference types="node" />
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { lerRascunho } from '@/conteudo/rascunho';
import { validarModulo } from '@/conteudo/validar';

/**
 * Confere cada rascunho salvo em src/conteudo/rascunhos (docs/14-rascunho-de-conteudo.md).
 * Rode só esta conferência com: npm run rascunho
 */
const pasta = join(__dirname, '..', 'rascunhos');
const arquivos = readdirSync(pasta).filter((a) => a.endsWith('.json'));

describe('rascunhos', () => {
  if (arquivos.length === 0) {
    it('nenhum rascunho na pasta por enquanto', () => expect(arquivos).toEqual([]));
    return;
  }

  it.each(arquivos)('%s está pronto para a revisão', (arquivo) => {
    let json: unknown;
    try {
      json = JSON.parse(readFileSync(join(pasta, arquivo), 'utf8'));
    } catch (erro) {
      throw new Error(`${arquivo} não é um JSON válido: ${(erro as Error).message}`);
    }
    const lido = lerRascunho(json);
    const problemas = lido.modulo ? validarModulo(lido.modulo) : lido.problemas;
    if (problemas.length) {
      // Lista pronta para colar no Prompt C (docs/14-rascunho-de-conteudo.md).
      const lista = problemas.map((p, i) => `  ${i + 1}. ${p}`).join('\n');
      throw new Error(`${arquivo}: ${problemas.length} problema(s)\n\n${lista}\n`);
    }
  });
});
