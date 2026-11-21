/// <reference types="node" />
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Todo som embutido no app precisa ter origem e licença registradas em assets/sons/creditos.json.
 * Sem isso, não dá para provar o direito de uso ao publicar nas lojas.
 */
const pasta = join(__dirname, '..', '..', '..', 'assets', 'sons');
const LICENCAS = ['propria', 'CC0', 'pixabay', 'comercial-paga'] as const;

type Credito = {
  arquivo: string;
  momento: string;
  origem: string;
  autor: string;
  url: string;
  licenca: (typeof LICENCAS)[number];
  data: string;
  editado: boolean;
};

const arquivos = readdirSync(pasta).filter((a) => /\.(wav|mp3|m4a|ogg|aac)$/i.test(a));
const { sons } = JSON.parse(readFileSync(join(pasta, 'creditos.json'), 'utf8')) as { sons: Credito[] };

describe('créditos dos sons', () => {
  it.each(arquivos)('%s tem origem e licença registradas', (arquivo) => {
    const credito = sons.find((s) => s.arquivo === arquivo);
    if (!credito) throw new Error(`${arquivo} não está em assets/sons/creditos.json`);
    expect(LICENCAS).toContain(credito.licenca);
    expect(credito.origem.trim()).not.toBe('');
    expect(credito.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (credito.licenca !== 'propria') expect(credito.url).toMatch(/^https:\/\//);
  });

  it('não há crédito de arquivo que não existe', () => {
    const sobrando = sons.map((s) => s.arquivo).filter((a) => !arquivos.includes(a));
    expect(sobrando).toEqual([]);
  });
});
