import type { ModoResposta, Questao } from '@/licao/tipos';
import type { Modulo } from '../tipos';

// CONTEÚDO DE DEMONSTRAÇÃO, não revisado por professor (docs/04-estrategia-de-conteudo.md).
// 6 partes × 8 questões, uma nuance por parte, mais o Farol do módulo (10 questões no estilo da banca).
// Cada lição usa as 8 da parte mais até 2 de revisão de partes anteriores.

type Comum = {
  nivel: Questao['nivel'];
  enunciado: string;
  explicacao: string;
  dica: string;
  armadilha?: string;
  /** Padrão: imediato até o nível 2, com confirmação do nível 3 em diante (docs/11, modos de resposta). */
  modo?: ModoResposta;
};

const modoPadrao = (nivel: Questao['nivel']): ModoResposta => (nivel <= 2 ? 'imediato' : 'confirmar');

function certoErrado(id: string, c: Comum & { certo: boolean }): Questao {
  const { certo, modo, enunciado, ...resto } = c;
  return {
    id,
    tipo: 'certoErrado',
    modo: modo ?? modoPadrao(c.nivel),
    enunciado: `Certo ou errado? ${enunciado}`,
    opcoes: ['Certo', 'Errado'],
    correta: certo ? 0 : 1,
    ...resto,
  };
}

function escolha(id: string, c: Comum & { opcoes: string[]; correta: number }): Questao {
  const { modo, ...resto } = c;
  return { id, tipo: 'multipla', modo: modo ?? modoPadrao(c.nivel), ...resto };
}

function completar(id: string, c: Comum & { opcoes: string[]; correta: number }): Questao {
  const { modo, ...resto } = c;
  return { id, tipo: 'completar', modo: modo ?? modoPadrao(c.nivel), ...resto };
}

const ARMADILHA_MASCULINO = 'a pé, a cavalo, a prazo, a tempo: palavras masculinas nunca levam crase.';
const ARMADILHA_HORAS = '"de... a" (sem crase) e "das... às" (com crase): não misture os pares.';

export const moduloCrase: Modulo = {
  id: 'pt-crase',
  materia: 'portugues',
  nome: 'Crase',
  // HIPÓTESE: valor provisório até o mapeamento das provas.
  incidencia: 0.1,
  partes: [
    {
      id: 'p1',
      nome: 'O teste do "ao"',
      questoes: [
        certoErrado('cr-p1-01', {
          nivel: 1,
          enunciado: 'A crase é a junção da preposição "a" com o artigo "a".',
          certo: true,
          explicacao: 'Crase é a fusão de dois "a": a preposição e o artigo feminino. O acento grave marca essa fusão.',
          dica: 'Pense em duas palavras "a" que se juntam.',
        }),
        escolha('cr-p1-02', {
          nivel: 1,
          enunciado:
            'Para testar a crase, troque a palavra feminina por uma masculina. Em "Fui à escola", qual troca confirma a crase?',
          opcoes: ['Fui ao colégio.', 'Fui a colégio.', 'Fui o colégio.'],
          correta: 0,
          explicacao: 'Apareceu "ao" (a + o). Então, no feminino, é "à" (a + a).',
          dica: 'Procure o "ao".',
        }),
        completar('cr-p1-03', {
          nivel: 1,
          enunciado: 'Complete: Fui ___ farmácia.',
          opcoes: ['a', 'à', 'as'],
          correta: 1,
          explicacao: 'Fui ao mercado → fui à farmácia.',
          dica: 'Troque "farmácia" por "mercado".',
        }),
        certoErrado('cr-p1-04', {
          nivel: 2,
          enunciado: '"Entreguei o livro à professora."',
          certo: true,
          explicacao: 'Entreguei o livro ao professor → à professora.',
          dica: 'Aplique o teste do "ao".',
        }),
        completar('cr-p1-05', {
          nivel: 2,
          enunciado: 'Complete: Obedeça ___ regras do condomínio.',
          opcoes: ['a', 'à', 'às'],
          correta: 2,
          explicacao: 'Obedeça aos regulamentos → às regras. No plural, a crase vira "às".',
          dica: 'A palavra está no plural.',
        }),
        escolha('cr-p1-06', {
          nivel: 2,
          modo: 'confirmar',
          enunciado: 'Em qual frase a crase está correta?',
          opcoes: ['Refiro-me à proposta de ontem.', 'Comprei à proposta de ontem.', 'Li à proposta de ontem.'],
          correta: 0,
          explicacao:
            'Quem se refere, refere-se a algo: refiro-me ao projeto → à proposta. "Comprar" e "ler" não pedem a preposição "a".',
          dica: 'Qual verbo pede "a"?',
          armadilha: 'só há crase quando a palavra anterior pede a preposição "a".',
        }),
        certoErrado('cr-p1-07', {
          nivel: 3,
          enunciado: '"Conheço à diretora da escola."',
          certo: false,
          explicacao:
            'Quem conhece, conhece alguém, sem preposição: conheço o diretor → conheço a diretora. Sem preposição, sem crase.',
          dica: 'Troque: "conheço ___ diretor".',
          armadilha: 'o teste do "ao" também derruba crases: se a troca dá só "o", não há crase.',
        }),
        completar('cr-p1-08', {
          nivel: 3,
          enunciado: 'Complete: Assisti ___ palestra inteira.',
          opcoes: ['a', 'à', 'as'],
          correta: 1,
          explicacao: 'No sentido de ver, "assistir" pede "a": assisti ao filme → à palestra.',
          dica: 'Troque: "assisti ___ filme".',
        }),
      ],
    },
    {
      id: 'p2',
      nome: 'Palavras masculinas',
      questoes: [
        certoErrado('cr-p2-01', {
          nivel: 1,
          enunciado: 'Antes de palavra masculina não há crase.',
          certo: true,
          explicacao: 'Palavra masculina não aceita o artigo "a", então não há fusão: "fui a pé".',
          dica: 'Crase precisa de artigo feminino.',
        }),
        completar('cr-p2-02', {
          nivel: 1,
          enunciado: 'Complete: Vou ___ pé até o trabalho.',
          opcoes: ['a', 'à'],
          correta: 0,
          explicacao: '"Pé" é masculino: a pé, sem crase.',
          dica: '"Pé" é masculino ou feminino?',
        }),
        certoErrado('cr-p2-03', {
          nivel: 2,
          enunciado: '"Começou à chover."',
          certo: false,
          explicacao: 'Antes de verbo não há crase: começou a chover.',
          dica: '"Chover" é um verbo.',
        }),
        escolha('cr-p2-04', {
          nivel: 2,
          enunciado: 'Qual está correta?',
          opcoes: ['Comprei a prazo.', 'Comprei à prazo.'],
          correta: 0,
          explicacao: '"Prazo" é masculino: a prazo.',
          dica: '"Prazo" é masculino.',
          armadilha: ARMADILHA_MASCULINO,
        }),
        completar('cr-p2-05', {
          nivel: 2,
          enunciado: 'Complete: Estou disposto ___ ajudar.',
          opcoes: ['a', 'à'],
          correta: 0,
          explicacao: 'Antes de verbo no infinitivo não há crase: disposto a ajudar.',
          dica: '"Ajudar" é um verbo.',
        }),
        certoErrado('cr-p2-06', {
          nivel: 3,
          enunciado: '"Ela chegou à tempo para a reunião."',
          certo: false,
          explicacao: '"Tempo" é masculino, então não há crase: chegou a tempo.',
          dica: '"Tempo" é masculino ou feminino?',
          armadilha: ARMADILHA_MASCULINO,
        }),
        escolha('cr-p2-07', {
          nivel: 3,
          enunciado: 'Em qual frase a crase está INCORRETA?',
          opcoes: ['Fui à praia.', 'Falei à diretora.', 'Saí à cavalo.'],
          correta: 2,
          explicacao: '"Cavalo" é masculino: saí a cavalo.',
          dica: 'Procure a palavra masculina.',
          armadilha: ARMADILHA_MASCULINO,
        }),
        escolha('cr-p2-08', {
          nivel: 4,
          enunciado: 'Complete: Ela se dedicou ___ estudos e ___ leitura.',
          opcoes: ['aos / à', 'à / à', 'aos / a'],
          correta: 0,
          explicacao: 'Dedicar-se a: aos estudos (a + os, masculino) e à leitura (a + a, feminino).',
          dica: 'Analise cada palavra separadamente: "estudos" e "leitura".',
        }),
      ],
    },
    {
      id: 'p3',
      nome: 'Locuções com crase',
      questoes: [
        certoErrado('cr-p3-01', {
          nivel: 1,
          enunciado: 'Locuções femininas como "à noite" e "às vezes" levam crase.',
          certo: true,
          explicacao: 'Locuções adverbiais formadas por palavra feminina levam crase: à noite, às vezes, às pressas.',
          dica: 'Lembre de "à noite".',
        }),
        completar('cr-p3-02', {
          nivel: 1,
          enunciado: 'Complete: Estudo ___ noite, depois do trabalho.',
          opcoes: ['a', 'à'],
          correta: 1,
          explicacao: 'Locução adverbial feminina: à noite.',
          dica: '"À noite" é uma locução.',
        }),
        completar('cr-p3-03', {
          nivel: 2,
          enunciado: 'Complete: ___ vezes, revejo a matéria no ônibus.',
          opcoes: ['As', 'Às', 'A'],
          correta: 1,
          explicacao: 'Locução adverbial feminina no plural: às vezes.',
          dica: 'É a mesma locução de "às vezes eu estudo".',
        }),
        escolha('cr-p3-04', {
          nivel: 2,
          enunciado: 'Qual está correta?',
          opcoes: ['Paguei à vista.', 'Paguei a vista.'],
          correta: 0,
          explicacao: '"À vista" (forma de pagamento) é locução feminina: leva crase.',
          dica: 'É uma locução feminina.',
        }),
        certoErrado('cr-p3-05', {
          nivel: 2,
          enunciado: '"Saiu às pressas."',
          certo: true,
          explicacao: 'Locução feminina no plural: às pressas.',
          dica: 'Pense em "às vezes".',
        }),
        completar('cr-p3-06', {
          nivel: 3,
          enunciado: 'Complete: ___ medida que estudo, aprendo mais.',
          opcoes: ['A', 'À'],
          correta: 1,
          explicacao: '"À medida que" indica proporção e leva crase.',
          dica: 'É uma locução feminina.',
          armadilha: 'não confunda "à medida que" (proporção) com "na medida em que" (causa).',
        }),
        escolha('cr-p3-07', {
          nivel: 3,
          enunciado: 'Em qual frase falta a crase?',
          opcoes: ['Fiquei a toa o dia todo.', 'Fui a pé.', 'Comecei a estudar.'],
          correta: 0,
          explicacao:
            '"À toa" é locução feminina: fiquei à toa. "A pé" (masculino) e "a estudar" (verbo) estão certos.',
          dica: 'Procure a locução feminina.',
        }),
        certoErrado('cr-p3-08', {
          nivel: 4,
          enunciado: '"Ficou frente a frente com o problema."',
          certo: true,
          explicacao: 'Entre palavras repetidas não há crase: frente a frente, cara a cara, gota a gota.',
          dica: 'Repare que a palavra se repete.',
          armadilha: 'entre palavras repetidas nunca há crase, mesmo que sejam femininas.',
        }),
      ],
    },
    {
      id: 'p4',
      nome: 'Horas e datas',
      questoes: [
        certoErrado('cr-p4-01', {
          nivel: 1,
          enunciado: 'Em horários, como "às 8h", usa-se crase.',
          certo: true,
          explicacao: 'Horas são femininas e admitem artigo: às 8h (a + as).',
          dica: '"Hora" é palavra feminina.',
        }),
        completar('cr-p4-02', {
          nivel: 1,
          enunciado: 'Complete: A prova começa ___ 9h.',
          opcoes: ['as', 'às', 'a'],
          correta: 1,
          explicacao: 'Horário determinado: às 9h.',
          dica: 'Começa "a" + "as" nove horas.',
        }),
        completar('cr-p4-03', {
          nivel: 2,
          enunciado: 'Complete: A reunião será ___ uma hora da tarde.',
          opcoes: ['a', 'à'],
          correta: 1,
          explicacao: '"Uma hora" indicando horário: à uma hora (à 1h).',
          dica: 'É um horário, como "às duas".',
        }),
        escolha('cr-p4-04', {
          nivel: 2,
          modo: 'confirmar',
          enunciado: 'Qual está correta?',
          opcoes: ['Atendemos das 8h às 18h.', 'Atendemos das 8h as 18h.', 'Atendemos de 8h às 18h.'],
          correta: 0,
          explicacao: 'Com "das" no início, usa-se "às" no fim. Com "de", usa-se "a": de 8h a 18h.',
          dica: 'Os dois lados precisam combinar.',
          armadilha: ARMADILHA_HORAS,
        }),
        certoErrado('cr-p4-05', {
          nivel: 3,
          enunciado: '"Estudei de 8h às 12h."',
          certo: false,
          explicacao: 'Sem artigo no início ("de"), não há artigo no fim: de 8h a 12h.',
          dica: 'O início tem "de" ou "das"?',
          armadilha: ARMADILHA_HORAS,
        }),
        certoErrado('cr-p4-06', {
          nivel: 3,
          enunciado: '"Espero desde às 7h."',
          certo: false,
          explicacao: 'Depois de "desde" não cabe outra preposição: desde as 7h.',
          dica: '"Desde" já é uma preposição.',
          armadilha: 'após, desde, para, entre: depois delas, o horário fica sem crase.',
        }),
        escolha('cr-p4-07', {
          nivel: 3,
          enunciado: 'Em qual frase a crase está correta?',
          opcoes: ['Chegarei às 10h.', 'Chegarei após às 10h.', 'Chegarei para às 10h.'],
          correta: 0,
          explicacao: 'Só em "chegarei às 10h". Depois de "após" e "para", o horário fica sem crase.',
          dica: 'Procure a frase sem outra preposição antes do horário.',
        }),
        escolha('cr-p4-08', {
          nivel: 4,
          enunciado: 'Complete: Ficou de plantão ___ duas ___ quatro.',
          opcoes: ['das / às', 'de / às', 'das / as'],
          correta: 0,
          explicacao: 'Com "das" no início, "às" no fim: das duas às quatro.',
          dica: 'Os dois lados precisam combinar.',
          armadilha: ARMADILHA_HORAS,
        }),
      ],
    },
    {
      id: 'p5',
      nome: 'Pronomes',
      questoes: [
        certoErrado('cr-p5-01', {
          nivel: 1,
          enunciado: '"Entreguei o convite a ela."',
          certo: true,
          explicacao: 'Pronomes pessoais, como "ela", não admitem artigo: sem crase.',
          dica: '"Ela" é um pronome pessoal.',
        }),
        completar('cr-p5-02', {
          nivel: 2,
          enunciado: 'Complete: Refiro-me ___ questão de ontem.',
          opcoes: ['aquela', 'àquela'],
          correta: 1,
          explicacao: 'Refiro-me a + aquela = àquela.',
          dica: 'Quem se refere, refere-se "a" algo.',
        }),
        certoErrado('cr-p5-03', {
          nivel: 2,
          enunciado: '"Dei o recado à você."',
          certo: false,
          explicacao: '"Você" não admite artigo: dei o recado a você.',
          dica: '"Você" aceita artigo antes?',
        }),
        escolha('cr-p5-04', {
          nivel: 2,
          enunciado: 'Qual está correta?',
          opcoes: ['Fiz referência àquilo.', 'Fiz referência aquilo.'],
          correta: 0,
          explicacao: 'Referência a + aquilo = àquilo.',
          dica: '"Referência" pede a preposição "a".',
        }),
        certoErrado('cr-p5-05', {
          nivel: 3,
          enunciado: '"Encaminhei o pedido a Vossa Excelência."',
          certo: true,
          explicacao: 'Pronomes de tratamento como "Vossa Excelência" não admitem artigo: sem crase.',
          dica: 'Pronomes de tratamento aceitam artigo?',
          armadilha: 'as exceções são "senhora" e "senhorita", que admitem artigo: "à senhora".',
        }),
        completar('cr-p5-06', {
          nivel: 3,
          enunciado: 'Complete: Peço ___ senhora que aguarde.',
          opcoes: ['a', 'à'],
          correta: 1,
          explicacao: '"Senhora" admite artigo: peço à senhora.',
          dica: '"Senhora" é exceção entre os pronomes de tratamento.',
        }),
        escolha('cr-p5-07', {
          nivel: 3,
          enunciado: 'Em qual frase a crase está INCORRETA?',
          opcoes: ['Disse àquele aluno.', 'Contei à ela.', 'Pedi à senhora.'],
          correta: 1,
          explicacao: '"Ela" é pronome pessoal: contei a ela.',
          dica: 'Procure o pronome pessoal.',
        }),
        certoErrado('cr-p5-08', {
          nivel: 4,
          enunciado: '"Não me refiro a esta lei, mas àquela."',
          certo: true,
          explicacao: '"Esta" não admite artigo (sem crase). "Àquela" é a + aquela.',
          dica: 'Analise "esta" e "aquela" separadamente.',
        }),
      ],
    },
    {
      id: 'p6',
      nome: 'Casos facultativos',
      questoes: [
        certoErrado('cr-p6-01', {
          nivel: 1,
          enunciado: 'Antes de pronome possessivo feminino, como "minha", a crase é opcional.',
          certo: true,
          explicacao: 'O artigo é opcional antes de possessivo: "entreguei à minha mãe" ou "entreguei a minha mãe".',
          dica: 'Pode-se dizer "a minha mãe" e "minha mãe".',
        }),
        escolha('cr-p6-02', {
          nivel: 2,
          modo: 'confirmar',
          enunciado: '"Entreguei à minha mãe" e "Entreguei a minha mãe" estão corretas. Por quê?',
          opcoes: [
            'Porque o artigo antes de possessivo é opcional.',
            'Porque "mãe" é palavra masculina.',
            'Porque a crase nunca é obrigatória.',
          ],
          correta: 0,
          explicacao: 'Antes de possessivo feminino, o artigo é opcional. Com artigo, há crase; sem artigo, não.',
          dica: 'O que muda entre as duas frases é a presença do artigo.',
        }),
        certoErrado('cr-p6-03', {
          nivel: 2,
          enunciado: 'Antes de nome próprio feminino de pessoa, como "Ana", a crase é opcional.',
          certo: true,
          explicacao: 'O artigo antes de nome de pessoa é opcional: "à Ana" ou "a Ana".',
          dica: 'Pode-se dizer "a Ana chegou" e "Ana chegou".',
        }),
        escolha('cr-p6-04', {
          nivel: 2,
          modo: 'confirmar',
          enunciado: 'Depois de "até", antes de palavra feminina, a crase é:',
          opcoes: ['Opcional: "até a praia" ou "até à praia".', 'Obrigatória.', 'Proibida.'],
          correta: 0,
          explicacao: 'Depois de "até", a crase é facultativa: as duas formas estão corretas.',
          dica: '"Até" pode vir com ou sem a preposição "a".',
        }),
        certoErrado('cr-p6-05', {
          nivel: 3,
          enunciado: '"Voltei à casa cedo."',
          certo: false,
          explicacao: '"Casa" no sentido de lar, sem especificação, não leva artigo: voltei a casa.',
          dica: 'A casa foi especificada?',
          armadilha: '"casa" (lar) só leva crase quando especificada: "voltei à casa dos meus pais".',
        }),
        escolha('cr-p6-06', {
          nivel: 3,
          enunciado: 'Qual está correta?',
          opcoes: ['Voltei à casa dos meus pais.', 'Voltei a casa dos meus pais.'],
          correta: 0,
          explicacao: 'Com especificação ("dos meus pais"), "casa" leva artigo: voltei à casa dos meus pais.',
          dica: 'Agora a casa foi especificada.',
        }),
        certoErrado('cr-p6-07', {
          nivel: 3,
          enunciado: '"Os marinheiros voltaram à terra."',
          certo: false,
          explicacao: '"Terra" como terra firme (oposto de mar) não leva artigo: voltaram a terra.',
          dica: 'É terra firme ou uma terra especificada?',
          armadilha: 'com especificação, há crase: "voltou à terra natal".',
        }),
        escolha('cr-p6-08', {
          nivel: 4,
          enunciado: 'Em qual frase a crase é OBRIGATÓRIA (e não opcional)?',
          opcoes: ['Entreguei à minha irmã.', 'Falei à Joana.', 'Fui à casa de Pedro.'],
          correta: 2,
          explicacao:
            '"Casa" especificada exige artigo: crase obrigatória. Antes de possessivo e de nome de pessoa, ela é opcional.',
          dica: 'Duas delas são casos facultativos.',
        }),
      ],
    },
  ],
  // Farol do módulo: estilo Cebraspe (julgar o item) e FGV (assinalar a opção), misturando as 6 partes.
  farol: [
    certoErrado('cr-farol-01', {
      nivel: 3,
      enunciado:
        'Em "O servidor entregou o relatório à chefe do setor", o acento grave é obrigatório, pois "entregar" exige a preposição "a" e "chefe" está antecedida de artigo feminino.',
      certo: true,
      explicacao: 'Entregou o relatório ao chefe → à chefe. Preposição exigida pelo verbo mais artigo feminino: crase.',
      dica: 'Faça o teste do "ao".',
    }),
    escolha('cr-farol-02', {
      nivel: 4,
      enunciado: 'Assinale a opção em que o acento grave foi empregado corretamente.',
      opcoes: [
        'O edital vale à partir de hoje.',
        'Os candidatos responderam à prova com calma.',
        'Ela começou à estudar cedo.',
        'O pagamento será feito à prazo.',
        'Ficou frente à frente com o fiscal.',
      ],
      correta: 1,
      explicacao:
        'Responder a algo: responderam ao questionário → à prova. Nas outras, há verbo ("partir", "estudar"), palavra masculina ("prazo") ou palavras repetidas ("frente a frente").',
      dica: 'Elimine as opções com verbo, palavra masculina ou palavra repetida.',
      armadilha: 'a banca gosta de juntar várias regras de "nunca há crase" na mesma questão.',
    }),
    certoErrado('cr-farol-03', {
      nivel: 3,
      enunciado:
        'Em "O concurso foi adiado às pressas, à medida que surgiam denúncias", os dois acentos graves estão corretos.',
      certo: true,
      explicacao: '"Às pressas" e "à medida que" são locuções femininas e levam crase.',
      dica: 'As duas expressões são locuções.',
    }),
    certoErrado('cr-farol-04', {
      nivel: 4,
      enunciado:
        'A frase "As inscrições ficam abertas de segunda a sexta, das 9h as 17h" está correta quanto ao emprego do acento grave.',
      certo: false,
      explicacao: 'Com "das" no início, o fim precisa de "às": das 9h às 17h. "De segunda a sexta" está correto.',
      dica: 'Confira se os dois lados de cada par combinam.',
      armadilha: ARMADILHA_HORAS,
    }),
    completar('cr-farol-05', {
      nivel: 3,
      enunciado: 'Complete: O atendimento vai ___ 8h ___ 14h, e a prova começa ___ 15h.',
      opcoes: ['das / às / às', 'de / às / às', 'das / as / às', 'das / às / as'],
      correta: 0,
      explicacao: 'Das 8h às 14h (o par combina) e começa às 15h (horário determinado).',
      dica: 'Comece pelo par "das... às".',
    }),
    certoErrado('cr-farol-06', {
      nivel: 4,
      enunciado:
        'Em "Encaminhei o recurso à Vossa Senhoria", o acento grave está correto, pois o pronome de tratamento é feminino.',
      certo: false,
      explicacao: 'Pronomes de tratamento não admitem artigo: encaminhei o recurso a Vossa Senhoria.',
      dica: 'Pronomes de tratamento aceitam artigo?',
      armadilha: 'a forma feminina engana: só "senhora" e "senhorita" admitem artigo.',
    }),
    escolha('cr-farol-07', {
      nivel: 4,
      enunciado: 'Assinale a frase em que o acento grave é obrigatório.',
      opcoes: [
        'Refiro-me àquele artigo da lei.',
        'Entreguei o documento à minha chefe.',
        'Fui até à secretaria.',
        'Enviei o convite à Mariana.',
      ],
      correta: 0,
      explicacao:
        'Refiro-me a + aquele = àquele: obrigatório. Antes de possessivo, depois de "até" e antes de nome de pessoa, a crase é opcional.',
      dica: 'Três opções são casos facultativos.',
    }),
    certoErrado('cr-farol-08', {
      nivel: 3,
      enunciado: 'Em "Os candidatos voltaram a casa depois da prova", a ausência do acento grave está correta.',
      certo: true,
      explicacao: '"Casa" no sentido de lar, sem especificação, não leva artigo: voltaram a casa.',
      dica: 'A casa foi especificada?',
    }),
    certoErrado('cr-farol-09', {
      nivel: 3,
      enunciado: 'Em "Ele se candidatou a vaga de analista", falta o acento grave antes de "vaga".',
      certo: true,
      explicacao: 'Candidatou-se ao cargo → candidatou-se à vaga. Falta a crase.',
      dica: 'Troque "vaga" por "cargo".',
    }),
    escolha('cr-farol-10', {
      nivel: 3,
      enunciado: 'Assinale a opção em que o acento grave foi empregado incorretamente.',
      opcoes: ['Chegou à tempo da prova.', 'Saiu às pressas.', 'Voltou à casa dos pais.', 'Assistiu à aula inteira.'],
      correta: 0,
      explicacao: '"Tempo" é masculino: chegou a tempo. As demais estão corretas.',
      dica: 'Procure a palavra masculina.',
      armadilha: ARMADILHA_MASCULINO,
    }),
  ],
};
